// Gameya group events — invoked by database triggers (via pg_net) on group
// and account activity. Per platform policy, admins are notified by SMS +
// in-app only (no email); users get SMS + in-app when an admin approves
// their registration or their request to join a group.
import { createClient } from "npm:@supabase/supabase-js@2";

type Profile = { id: string; name: string; phone: string };

Deno.serve(async (req) => {
  const secret = Deno.env.get("CRON_SECRET");
  if (!secret || req.headers.get("x-cron-secret") !== secret) {
    return new Response("unauthorized", { status: 401 });
  }

  const { type, group_id, user_id } = await req.json().catch(() => ({}));
  const KINDS = ["join_request", "member_joined", "account_pending", "account_approved"];
  if (!KINDS.includes(type) || !user_id) {
    return new Response("bad request", { status: 400 });
  }

  const sb = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const appUrl = Deno.env.get("APP_URL") ?? "https://gameya.netlify.app";

  const sid = Deno.env.get("TWILIO_ACCOUNT_SID") ?? "";
  const token = Deno.env.get("TWILIO_AUTH_TOKEN") ?? "";
  const from = Deno.env.get("TWILIO_FROM") ?? "";
  const sendSms = async (to: string, body: string) => {
    if (!sid || !token || !from) return { status: "skipped", detail: "sms not configured" };
    if (!to) return { status: "skipped", detail: "no phone number" };
    const r = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: "Basic " + btoa(`${sid}:${token}`),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ To: to, From: from, Body: body }),
    });
    return { status: r.ok ? "sent" : "failed", detail: r.ok ? "" : (await r.text()).slice(0, 250) };
  };

  const log = (row: Record<string, unknown>) => sb.from("notification_log").insert(row);

  // In-app + SMS to one person
  const notifyPerson = async (
    kind: string, person: Profile | null, gid: string | null,
    inappDetail: string, smsBody: string,
  ) => {
    if (!person) return;
    await log({ kind, group_id: gid, user_id: person.id, channel: "inapp", status: "sent", detail: inappDetail });
    const res = await sendSms(person.phone, smsBody);
    await log({ kind, group_id: gid, user_id: person.id, channel: "sms", ...res });
  };

  const getProfile = async (id: string): Promise<Profile | null> => {
    const { data } = await sb.from("profiles").select("id, name, phone").eq("id", id).single();
    return data as Profile | null;
  };

  // ── Account lifecycle events ──
  if (type === "account_pending") {
    const actor = await getProfile(user_id);
    const { data: admins } = await sb.from("profiles").select("id, name, phone").eq("role", "admin");
    for (const admin of (admins ?? []) as Profile[]) {
      await notifyPerson(
        "account_pending", admin, null,
        actor?.name || "A new user",
        `Gameya: ${actor?.name || "A new user"} registered and is awaiting your approval. ` +
        `مستخدم جديد في انتظار موافقتك. ${appUrl}`,
      );
    }
    return Response.json({ ok: true, type, admins: (admins ?? []).length });
  }

  if (type === "account_approved") {
    const actor = await getProfile(user_id);
    await notifyPerson(
      "account_approved", actor, null,
      "",
      `Gameya: your account has been approved — welcome! You can now browse groups and ask to join. ` +
      `تمت الموافقة على حسابك، أهلاً بيك! ${appUrl}`,
    );
    return Response.json({ ok: true, type });
  }

  // ── Group events ──
  if (!group_id) return new Response("bad request", { status: 400 });
  const { data: group } = await sb.from("groups").select("name, admin_id").eq("id", group_id).single();
  if (!group || group.admin_id === user_id) return Response.json({ ok: true, skipped: true });

  const [actor, admin] = await Promise.all([getProfile(user_id), getProfile(group.admin_id)]);
  const actorName = actor?.name || "A member";

  if (type === "join_request") {
    await notifyPerson(
      "join_request", admin, group_id,
      actorName,
      `Gameya: ${actorName} asked to join "${group.name}". Review the request in the app. ` +
      `طلب انضمام جديد لجمعية «${group.name}». ${appUrl}`,
    );
    return Response.json({ ok: true, type });
  }

  // member_joined: the admin hears someone joined; the user hears they're in
  await notifyPerson(
    "member_joined", admin, group_id,
    actorName,
    `Gameya: ${actorName} is now a member of "${group.name}". ${appUrl}`,
  );
  await notifyPerson(
    "join_approved", actor, group_id,
    "",
    `Gameya: you've been approved to join "${group.name}"! Open the app to see the group ` +
    `and pick your payout month. تمت الموافقة على انضمامك لجمعية «${group.name}» — اختار شهرك. ${appUrl}`,
  );
  return Response.json({ ok: true, type });
});
