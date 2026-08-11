// Real backend: Supabase (Postgres + Auth + Realtime).
// Active when VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.
// Maintains a client-side cache in the exact same shape as the local demo
// store, refreshed after every mutation and on realtime change events —
// the UI code is identical for both backends.

import { createClient } from '@supabase/supabase-js';
import { groupById, validateGroupPatch, validateMonthPick, isGroupFull } from './helpers.js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const hasSupabase = Boolean(url && anonKey);

const sb = hasSupabase ? createClient(url, anonKey) : null;

let db = { users: [], groups: [], session: null, loading: true, mfaPending: false };
let mfaPendingFactorId = null;
let listeners = [];

const notify = () => listeners.forEach((l) => l());

export const subscribe = (l) => {
  listeners.push(l);
  return () => { listeners = listeners.filter((x) => x !== l); };
};
export const getDB = () => db;

const ts = (iso) => (iso ? new Date(iso).getTime() : null);

// ─── Cache refresh ────────────────────────────────────────────────────────────

async function refresh() {
  if (!db.session) {
    db = { ...db, users: [], groups: [], session: null, loading: false };
    notify();
    return;
  }
  const [profiles, groups, members, requests, payments] = await Promise.all([
    sb.from('profiles').select('*'),
    sb.from('groups').select('*'),
    sb.from('group_members').select('*'),
    sb.from('join_requests').select('*'),
    sb.from('payments').select('*'),
  ]);
  const firstError = [profiles, groups, members, requests, payments].find((r) => r.error)?.error;
  if (firstError) {
    console.error('Gameea refresh failed:', firstError.message);
    db = { ...db, loading: false };
    notify();
    return;
  }

  const users = (profiles.data || []).map((p) => ({
    id: p.id,
    name: p.name || `${p.first_name || ''} ${p.last_name || ''}`.trim(),
    firstName: p.first_name,
    lastName: p.last_name,
    email: p.email,
    phone: p.phone,
    etransferEmail: p.etransfer_email,
    role: p.role || 'member',
    createdAt: ts(p.created_at),
  }));

  const membersByGroup = {};
  for (const m of members.data || []) {
    (membersByGroup[m.group_id] ||= []).push({
      userId: m.user_id, month: m.month, share: Number(m.share) || 1, joinedAt: ts(m.joined_at),
    });
  }
  const requestsByGroup = {};
  for (const r of requests.data || []) {
    (requestsByGroup[r.group_id] ||= []).push({ userId: r.user_id, requestedAt: ts(r.requested_at) });
  }
  const paymentsByGroup = {};
  for (const p of payments.data || []) {
    const byMonth = (paymentsByGroup[p.group_id] ||= {});
    (byMonth[p.month] ||= {})[p.payer_id] = ts(p.paid_at);
  }

  const shaped = (groups.data || []).map((g) => ({
    id: g.id,
    name: g.name,
    description: g.description,
    amount: Number(g.amount),
    currency: g.currency,
    maxMembers: g.max_members,
    startMonth: g.start_month,
    adminId: g.admin_id,
    hidden: Boolean(g.hidden),
    disabled: Boolean(g.disabled),
    createdAt: ts(g.created_at),
    members: (membersByGroup[g.id] || []).sort((a, b) => a.joinedAt - b.joinedAt),
    joinRequests: requestsByGroup[g.id] || [],
    payments: paymentsByGroup[g.id] || {},
  }));

  db = { ...db, users, groups: shaped, loading: false };
  notify();
}

let refreshTimer = null;
const scheduleRefresh = () => {
  clearTimeout(refreshTimer);
  refreshTimer = setTimeout(() => refresh().catch((e) => console.error(e)), 250);
};

// Run a mutation, then re-sync. Errors are logged and the refresh restores
// the true server state, so a failed optimistic action self-corrects.
async function run(promise) {
  const { error } = await promise;
  if (error) console.error('Gameea mutation failed:', error.message);
  scheduleRefresh();
  if (error) throw new Error(error.message);
}

// ─── Init: session restore + realtime ────────────────────────────────────────

