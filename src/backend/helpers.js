// Pure helpers over the shared db shape:
// { users: [{id, name, firstName, lastName, email, phone, etransferEmail, role}],
//   groups: [...], session: userId|null }
// Group shape: { id, name, description, amount, currency, maxMembers, startMonth,
//   adminId, hidden, disabled, members: [{userId, month, share, joinedAt}],
//   joinRequests: [{userId, requestedAt}],
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

// All schedule math runs on Toronto time (America/Toronto) no matter where
// the viewer's device is — the same clock the daily reminder job uses.
const APP_TZ = 'America/Toronto';
const todayInAppTz = () =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: APP_TZ, year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date()); // YYYY-MM-DD

export const nowMonth = () => todayInAppTz().slice(0, 7);

// ─── Shares & split months ────────────────────────────────────────────────────
// A member holds a full month (share 1) or splits a month with one other
// member (share 0.5 each). Dues scale with the share; the pot of a month is
// split between its recipients in proportion to their shares.

export const shareOf = (member) => Number(member.share) || 1;
export const recipientsOf = (group, month) => group.members.filter((m) => m.month === month);
export const monthShareTotal = (group, month) =>
  recipientsOf(group, month).reduce((s, m) => s + shareOf(m), 0);

// What a single slot pays each round (that slot's own turn month excluded)
export const duesOf = (group, member) => group.amount * shareOf(member);

// ─── Multi-month membership ──────────────────────────────────────────────────
// A member may hold several slots (months) in one group. Each group_members row
// is one slot; the money math sums over slots. A member contributes once per
// slot they hold each round (except the slot receiving that month) and receives
// the pot in each of their assigned months.

export const memberSlots = (group, userId) => group.members.filter((m) => m.userId === userId);
export const isMemberOf = (group, userId) => group.members.some((m) => m.userId === userId);

// A member's combined dues for a given month = sum over their slots not
// receiving that month. (Holding two months → pays twice, minus any slot whose
// payout is this month.)
export const memberDuesForMonth = (group, userId, month) =>
  memberSlots(group, userId)
    .filter((m) => m.month !== month)
    .reduce((s, m) => s + group.amount * shareOf(m), 0);

// A member's total per-round commitment (all their slots), shown as "your dues".
export const memberTotalDues = (group, userId) =>
  memberSlots(group, userId).reduce((s, m) => s + group.amount * shareOf(m), 0);

// Distinct members who owe into a given month (hold ≥1 slot not receiving it).
export const payersOf = (group, month) => {
  const ids = [];
  for (const m of group.members) {
    if (m.month !== month && !ids.includes(m.userId)) ids.push(m.userId);
  }
  return ids;
};

// Total collected for a month = everyone else's dues (sums over all paying slots)
export const potOf = (group, month) =>
  group.members
    .filter((m) => m.month !== month)
    .reduce((s, m) => s + group.amount * shareOf(m), 0);

// A recipient's cut of the month's pot (halves split it equally)
export function recipientCut(group, month, member) {
  const total = monthShareTotal(group, month);
  return total > 0 ? potOf(group, month) * (shareOf(member) / total) : 0;
}

// Months that still have unallocated share
export const openMonths = (group) =>
  monthsOf(group).filter((m) => monthShareTotal(group, m) < 1);

export const isGroupFull = (group) => openMonths(group).length === 0;

export function groupStatus(group) {
  const allAllocated = monthsOf(group).every((m) => monthShareTotal(group, m) >= 1);
  const allPicked = group.members.every((m) => m.month);
  if (!allAllocated || !allPicked) return 'forming';
  const months = monthsOf(group);
  if (nowMonth() > months[months.length - 1]) return 'completed';
  return 'active';
}

// ─── Payment dues & overdue tracking ──────────────────────────────────────────

// The schedule month currently being collected (null when the group hasn't
// started or has finished).
export const currentDueMonth = (group) => {
  const now = nowMonth();
  return monthsOf(group).includes(now) ? now : null;
};

