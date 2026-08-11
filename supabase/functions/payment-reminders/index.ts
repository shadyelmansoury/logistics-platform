// Gameya payment reminders — runs daily via pg_cron.
// From the 2nd day of each scheduled month, every payer who hasn't confirmed
// their payment gets a reminder (email + SMS when providers are configured),
// and each group admin gets an overdue summary. Everything is logged to
// notification_log (which also drives the in-app alerts), deduplicated per
// person/channel/day, and reminders stop as soon as the payment is marked.
import { createClient } from "npm:@supabase/supabase-js@2";

type Overdue = {
  group_id: string; group_name: string; amount: number; currency: string;
  admin_id: string; month: string;
  user_id: string; user_name: string; email: string; phone: string; share: number;
};

Deno.serve(async (req) => {
  const secret = Deno.env.get("CRON_SECRET");
  if (!secret || req.headers.get("x-cron-secret") !== secret) {
    return new Response("unauthorized", { status: 401 });
  }

  const sb = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data, error } = await sb.rpc("overdue_payers");
  if (error) return new Response("rpc error: " + error.message, { status: 500 });
  const overdue = (data ?? []) as Overdue[];

  const resendKey = Deno.env.get("RESEND_API_KEY") ?? "";
  const emailFrom = Deno.env.get("EMAIL_FROM") ?? "Gameya <onboarding@resend.dev>";
  const twilioSid = Deno.env.get("TWILIO_ACCOUNT_SID") ?? "";
  const twilioToken = Deno.env.get("TWILIO_AUTH_TOKEN") ?? "";
  const twilioFrom = Deno.env.get("TWILIO_FROM") ?? "";
  const appUrl = Deno.env.get("APP_URL") ?? "https://gameya.netlify.app";

  // Already-sent (kind|channel|group|user|month) for today — don't repeat.
  // "Today" is Toronto time, matching the app and the overdue_payers() SQL.
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date());
  const { data: sentRows } = await sb.from("notification_log")
    .select("kind, channel, group_id, user_id, month").eq("sent_on", today);
  const sent = new Set((sentRows ?? []).map((r) =>
    [r.kind, r.channel, r.group_id, r.user_id, r.month].join("|")));

  const log = async (row: Record<string, unknown>) => {
    await sb.from("notification_log").insert({ ...row, sent_on: today });
  };
  const once = async (key: string[], fn: () => Promise<void>) => {
    if (sent.has(key.join("|"))) return;
    sent.add(key.join("|"));
    await fn();
  };

  const sendEmail = async (to: string, subject: string, html: string) => {
    if (!resendKey) return { status: "skipped", detail: "RESEND_API_KEY not configured" };
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: emailFrom, to: [to], subject, html }),
    });
    return r.ok
      ? { status: "sent", detail: "" }
      : { status: "failed", detail: (await r.text()).slice(0, 300) };
  };

  const sendSms = async (to: string, body: string) => {
    if (!twilioSid || !twilioToken || !twilioFrom) {
      return { status: "skipped", detail: "Twilio not configured" };
    }
    if (!to) return { status: "skipped", detail: "no phone number" };
    const r = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: "Basic " + btoa(`${twilioSid}:${twilioToken}`),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ To: to, From: twilioFrom, Body: body }),
      },
    );
    return r.ok
      ? { status: "sent", detail: "" }
      : { status: "failed", detail: (await r.text()).slice(0, 300) };
  };

  let processed = 0;

  // ── Per-payer reminders ──
  for (const o of overdue) {
    processed++;
    const base = { kind: "overdue_user", group_id: o.group_id, user_id: o.user_id, month: o.month };
    const money = `${o.amount} ${o.currency}`;

    await once(["overdue_user", "inapp", o.group_id, o.user_id, o.month], () =>
      log({ ...base, channel: "inapp", status: "sent", detail: money }));

    await once(["overdue_user", "email", o.group_id, o.user_id, o.month], async () => {
      const res = await sendEmail(
        o.email,
        `Gameya: payment overdue for ${o.group_name} — قسط الجمعية متأخر`,
        `<p>مرحباً ${o.user_name}،</p>
         <p>قسطك الشهري <b>${money}</b> لجمعية «${o.group_name}» عن شهر ${o.month} لسه متسجلش.
         من فضلك حوّل المبلغ وسجّل الدفع في التطبيق — التذكيرات بتقف أول ما تسجّل.</p>
         <p>Hi ${o.user_name}, your monthly payment of <b>${money}</b> for the group
         “${o.group_name}” (${o.month}) has not been confirmed yet. Please send it and
         mark it as paid in the app — reminders stop as soon as you do.</p>
         <p><a href="${appUrl}">${appUrl}</a></p>`,
      );
      await log({ ...base, channel: "email", ...res });
    });

    await once(["overdue_user", "sms", o.group_id, o.user_id, o.month], async () => {
      const res = await sendSms(
        o.phone,
        `Gameya: your payment of ${money} for "${o.group_name}" (${o.month}) is overdue. ` +
        `Please send it and mark it paid in the app: ${appUrl}`,
      );
      await log({ ...base, channel: "sms", ...res });
    });
  }

  // ── Per-admin overdue summaries ──
  const byAdmin = new Map<string, Overdue[]>();
  for (const o of overdue) {
    const list = byAdmin.get(o.admin_id) ?? [];
    list.push(o);
    byAdmin.set(o.admin_id, list);
  }

  for (const [adminId, items] of byAdmin) {
    const month = items[0].month;
    const groups = [...new Set(items.map((i) => i.group_name))].join(", ");
    const lines = items.map((i) => `${i.user_name} — ${i.group_name} (${i.amount} ${i.currency})`);

    await once(["overdue_admin", "inapp", items[0].group_id, adminId, month], () =>
      log({
        kind: "overdue_admin", group_id: items[0].group_id, user_id: adminId, month,
        channel: "inapp", status: "sent", detail: lines.join("; ").slice(0, 500),
      }));

    await once(["overdue_admin", "email", items[0].group_id, adminId, month], async () => {
      const { data: adminProfile } = await sb.from("profiles")
        .select("email, name").eq("id", adminId).single();
      if (!adminProfile?.email) return;
      const res = await sendEmail(
        adminProfile.email,
        `Gameya admin alert: ${items.length} unconfirmed payment(s) — ${groups}`,
        `<p>Hi ${adminProfile.name}, the following members have not confirmed their
         payment for ${month}:</p>
         <ul>${lines.map((l) => `<li>${l}</li>`).join("")}</ul>
         <p><a href="${appUrl}">${appUrl}</a></p>`,
      );
      await log({
        kind: "overdue_admin", group_id: items[0].group_id, user_id: adminId, month,
        channel: "email", ...res,
      });
    });
  }

  return Response.json({ ok: true, overdue: processed, admins: byAdmin.size });
});
