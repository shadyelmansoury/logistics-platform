// Pure helpers over the shared db shape:
// { users: [{id, name, email, phone}], groups: [...], session: userId|null }
// Group shape: { id, name, description, amount, currency, maxMembers, startMonth,
//   adminId, members: [{userId, month, joinedAt}], joinRequests: [{userId, requestedAt}],
//   payments: { "YYYY-MM": { [payerId]: timestamp } } }
// Both backends (localStorage demo and Supabase) produce this exact shape,
// so the UI never knows which one it's talking to.

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

export const currentUser = (d) => d.users.find((u) => u.id === d.session) || null;
export const userById = (d, id) => d.users.find((u) => u.id === id) || null;
export const groupById = (d, id) => d.groups.find((g) => g.id === id) || null;

export const memberOf = (group, userId) => group.members.find((m) => m.userId === userId) || null;
export const isAdmin = (group, userId) => group.adminId === userId;
export const hasRequested = (group, userId) => group.joinRequests.some((r) => r.userId === userId);
export const recipientOf = (group, month) => group.members.find((m) => m.month === month) || null;

// Shared client-side validation for editing a group (both backends throw the
// same error codes so the UI handles them identically).
export function validateGroupPatch(group, patch) {
  const next = { ...group, ...patch };
  if (next.maxMembers < group.members.length) throw new Error('maxTooLow');
  const months = monthsOf(next);
  if (group.members.some((m) => m.month && !months.includes(m.month))) throw new Error('maxTooLow');
  return next;
}