// A user with an enrolled 2FA factor holds only an "aal1" session after the
// password step; the app must not treat them as signed in until the TOTP
// code upgrades the session to "aal2".
async function evaluateSession() {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) {
    db = { ...db, session: null, mfaPending: false };
    return;
  }
  const { data: aal } = await sb.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal && aal.nextLevel === 'aal2' && aal.currentLevel !== 'aal2') {
    const { data: lf } = await sb.auth.mfa.listFactors();
    mfaPendingFactorId = lf?.totp?.find((f) => f.status === 'verified')?.id || null;
    db = { ...db, session: null, mfaPending: true };
  } else {
    db = { ...db, session: session.user.id, mfaPending: false };
  }
}

export async function init() {
  await evaluateSession();
  await refresh();

  sb.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_OUT') {
      db = { ...db, session: null, mfaPending: false };
      scheduleRefresh();
      return;
    }
    // Re-evaluate on sign-in / token refresh / MFA verification
    evaluateSession().then(() => scheduleRefresh()).catch((e) => console.error(e));
  });

  sb.channel('gameea-db')
    .on('postgres_changes', { event: '*', schema: 'public' }, scheduleRefresh)
    .subscribe();

  window.addEventListener('focus', scheduleRefresh);
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function register({ firstName, lastName, email, phone, etransferEmail, password }) {
  const normEmail = email.trim().toLowerCase();
  const { data, error } = await sb.auth.signUp({
    email: normEmail,
    password,
    options: {
      data: {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim(),
        etransfer_email: (etransferEmail || normEmail).trim().toLowerCase(),
      },
      emailRedirectTo: window.location.origin,
    },
  });
  if (error) {
    if (/already registered/i.test(error.message)) throw new Error('emailTaken');
    throw new Error(error.message);
  }
  // With email confirmation ON, Supabase returns an obfuscated user with no
  // identities for an email that already has an account.
  if (data.user && data.user.identities?.length === 0) throw new Error('emailTaken');
  if (data.session) {
    db = { ...db, session: data.user.id, mfaPending: false };
    await refresh();
    return { user: data.user, needsConfirmation: false };
  }
  return { user: data.user, needsConfirmation: true };
}

export async function login(email, password) {
  const { data, error } = await sb.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
  if (error) throw new Error('invalidCreds');
  await evaluateSession();
  if (db.mfaPending) {
    notify();
    return { mfaRequired: true };
  }
  await refresh();
  return { user: data.user };
}

// Second step of login for accounts with 2FA enabled.
export async function completeMfaLogin(code) {
  if (!mfaPendingFactorId) {
    const { data: lf } = await sb.auth.mfa.listFactors();
    mfaPendingFactorId = lf?.totp?.find((f) => f.status === 'verified')?.id || null;
  }
  await mfaChallengeVerify(mfaPendingFactorId, code);
  await evaluateSession();
  await refresh();
}

