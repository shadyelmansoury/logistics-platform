import { ArrowLeft, Bell, Wallet, WalletCards, ShieldAlert, UserPlus, UserCheck, BadgeCheck, Hourglass, CalendarClock } from 'lucide-react';
import { Btn, Empty, SectionTitle } from './ui.jsx';
import { t } from '../i18n.js';
import * as store from '../store.js';

// target: where tapping the notification lands — admin kinds go straight to
// the approval surface (group Manage tab or the admin console).
const KIND_META = {
  upcoming_user: { Icon: WalletCards, variant: 'info', key: 'upcomingUser', target: 'group' },
  overdue_user: { Icon: Wallet, variant: 'danger', key: 'overdueUser', target: 'group' },
  overdue_admin: { Icon: ShieldAlert, variant: 'danger', key: 'overdueAdmin', target: 'manage' },
  join_request: { Icon: UserPlus, variant: 'info', key: 'joinRequest', target: 'manage' },
  member_joined: { Icon: UserCheck, variant: 'primary', key: 'memberJoined', target: 'manage' },
  join_approved: { Icon: BadgeCheck, variant: 'primary', key: 'joinApproved', target: 'group' },
  account_pending: { Icon: Hourglass, variant: 'info', key: 'accountPending', target: 'admin' },
  account_approved: { Icon: BadgeCheck, variant: 'primary', key: 'accountApproved', target: 'home' },
  month_change_request: { Icon: CalendarClock, variant: 'info', key: 'monthChangeRequest', target: 'manage' },
  month_change_approved: { Icon: BadgeCheck, variant: 'primary', key: 'monthChangeApproved', target: 'group' },
};

export default function Notifications({ db, s, onOpenGroup, onOpenAdmin, onBack }) {
  const n = s.notif;
  const items = db.notifications || [];

  return (
    <div className="page page-narrow stack">
      <div>
        <Btn variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft size={14} style={{ transform: s.dir === 'rtl' ? 'scaleX(-1)' : 'none' }} /> {s.common.back}
        </Btn>
      </div>

      <SectionTitle><Bell size={13} /> {n.title}</SectionTitle>

      {items.length === 0 ? (
        <Empty icon={Bell} text={n.empty} />
      ) : (
        <div className="stack-sm">
          {items.map((item) => {
            const meta = KIND_META[item.kind] || KIND_META.overdue_user;
            const group = item.groupId ? store.groupById(db, item.groupId) : null;
            const groupName = group?.name || n.unknownGroup;
            const text = t(n[meta.key], { detail: item.detail, group: groupName });
            const when = item.createdAt
              ? new Date(item.createdAt).toLocaleDateString(s.locale, {
                  month: 'short', day: 'numeric',
                  hour: 'numeric', minute: '2-digit',
                })
              : '';
            const go = () => {
              if (meta.target === 'admin') return onOpenAdmin();
              if (meta.target === 'home') return onBack();
              if (!group) return undefined;
              return onOpenGroup(group.id, meta.target === 'manage' ? 'manage' : undefined);
            };
            const clickable = meta.target === 'admin' || meta.target === 'home' || Boolean(group);
            return (
              <button
                key={item.id}
                type="button"
                className="notif-row"
                onClick={go}
                disabled={!clickable}
              >
                <span className={`notif-icon is-${meta.variant}`}>
                  <meta.Icon size={16} />
                </span>
                <span className="notif-main">
                  <span className="notif-text">{text}</span>
                  <span className="notif-when">{when}</span>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
