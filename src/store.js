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
  memberOf, isAdmin, hasRequested, recipientOf,
} from './backend/helpers.js';

const impl = supa.hasSupabase ? supa : local;
export const backend = supa.hasSupabase ? 'supabase' : 'local';

export const subscribe = (l) => impl.subscribe(l);
export const getDB = () => impl.getDB();

export const register = (form) => impl.register(form);
export const login = (email, password) => impl.login(email, password);
export const logout = () => impl.logout();

export const createGroup = (data) => impl.createGroup(data);
export const requestJoin = (groupId, userId) => impl.requestJoin(groupId, userId);
export const cancelRequest = (groupId, userId) => impl.cancelRequest(groupId, userId);
export const approveRequest = (groupId, userId) => impl.approveRequest(groupId, userId);
export const rejectRequest = (groupId, userId) => impl.rejectRequest(groupId, userId);
export const pickMonth = (groupId, userId, month) => impl.pickMonth(groupId, userId, month);
export const removeMember = (groupId, userId) => impl.removeMember(groupId, userId);
export const updateGroup = (groupId, patch) => impl.updateGroup(groupId, patch);
export const deleteGroup = (groupId) => impl.deleteGroup(groupId);
export const togglePaid = (groupId, month, payerId) => impl.togglePaid(groupId, month, payerId);

impl.init();