export const hasPaid = (group, month, userId) => Boolean(group.payments[month]?.[userId]);

// Distinct members who owe this month and haven't paid yet (returns userIds).
export const unpaidPayers = (group, month) =>
  payersOf(group, month).filter((userId) => !hasPaid(group, month, userId));

// Payments are due on the 1st; from the 2nd onward (Toronto time) an unpaid
// member is overdue.
export const isPastGraceDay = () => Number(todayInAppTz().slice(8, 10)) >= 2;

// Returns the overdue month for this member in this group, or null.
export const memberOverdueMonth = (group, userId) => {
  if (group.disabled) return null;
  const due = currentDueMonth(group);
  if (!due || !isPastGraceDay()) return null;
  if (!isMemberOf(group, userId)) return null;
  // Owes this month if they hold any slot that isn't receiving it
  const owes = memberSlots(group, userId).some((m) => m.month !== due);
  if (!owes) return null;
  return hasPaid(group, due, userId) ? null : due;
};

// ─── Month-change requests (post-confirmation changes need admin approval) ───

export const monthChangeOf = (group, userId) =>
  (group.monthChangeRequests || []).find((r) => r.userId === userId) || null;

export const monthChangeOfSlot = (group, slotId) =>
  (group.monthChangeRequests || []).find((r) => r.slotId === slotId) || null;

// ─── Group-admin attention queue ──────────────────────────────────────────────

export function adminAttention(d, userId) {
  const groups = d.groups.filter((g) => g.adminId === userId);
  return groups.map((g) => {
    const due = currentDueMonth(g);
    const unpaid = due && isPastGraceDay() ? unpaidPayers(g, due).length : 0;
    return {
      group: g,
      joins: g.joinRequests.length,
      changes: (g.monthChangeRequests || []).length,
      unpaid,
    };
  }).filter((a) => a.joins + a.changes + a.unpaid > 0);
}

// ─── Lookups ──────────────────────────────────────────────────────────────────

export const currentUser = (d) => d.users.find((u) => u.id === d.session) || null;
export const userById = (d, id) => d.users.find((u) => u.id === id) || null;
export const groupById = (d, id) => d.groups.find((g) => g.id === id) || null;

export const memberOf = (group, userId) => group.members.find((m) => m.userId === userId) || null;
export const isAdmin = (group, userId) => group.adminId === userId;
export const hasRequested = (group, userId) => group.joinRequests.some((r) => r.userId === userId);

export const isPlatformAdmin = (d, userId) => userById(d, userId)?.role === 'admin';

// ─── Validation shared by both backends ───────────────────────────────────────

export function validateGroupPatch(group, patch) {
  const next = { ...group, ...patch };
  if (next.maxMembers * 2 < group.members.length) throw new Error('maxTooLow');
  const months = monthsOf(next);
  if (group.members.some((m) => m.month && !months.includes(m.month))) throw new Error('maxTooLow');
  return next;
}

// Returns the share the user may take for a month, or throws. `excludeSlotId`
// is the slot being edited (so a member changing a slot doesn't clash with
// itself); for a brand-new slot pass null.
export function validateMonthPick(group, userId, month, requestedShare, excludeSlotId = null) {
  if (!monthsOf(group).includes(month)) throw new Error('badMonth');
  const here = recipientsOf(group, month).filter((m) => m.id !== excludeSlotId);
  // A member can't hold the same month twice
  if (here.some((m) => m.userId === userId)) throw new Error('monthFull');
  const occupants = here.filter((m) => m.userId !== userId);
  if (occupants.length >= 2) throw new Error('monthFull');
  if (occupants.length === 1) {
    if (shareOf(occupants[0]) >= 1) throw new Error('monthFull');
    return 0.5; // joining an existing half — the other half is forced
  }
  return requestedShare === 0.5 ? 0.5 : 1;
}
