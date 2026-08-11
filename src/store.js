// ─── Data layer facade ────────────────────────────────────────────────────────
// Picks the backend once at startup:
//   • Supabase (real multi-user backend) when VITE_SUPABASE_URL and
//     VITE_SUPABASE_ANON_KEY are configured — see supabase/schema.sql and README.
//   • localStorage demo mode otherwise, so the app always runs.
// Both implement the same API over the same db shape; the UI imports only
// from this file and never knows which backend is active.

import * as local from './backend/localStore.js';
import * as supa from './backend/supabaseStore.js';

export {
  monthsOf, nowMonth, groupStatus,
  currentUser, userById, groupById,
  memberOf, isAdmin, hasRequested,
  shareOf, recipientsOf, monthShareTotal, duesOf, potOf, recipientCut,
  openMonths, isGroupFull, isPlatformAdmin,
  currentDueMonth, hasPaid, unpaidPayers, isPastGraceDay, memberOverdueMonth,
  monthChangeOf, adminAttention,
} from './backend/helpers.js';

const impl = supa.hasSupabase ? supa : local;
export const backend = supa.hasSupabase ? 'supabase' : 'local';

export const subscribe = (l) => impl.subscribe(l);
export const getDB = () => impl.getDB();

export const register = (form) => impl.register(form);
export const login = (email, password) => impl.login(email, password);
export const logout = () => impl.logout();
export const updateProfile = (userId, patch) => impl.updateProfile(userId, patch);

// Two-factor authentication — only available on the live backend.
export const mfaAvailable = supa.hasSupabase;
export const mfaStatus = () => impl.mfaStatus();
export const mfaEnroll = () => impl.mfaEnroll();
export const mfaVerifyEnroll = (factorId, code) => impl.mfaVerifyEnroll(factorId, code);
export const mfaUnenroll = (factorId) => impl.mfaUnenroll(factorId);
export const completeMfaLogin = (code) => impl.completeMfaLogin(code);
export const resetAvailable = supa.hasSupabase;
export const requestPasswordReset = (email) => impl.requestPasswordReset(email);
export const updatePassword = (newPassword) => impl.updatePassword(newPassword);

export const createGroup = (data) => impl.createGroup(data);
export const requestJoin = (groupId, userId) => impl.requestJoin(groupId, userId);
export const cancelRequest = (groupId, userId) => impl.cancelRequest(groupId, userId);
export const approveRequest = (groupId, userId) => impl.approveRequest(groupId, userId);
export const rejectRequest = (groupId, userId) => impl.rejectRequest(groupId, userId);
export const pickMonth = (groupId, userId, month, share) => impl.pickMonth(groupId, userId, month, share);
export const setGroupHidden = (groupId, hidden) => impl.setGroupHidden(groupId, hidden);
export const setGroupDisabled = (groupId, disabled) => impl.setGroupDisabled(groupId, disabled);
export const adminDeleteUser = (userId) => impl.adminDeleteUser(userId);
export const requestMonthChange = (groupId, userId, month, share) => impl.requestMonthChange(groupId, userId, month, share);
export const cancelMonthChange = (groupId, userId) => impl.cancelMonthChange(groupId, userId);
export const approveMonthChange = (groupId, userId) => impl.approveMonthChange(groupId, userId);
export const rejectMonthChange = (groupId, userId) => impl.rejectMonthChange(groupId, userId);
export const removeMember = (groupId, userId) => impl.removeMember(groupId, userId);
export const updateGroup = (groupId, patch) => impl.updateGroup(groupId, patch);
export const deleteGroup = (groupId) => impl.deleteGroup(groupId);
export const togglePaid = (groupId, month, payerId) => impl.togglePaid(groupId, month, payerId);

impl.init();
