// Gameya admin-create-user — a platform admin creates a member account on
// behalf of someone who can't sign up themselves. Runs with the service role,
// but only after verifying the caller is a platform admin. The new account is
// pre-approved (admin_created flag), so no "pending approval" alert fires.
import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (obj: unknown, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const jwt = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
  if (!jwt) return json({ error: "unauthorized" }, 401);

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Identify the caller and require the platform-admin role.
  const { data: { user: caller }, error: uErr } = await admin.auth.getUser(jwt);
  if (uErr || !caller) return json({ error: "unauthorized" }, 401);
  const { data: prof } = await admin.from("profiles").select("role").eq("id", caller.id).single();
  if (prof?.role !== "admin") return json({ error: "forbidden" }, 403);

  const body = await req.json().catch(() => ({}));
  const firstName = String(body.firstName || "").trim();
  const lastName = String(body.lastName || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const phone = String(body.phone || "").trim();
  const etransfer = String(body.etransferEmail || email).trim().toLowerCase();
  const password = String(body.password || "");
  if (!firstName || !lastName || !email || !password) return json({ error: "missing_fields" }, 400);
  if (password.length < 8) return json({ error: "weak_password" }, 400);

  const { data: created, error: cErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      first_name: firstName, last_name: lastName, phone,
      etransfer_email: etransfer, admin_created: "true",
    },
  });
  if (cErr) {
    if (/already|registered|exists|duplicate/i.test(cErr.message || "")) return json({ error: "email_taken" }, 409);
    return json({ error: cErr.message || "create_failed" }, 400);
  }

  const newId = created.user!.id;
  // The handle_new_user trigger creates the profile (approved via admin_created);
  // make sure the fields and approval are set even if metadata parsing lagged.
  await admin.from("profiles").update({
    approved: true, name: `${firstName} ${lastName}`.trim(),
    first_name: firstName, last_name: lastName, phone, etransfer_email: etransfer,
  }).eq("id", newId);

  return json({ ok: true, userId: newId }, 200);
});
