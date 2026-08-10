// Real backend: Supabase (Postgres + Auth + Realtime).
// Active when VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.
// Maintains a client-side cache in the exact same shape as the local demo
// store, refreshed after every mutation and on realtime change events —
// the UI code is identical for both backends.

import { createClient } from '@supabase/supabase-js';
import { groupById, validateGroupPatch } from './helpers.js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const hasSupabase = Boolean(url && anonKey);

const sb = hasSupabase ? createClient(url, anonKey) : null;

let db = { users: [], groups: [], session: null, loading: true };
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
    db = { users: [], groups: [], session: null, loading: false };
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
    id: p.id, name: p.name, email: p.email, phone: p.phone, createdAt: ts(p.created_at),
  }));

  const membersByGroup = {};
  for (const m of members.data || []) {
    (membersByGroup[m.group_id] ||= []).push({
      userId: m.user_id, month: m.month, joinedAt: ts(m.joined_at),
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
    createdAt: ts(g.created_at),
    members: (membersByGroup[g.id] || []).sort((a, b) => a.joinedAt - b.joinedAt),
    joinRequests: requestsByGroup[g.id] || [],
    payments: paymentsByGroup[g.id] || {},
  }));

  db = { users, groups: shaped, session: db.session, loading: false };
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

export async function init() {
  const { data: { session } } = await sb.auth.getSession();
  db = { ...db, session: session?.user?.id || null };
  await refresh();

  sb.auth.onAuthStateChange((_event, newSession) => {
    const id = newSession?.user?.id || null;
    if (id !== db.session) {
      db = { ...db, session: id };
      scheduleRefresh();
    }
  });

  sb.channel('gameea-db')
    .on('postgres_changes', { event: '*', schema: 'public' }, scheduleRefresh)
    .subscribe();

  window.addEventListener('focus', scheduleRefresh);
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function register({ name, email, phone, password }) {
  const { data, error } = await sb.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: {
      data: { name: name.trim(), phone: phone.trim() },
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
    db = { ...db, session: data.user.id };
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
  db = { ...db, session: data.user.id };
  await refresh();
  return data.user;
}

export function logout() {
  sb.auth.signOut().catch((e) => console.error(e));
  db = { users: [], groups: [], session: null, loading: false };
  notify();
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
  await run(sb.from('group_members').insert({ group_id: data.id, user_id: adminId }));
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
  if (g && g.members.length >= g.maxMembers) throw new Error('groupFull');
  (async () => {
    await run(sb.from('group_members').insert({ group_id: groupId, user_id: userId }));
    await run(sb.from('join_requests').delete().eq('group_id', groupId).eq('user_id', userId));
  })().catch(() => {});
}

export function rejectRequest(groupId, userId) {
  cancelRequest(groupId, userId);
}

export function pickMonth(groupId, userId, month) {
  run(
    sb.from('group_members').update({ month }).eq('group_id', groupId).eq('user_id', userId),
  ).catch(() => {});
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
