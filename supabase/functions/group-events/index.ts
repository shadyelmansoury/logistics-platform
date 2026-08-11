// Gameya group events — invoked by database triggers (via pg_net) whenever
// someone requests to join a group or becomes a member. Sends the group's
// admin an email + SMS and logs an in-app notification. The trigger passes
// the same shared secret the cron job uses.
import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const secret = Deno.env.get("CRON_SECRET");
  if (!secret || req.headers.get("x-cron-secret") !== secret) {
    return new Response("unauthorized", { status: 401 });
  }

  const { type, group_id, user_id } = await req.json().catch(() => ({}));
  if (!["join_request", "member_joined"].includes(type) || !group_id || !user_id) {
    return new Response("bad request", { status: 400 });
  }

  const sb = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: group } = await sb.from("groups")
    .select("name, admin_id").eq("id", group_id).single();
  // No group, or the actor is the admin themselves (e.g. group creation)
  if (!group || group.admin_id === user_id) {
    return Response.json({ ok: true, skipped: true });
  }

  const [{ data: actor }, { data: admin }] = await Promise.all([
    sb.from("profiles").select("name").eq("id", user_id).single(),
    sb.from("profiles").select("name, email, phone").eq("id", group.admin_id).single(),
  ]);
  if (!admin) return Response.json({ ok: true, skipped: true });

  const actorName = actor?.name || "A member";
  const appUrl = Deno.env.get("APP_URL") ?? "https://gameya.netlify.app";
  const isRequest = type === "join_request";

  const subject = isRequest
    ? `Gameya: ${actorName} asked to join ${group.name} — طلب انضمام جديد`
    : `Gameya: ${actorName} joined ${group.name} — عضو جديد انضم`;
  const html = isRequest
    ? `<p>«${actorName}» طلب الانضمام لجمعية «${group.name}» — راجع الطلب ووافق أو ارفض من التطبيق.</p>
       <p><b>${actorName}</b> asked to join “${group.name}”. Review and approve or
       reject the request in the app.</p>
       <p><a href="${appUrl}">${appUrl}</a></p>`
    : `<p>«${actorName}» بقى عضو في جمعية «${group.name}».</p>
       <p><b>${actorName}</b> is now a member of “${group.name}”.</p>
       <p><a href="${appUrl}">${appUrl}</a></p>`;
  const smsBody = isRequest
    ? `Gameya: ${actorName} asked to join "${group.name}". Review the request in the app: ${appUrl}`
    : `Gameya: ${actorName} is now a member of "${group.name}". ${appUrl}`;

  const results: Record<string, string> = {};
  const log = async (channel: string, status: string, detail: string) => {
    await sb.from("notification_log").insert({
      kind: type, group_id, user_id: group.admin_id,
      channel, status, detail: detail.slice(0, 300),
    });
    results[channel] = status;
  };

  // In-app (detail carries the actor's name for the bell message)
  await log("inapp", "sent", actorName);

  // Email
  const resendKey = Deno.env.get("RESEND_API_KEY") ?? "";
  if (resendKey && admin.email) {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: Deno.env.get("EMAIL_FROM") ?? "Gameya <onboarding@resend.dev>",
        to: [admin.email], subject, html,
      }),
    });
    await log("email", r.ok ? "sent" : "failed", r.ok ? actorName : await r.text());
  } else {
    await log("email", "skipped", "email not configured");
  }

  // SMS
  const sid = Deno.env.get("TWILIO_ACCOUNT_SID") ?? "";
  const token = Deno.env.get("TWILIO_AUTH_TOKEN") ?? "";
  const from = Deno.env.get("TWILIO_FROM") ?? "";
  if (sid && token && from && admin.phone) {
    const r = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: "Basic " + btoa(`${sid}:${token}`),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ To: admin.phone, From: from, Body: smsBody }),
    });
    await log("sms", r.ok ? "sent" : "failed", r.ok ? actorName : await r.text());
  } else {
    await log("sms", "skipped", "sms not configured");
  }

  return Response.json({ ok: true, type, ...results });
});