export function logout() {
  sb.auth.signOut().catch((e) => console.error(e));
  mfaPendingFactorId = null;
  db = { ...db, users: [], groups: [], session: null, loading: false, mfaPending: false };
  notify();
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export function updateProfile(userId, patch) {
  const name = `${patch.firstName || ''} ${patch.lastName || ''}`.trim();
  run(sb.from('profiles').update({
    first_name: patch.firstName,
    last_name: patch.lastName,
    phone: patch.phone,
    etransfer_email: (patch.etransferEmail || '').trim().toLowerCase(),
    ...(name ? { name } : {}),
  }).eq('id', userId)).catch(() => {});
}

// ─── Two-factor authentication (TOTP) ─────────────────────────────────────────

async function mfaChallengeVerify(factorId, code) {
  if (!factorId) throw new Error('badCode');
  const { data: challenge, error: e1 } = await sb.auth.mfa.challenge({ factorId });
  if (e1) throw new Error(e1.message);
  const { error: e2 } = await sb.auth.mfa.verify({ factorId, challengeId: challenge.id, code });
  if (e2) throw new Error('badCode');
}

export async function mfaStatus() {
  const { data, error } = await sb.auth.mfa.listFactors();
  if (error) throw new Error(error.message);
  const factor = data?.totp?.find((f) => f.status === 'verified') || null;
  return { enabled: Boolean(factor), factorId: factor?.id || null };
}

export async function mfaEnroll() {
  // Clear abandoned unverified enrollments so re-tries don't pile up
  const { data: lf } = await sb.auth.mfa.listFactors();
  for (const f of lf?.all || []) {
    if (f.status === 'unverified') {
      await sb.auth.mfa.unenroll({ factorId: f.id }).catch(() => {});
    }
  }
  const { data, error } = await sb.auth.mfa.enroll({ factorType: 'totp', friendlyName: 'Gam3ya' });
  if (error) throw new Error(error.message);
  return { factorId: data.id, qr: data.totp.qr_code, secret: data.totp.secret };
}

export async function mfaVerifyEnroll(factorId, code) {
  await mfaChallengeVerify(factorId, code);
}

export async function mfaUnenroll(factorId) {
  const { error } = await sb.auth.mfa.unenroll({ factorId });
  if (error) throw new Error(error.message);
}

// ─── Group mutations ──────────────────────────────────────────────────────────

export async function createGroup({ name, description, amount, currency, maxMembers, startMonth, adminId }) {
  const { data, error } = await sb.from('groups').insert({
    name: name.trim(),
    description: (description || '').trim(),
    amount: Number(amount),
    currency,
    max_members: Number(maxMembers),
    start_month: startMonth,
    admin_id: adminId,
  }).select().single();
  if (error) throw new Error(error.message);
  const { error: memberError } = await sb.from('group_members').insert({ group_id: data.id, user_id: adminId });
  if (memberError) console.error('Gam3ya: admin membership insert failed:', memberError.message);
  // Await the refresh so the caller can navigate straight to the new group
  await refresh();
  return { id: data.id };
}

export function requestJoin(groupId, userId) {
  run(sb.from('join_requests').insert({ group_id: groupId, user_id: userId })).catch(() => {});
}

export function cancelRequest(groupId, userId) {
  run(sb.from('join_requests').delete().eq('group_id', groupId).eq('user_id', userId)).catch(() => {});
}

export function approveRequest(groupId, userId) {
  const g = groupById(db, groupId);
  if (g && (isGroupFull(g) || g.members.length >= g.maxMembers * 2)) throw new Error('groupFull');
  (async () => {
    await run(sb.from('group_members').insert({ group_id: groupId, user_id: userId }));
    await run(sb.from('join_requests').delete().eq('group_id', groupId).eq('user_id', userId));
  })().catch(() => {});
}

export function rejectRequest(groupId, userId) {
  cancelRequest(groupId, userId);
}

export function pickMonth(groupId, userId, month, share = 1) {
  const g = groupById(db, groupId);
  let grantedShare = share;
  if (g) {
    try {
      grantedShare = validateMonthPick(g, userId, month, share);
    } catch {
      return; // cache says the month is taken; refresh will confirm
    }
  }
  run(
    sb.from('group_members').update({ month, share: grantedShare })
      .eq('group_id', groupId).eq('user_id', userId),
  ).catch(() => {});
}

export function setGroupHidden(groupId, hidden) {
  run(sb.from('groups').update({ hidden }).eq('id', groupId)).catch(() => {});
}

export function setGroupDisabled(groupId, disabled) {
  run(sb.from('groups').update({ disabled }).eq('id', groupId)).catch(() => {});
}

export async function adminDeleteUser(userId) {
  const { error } = await sb.rpc('admin_delete_user', { target: userId });
  scheduleRefresh();
  if (error) throw new Error(error.message);
}

export function removeMember(groupId, userId) {
  (async () => {
    await run(sb.from('payments').delete().eq('group_id', groupId).eq('payer_id', userId));
    await run(sb.from('group_members').delete().eq('group_id', groupId).eq('user_id', userId));
  })().catch(() => {});
}

export function updateGroup(groupId, patch) {
  const g = groupById(db, groupId);
  if (!g) return;
  validateGroupPatch(g, patch); // throws 'maxTooLow' synchronously, same as demo mode
  run(sb.from('groups').update({
    name: patch.name,
    description: patch.description,
    amount: patch.amount,
    max_members: patch.maxMembers,
    start_month: patch.startMonth,
  }).eq('id', groupId)).catch(() => {});
}

export function deleteGroup(groupId) {
  run(sb.from('groups').delete().eq('id', groupId)).catch(() => {});
}

export function togglePaid(groupId, month, payerId) {
  const g = groupById(db, groupId);
  const alreadyPaid = Boolean(g?.payments[month]?.[payerId]);
  const q = alreadyPaid
    ? sb.from('payments').delete().eq('group_id', groupId).eq('month', month).eq('payer_id', payerId)
    : sb.from('payments').insert({ group_id: groupId, month, payer_id: payerId });
  run(q).catch(() => {});
}
