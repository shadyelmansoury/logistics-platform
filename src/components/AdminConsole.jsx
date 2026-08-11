import { useState } from 'react';
import {
  ArrowLeft, ShieldAlert, Users, Layers, Activity, Eye, EyeOff,
  PauseCircle, PlayCircle, Trash2, Crown,
} from 'lucide-react';
import { Card, Btn, Badge, SectionTitle, Avatar, Empty, ConfirmDialog } from './ui.jsx';
import { monthLabel, fmtMoney, t } from '../i18n.js';
import * as store from '../store.js';

const STATUS_VARIANT = { forming: 'gold', active: 'primary', completed: 'muted' };

export default function AdminConsole({ db, user, s, lang, onOpen, onBack }) {
  const ac = s.adminc;
  const gs = s.group;
  const [confirming, setConfirming] = useState(null); // { type: 'group'|'user', id }

  const stats = [
    { Icon: Users, label: ac.statUsers, val: db.users.length },
    { Icon: Layers, label: ac.statGroups, val: db.groups.length },
    { Icon: Activity, label: ac.statActive, val: db.groups.filter((g) => !g.disabled && store.groupStatus(g) === 'active').length },
  ];

  const doConfirm = () => {
    if (confirming.type === 'group') store.deleteGroup(confirming.id);
    else Promise.resolve(store.adminDeleteUser(confirming.id)).catch((e) => console.error(e));
    setConfirming(null);
  };

  return (
    <div className="page stack">
      <div>
        <Btn variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft size={14} style={{ transform: s.dir === 'rtl' ? 'scaleX(-1)' : 'none' }} /> {s.common.back}
        </Btn>
      </div>

      <Card className="card-gold">
        <div className="banner" style={{ padding: 0 }}>
          <ShieldAlert size={22} style={{ color: 'var(--gold)', flexShrink: 0 }} />
          <div className="banner-main">
            <div className="banner-title" style={{ fontSize: 17 }}>{ac.title}</div>
            <div className="banner-sub">{ac.subtitle}</div>
          </div>
        </div>
      </Card>

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {stats.map(({ Icon, label, val }, i) => (
          <div key={i} className="stat">
            <div className="stat-label"><Icon size={11} style={{ verticalAlign: -1 }} /> {label}</div>
            <div className="stat-value" style={{ fontSize: 20 }}>{val}</div>
          </div>
        ))}
      </div>

      {/* Groups */}
      <section className="stack-sm">
        <div className="head-row">
          <SectionTitle><Layers size={13} /> {ac.groupsTitle}</SectionTitle>
          <span className="field-hint">{ac.editHint}</span>
        </div>
        {db.groups.length === 0 ? (
          <Empty icon={Layers} text={ac.noGroups} />
        ) : (
          db.groups.map((g) => {
            const status = store.groupStatus(g);
            const adminUser = store.userById(db, g.adminId);
            const due = store.currentDueMonth(g);
            const payersTotal = due ? g.members.filter((m) => m.month !== due).length : 0;
            const paidNow = due ? payersTotal - store.unpaidPayers(g, due).length : 0;
            return (
              <div key={g.id} className="member-row">
                <Avatar name={g.name} size={38} />
                <div className="member-main">
                  <div className="member-name">
                    <span>{g.name}</span>
                    <Badge variant={STATUS_VARIANT[status]}>{gs.status[status]}</Badge>
                    {g.hidden && <Badge variant="muted"><EyeOff size={11} /> {gs.hiddenBadge}</Badge>}
                    {g.disabled && <Badge variant="danger"><PauseCircle size={11} /> {gs.disabledBadge}</Badge>}
                  </div>
                  <div className="member-sub">
                    {gs.adminLabel}: {adminUser?.name || '—'} · {g.members.length} {s.dash.members} · {fmtMoney(g.amount, g.currency, lang)} {s.dash.monthly} · {s.dash.starts} {monthLabel(g.startMonth, s.locale)}
                    {due && payersTotal > 0 ? ` · ${t(ac.paidCount, { p: paidNow, t: payersTotal })}` : ''}
                  </div>
                </div>
                <div className="row-actions">
                  <Btn size="sm" variant="secondary" onClick={() => onOpen(g.id)}>{ac.open}</Btn>
                  <Btn size="sm" variant="secondary" onClick={() => store.setGroupHidden(g.id, !g.hidden)}
                    title={g.hidden ? ac.unhide : ac.hide}>
                    {g.hidden ? <Eye size={13} /> : <EyeOff size={13} />}
                    <span className="icon-btn-label">{g.hidden ? ac.unhide : ac.hide}</span>
                  </Btn>
                  <Btn size="sm" variant={g.disabled ? 'primary' : 'secondary'}
                    onClick={() => store.setGroupDisabled(g.id, !g.disabled)}
                    title={g.disabled ? ac.enable : ac.disable}>
                    {g.disabled ? <PlayCircle size={13} /> : <PauseCircle size={13} />}
                    <span className="icon-btn-label">{g.disabled ? ac.enable : ac.disable}</span>
                  </Btn>
                  <Btn size="sm" variant="danger" onClick={() => setConfirming({ type: 'group', id: g.id })}
                    title={ac.delete}>
                    <Trash2 size={13} />
                  </Btn>
                </div>
              </div>
            );
          })
        )}
      </section>

      {/* Users */}
      <section className="stack-sm">
        <SectionTitle><Users size={13} /> {ac.usersTitle}</SectionTitle>
        {db.users.length === 0 ? (
          <Empty icon={Users} text={ac.noUsers} />
        ) : (
          db.users.map((u) => {
            const isMe = u.id === user.id;
            const isAdminRole = u.role === 'admin';
            return (
              <div key={u.id} className="member-row">
                <Avatar name={u.name} size={38} gold={isAdminRole} />
                <div className="member-main">
                  <div className="member-name">
                    <span>{u.name}{isMe ? ` (${gs.you})` : ''}</span>
                    {isAdminRole && <Badge variant="gold"><Crown size={11} /> {ac.roleAdmin}</Badge>}
                  </div>
                  <div className="member-sub member-contact">
                    {[u.email, u.phone].filter(Boolean).join(' · ')}
                  </div>
                </div>
                {!isMe && (
                  <Btn size="sm" variant="danger" onClick={() => setConfirming({ type: 'user', id: u.id })}>
                    <Trash2 size={13} /> {ac.delete}
                  </Btn>
                )}
              </div>
            );
          })
        )}
      </section>

      <ConfirmDialog
        open={Boolean(confirming)}
        danger
        title={ac.delete}
        body={confirming?.type === 'group' ? ac.deleteGroupConfirm : ac.deleteUserConfirm}
        confirmLabel={s.common.confirm}
        cancelLabel={s.common.cancel}
        onConfirm={doConfirm}
        onCancel={() => setConfirming(null)}
      />
    </div>
  );
}
