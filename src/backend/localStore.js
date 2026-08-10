// Demo backend: everything lives in this browser's localStorage.
// Used automatically when no Supabase keys are configured, so the app
// always runs — as a single-browser demo.

import { memberOf, hasRequested, monthsOf, groupById, validateGroupPatch } from './helpers.js';

const DB_KEY = 'gameea_db_v1';

const seed = () => ({ users: [], groups: [], session: null });

const loadDB = () => {
  try {
    const raw = localStorage.getItem(DB_KEY);
    return raw ? JSON.parse(raw) : seed();
  } catch {
    return seed();
  }
};

let db = loadDB();
let listeners = [];

const commit = () => {
  db = { ...db };
  try { localStorage.setItem(DB_KEY, JSON.stringify(db)); } catch { /* storage full/blocked */ }
  listeners.forEach((l) => l());
};

export const subscribe = (l) => {
  listeners.push(l);
  return () => { listeners = listeners.filter((x) => x !== l); };
};
export const getDB = () => db;
export const init = () => {};

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

async function hashPassword(password) {
  if (globalThis.crypto?.subtle) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password));
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  // Non-secure-context fallback (e.g. plain http) — demo only
  let h = 0;
  for (const ch of password) h = ((h * 31) + ch.charCodeAt(0)) | 0;
  return 'weak_' + h.toString(16);
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function register({ name, email, phone, password }) {
  const normEmail = email.trim().toLowerCase();
  if (db.users.some((u) => u.email === normEmail)) throw new Error('emailTaken');
  const user = {
    id: uid(),
    name: name.trim(),
    email: normEmail,
    phone: phone.trim(),
    passwordHash: await hashPassword(password),
    createdAt: Date.now(),
  };
  db.users = [...db.users, user];
  db.session = user.id;
  commit();
  return { user, needsConfirmation: false };
}

export async function login(email, password) {
  const normEmail = email.trim().toLowerCase();
  const hash = await hashPassword(password);
  const user = db.users.find((u) => u.email === normEmail && u.passwordHash === hash);
  if (!user) throw new Error('invalidCreds');
  db.session = user.id;
  commit();
  return user;
}

export function logout() {
  db.session = null;
  commit();
}

// ─── Group mutations ──────────────────────────────────────────────────────────

export async function createGroup({ name, description, amount, currency, maxMembers, startMonth, adminId }) {
  const group = {
    id: uid(),
    name: name.trim(),
    description: (description || '').trim(),
    amount: Number(amount),
    currency,
    maxMembers: Number(maxMembers),
    startMonth,
    adminId,
    createdAt: Date.now(),
    members: [{ userId: adminId, month: null, joinedAt: Date.now() }],
    joinRequests: [],
    payments: {},
  };
  db.groups = [...db.groups, group];
  commit();
  return group;
}

const patchGroup = (groupId, fn) => {
  db.groups = db.groups.map((g) => (g.id === groupId ? fn({ ...g }) : g));
  commit();
};

export function requestJoin(groupId, userId) {
  patchGroup(groupId, (g) => {
    if (memberOf(g, userId) || hasRequested(g, userId)) return g;
    g.joinRequests = [...g.joinRequests, { userId, requestedAt: Date.now() }];
    return g;
  });
}

export function cancelRequest(groupId, userId) {
  patchGroup(groupId, (g) => {
    g.joinRequests = g.joinRequests.filter((r) => r.userId !== userId);
    return g;
  });
}

export function approveRequest(groupId, userId) {
  const g = groupById(db, groupId);
  if (g && g.members.length >= g.maxMembers) throw new Error('groupFull');
  patchGroup(groupId, (gr) => {
    if (!hasRequested(gr, userId) || memberOf(gr, userId)) return gr;
    gr.joinRequests = gr.joinRequests.filter((r) => r.userId !== userId);
    gr.members = [...gr.members, { userId, month: null, joinedAt: Date.now() }];
    return gr;
  });
}

export function rejectRequest(groupId, userId) {
  cancelRequest(groupId, userId);
}

export function pickMonth(groupId, userId, month) {
  patchGroup(groupId, (g) => {
    if (!monthsOf(g).includes(month)) return g;
    if (g.members.some((m) => m.month === month && m.userId !== userId)) return g;
    g.members = g.members.map((m) => (m.userId === userId ? { ...m, month } : m));
    return g;
  });
}

export function removeMember(groupId, userId) {
  patchGroup(groupId, (g) => {
    g.members = g.members.filter((m) => m.userId !== userId);
    const payments = {};
    for (const [month, payers] of Object.entries(g.payments)) {
      const { [userId]: _removed, ...rest } = payers;
      payments[month] = rest;
    }
    g.payments = payments;
    return g;
  });
}

export function updateGroup(groupId, patch) {
  const g = groupById(db, groupId);
  if (!g) return;
  const next = validateGroupPatch(g, patch);
  patchGroup(groupId, () => next);
}

export function deleteGroup(groupId) {
  db.groups = db.groups.filter((g) => g.id !== groupId);
  commit();
}

export function togglePaid(groupId, month, payerId) {
  patchGroup(groupId, (g) => {
    const monthPay = { ...(g.payments[month] || {}) };
    if (monthPay[payerId]) delete monthPay[payerId];
    else monthPay[payerId] = Date.now();
    g.payments = { ...g.payments, [month]: monthPay };
    return g;
  });
}
