import { ArrowLeft, Bell, Wallet, ShieldAlert, UserPlus, UserCheck, BadgeCheck, Hourglass } from 'lucide-react';
import { Btn, Empty, SectionTitle } from './ui.jsx';
import { t } from '../i18n.js';
import * as store from '../store.js';

const KIND_META = {
  overdue_user: { Icon: Wallet, variant: 'danger', key: 'overdueUser' },
  overdue_admin: { Icon: ShieldAlert, variant: 'danger', key: 'overdueAdmin' },
  join_request: { Icon: UserPlus, variant: 'info', key: 'joinRequest' },
  member_joined: { Icon: UserCheck, variant: 'primary', key: 'memberJoined' },
  join_approved: { Icon: BadgeCheck, variant: 'primary', key: 'joinApproved' },
  account_pending: { Icon: Hourglass, variant: 'info', key: 'accountPending' },
  account_approved: { Icon: BadgeCheck, variant: 'primary', key: 'accountApproved' },
};

export default function Notifications({ db, s, onOpenGroup, onBack }) {
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
            return (
              <button
                key={item.id}
                type="button"
                className="notif-row"
                onClick={() => group && onOpenGroup(group.id)}
                disabled={!group}
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
