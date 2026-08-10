// ─── Data layer ───────────────────────────────────────────────────────────────
// Demo persistence backed by localStorage. All state lives in one "db" object;
// every mutation replaces the reference and notifies subscribers so React
// re-renders via useSyncExternalStore.

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
  return user;
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

export const currentUser = (d = db) => d.users.find((u) => u.id === d.session) || null;
export const userById = (d, id) => d.users.find((u) => u.id === id) || null;
export const groupById = (d, id) => d.groups.find((g) => g.id === id) || null;

// ─── Group helpers ────────────────────────────────────────────────────────────

export function monthsOf(group) {
  const [y, m] = group.startMonth.split('-').map(Number);
  return Array.from({ length: group.maxMembers }, (_, i) => {
    const d = new Date(y, m - 1 + i, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
}

export const nowMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export function groupStatus(group) {
  const full = group.members.length >= group.maxMembers;
  const allPicked = group.members.every((m) => m.month);
  if (!full || !allPicked) return 'forming';
  const months = monthsOf(group);
  if (nowMonth() > months[months.length - 1]) return 'completed';
  return 'active';
}

export const memberOf = (group, userId) => group.members.find((m) => m.userId === userId) || null;
export const isAdmin = (group, userId) => group.adminId === userId;
export const hasRequested = (group, userId) => group.joinRequests.some((r) => r.userId === userId);
export const recipientOf = (group, month) => group.members.find((m) => m.month === month) || null;

// ─── Group mutations ──────────────────────────────────────────────────────────

export function createGroup({ name, description, amount, currency, maxMembers, startMonth, adminId }) {
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
    payments: {}, // { "YYYY-MM": { [payerUserId]: timestamp } }
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
    // Drop their payment marks so a re-join starts clean
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
  const next = { ...g, ...patch };
  if (next.maxMembers < g.members.length) throw new Error('maxTooLow');
  // Every already-picked month must still fit inside the (possibly shorter) schedule
  const months = monthsOf(next);
  if (g.members.some((m) => m.month && !months.includes(m.month))) throw new Error('maxTooLow');
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
