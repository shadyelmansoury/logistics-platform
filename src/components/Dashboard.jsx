import { Users, Plus, Search, Crown, Hourglass, CalendarPlus, EyeOff, PauseCircle, BellRing, Wallet, CheckCircle2, UserPlus, CalendarDays } from 'lucide-react';
import { Card, Btn, Badge, SectionTitle, Empty, Avatar } from './ui.jsx';
import { monthLabel, fmtMoney, t } from '../i18n.js';
import * as store from '../store.js';

const STATUS_VARIANT = { forming: 'gold', active: 'primary', completed: 'muted' };

function GroupCard({ g, user, s, lang, onOpen }) {
  const d = store.getDB();
  const member = store.memberOf(g, user.id);
  const admin = store.isAdmin(g, user.id);
  const requested = store.hasRequested(g, user.id);
  const full = store.isGroupFull(g);
  const status = store.groupStatus(g);
  const gs = s.group;
  const adminUser = store.userById(d, g.adminId);
  const allocated = store.monthsOf(g).reduce((sum, m) => sum + Math.min(store.monthShareTotal(g, m), 1), 0);

  return (
    <Card className="group-card">
      <div className="group-card-head">
        <Avatar name={g.name} size={44} gold={admin} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="group-card-title">
            <span>{g.name}</span>
            {admin && <Badge variant="gold"><Crown size={11} /> {s.dash.adminBadge}</Badge>}
            <Badge variant={STATUS_VARIANT[status]}>{gs.status[status]}</Badge>
            {g.hidden && <Badge variant="muted"><EyeOff size={11} /> {gs.hiddenBadge}</Badge>}
            {g.disabled && <Badge variant="danger"><PauseCircle size={11} /> {gs.disabledBadge}</Badge>}
          </div>
          <div className="group-card-meta">
            {fmtMoney(g.amount, g.currency, lang)} {s.dash.monthly} · {g.members.length}/{g.maxMembers} {s.dash.members}
          </div>
          <div className="group-card-sub">
            {s.dash.starts} {monthLabel(g.startMonth, s.locale)}
            {adminUser && !admin ? ` · ${gs.adminLabel}: ${adminUser.name}` : ''}
          </div>
        </div>
      </div>

      <div className="card-progress" aria-hidden="true">
        <div className="card-progress-fill" style={{ width: `${(allocated / g.maxMembers) * 100}%` }} />
      </div>

      <div className="group-card-actions">
        {member && !member.month && status === 'forming' && (
          <Badge variant="info"><CalendarPlus size={11} /> {s.dash.pickMonthBadge}</Badge>
        )}
        {requested && (
          <Badge variant="muted"><Hourglass size={11} /> {s.dash.pendingBadge}</Badge>
        )}
        <span className="spacer" />
        {member || requested ? (
          <Btn size="sm" variant={member ? 'primary' : 'secondary'} onClick={() => onOpen(g.id)}>{s.dash.open}</Btn>
        ) : full ? (
          <>
            <Badge variant="muted">{s.dash.full}</Badge>
            <Btn size="sm" variant="secondary" onClick={() => onOpen(g.id)}>{s.dash.open}</Btn>
          </>
        ) : g.disabled ? (
          <Btn size="sm" variant="secondary" onClick={() => onOpen(g.id)}>{s.dash.open}</Btn>
        ) : (
          <>
            <Btn size="sm" variant="gold" onClick={() => store.requestJoin(g.id, user.id)}>{s.dash.requestJoin}</Btn>
            <Btn size="sm" variant="secondary" onClick={() => onOpen(g.id)}>{s.dash.open}</Btn>
          </>
        )}
      </div>
    </Card>
  );
}

function AttentionCard({ db, user, s, onOpen }) {
  const items = store.adminAttention(db, user.id);
  if (items.length === 0) return null;
  return (
    <Card className="card-gold">
      <div className="stack" style={{ gap: 10 }}>
        <SectionTitle><BellRing size={13} /> {s.dash.alertsTitle}</SectionTitle>
        {items.map(({ group, joins, changes, unpaid }) => (
          <div key={group.id} className="member-row" style={{ background: 'var(--surface)' }}>
            <div className="member-main">
              <div className="member-name">{group.name}</div>
              <div className="member-sub" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                {joins > 0 && <Badge variant="info"><UserPlus size={11} /> {t(s.dash.alertJoins, { n: joins })}</Badge>}
                {changes > 0 && <Badge variant="info"><CalendarDays size={11} /> {t(s.dash.alertChanges, { n: changes })}</Badge>}
                {unpaid > 0 && <Badge variant="danger"><Wallet size={11} /> {t(s.dash.alertUnpaid, { n: unpaid })}</Badge>}
              </div>
            </div>
            <Btn size="sm" onClick={() => onOpen(group.id)}>{s.dash.review}</Btn>
          </div>
        ))}
      </div>
    </Card>
  );
}

function DueSection({ db, user, s, lang, onOpen }) {
  const gs = s.group;
  const dues = db.groups
    .map((g) => ({ g, me: store.memberOf(g, user.id), due: store.currentDueMonth(g) }))
    .filter(({ g, me, due }) => me && due && !g.disabled && me.month !== due);
  if (dues.length === 0) return null;
  return (
    <section>
      <div className="head-row" style={{ marginBottom: 12 }}>
        <SectionTitle><Wallet size={13} /> {s.dash.dueSection}</SectionTitle>
      </div>
      <div className="stack-sm">
        {dues.map(({ g, me, due }) => {
          const paid = store.hasPaid(g, due, user.id);
          const overdue = !paid && store.isPastGraceDay();
          const recips = store.recipientsOf(g, due);
          const names = recips.map((r) => store.userById(db, r.userId)?.name || '?').join(' + ');
          const amount = fmtMoney(store.duesOf(g, me), g.currency, lang);
          return (
            <div key={g.id} className="member-row"
              style={overdue ? { borderColor: 'var(--danger-border)' } : undefined}>
              {paid
                ? <CheckCircle2 size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                : <Wallet size={18} style={{ color: overdue ? 'var(--danger)' : 'var(--primary)', flexShrink: 0 }} />}
              <div className="member-main">
                <div className="member-name">
                  <span>{g.name}</span>
                  {overdue && <Badge variant="danger">{gs.overdueTitle}</Badge>}
                  {paid && <Badge variant="primary">{gs.duePaid}</Badge>}
                </div>
                <div className="member-sub">
                  {paid ? monthLabel(due, s.locale) : t(gs.dueSend, { amount, name: names || '—' })}
                </div>
              </div>
              {!paid && (
                <Btn size="sm" variant={overdue ? 'solid-danger' : 'primary'}
                  onClick={() => store.togglePaid(g.id, due, user.id)}>
                  <CheckCircle2 size={13} /> {gs.confirmPaid}
                </Btn>
              )}
              <Btn size="sm" variant="ghost" onClick={() => onOpen(g.id)}>{s.dash.open}</Btn>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function Dashboard({ db, user, s, lang, onOpen, onCreate }) {
  const platformAdmin = store.isPlatformAdmin(db, user.id);
  const mine = db.groups.filter((g) => store.memberOf(g, user.id) || store.hasRequested(g, user.id));
  // Hidden groups don't appear in discovery (platform admins still see them,
  // with a "Hidden" badge, via the admin console and here).
  const others = db.groups.filter((g) =>
    !store.memberOf(g, user.id) && !store.hasRequested(g, user.id)
    && (!g.hidden || platformAdmin));

  return (
    <div className="page stack" style={{ gap: 30 }}>
      <AttentionCard db={db} user={user} s={s} onOpen={onOpen} />
      <DueSection db={db} user={user} s={s} lang={lang} onOpen={onOpen} />

      <section>
        <div className="head-row" style={{ marginBottom: 12 }}>
          <SectionTitle><Users size={13} /> {s.dash.myGroups}</SectionTitle>
          {platformAdmin && <Btn size="sm" onClick={onCreate}><Plus size={14} /> {s.nav.newGroup}</Btn>}
        </div>
        {mine.length === 0 ? (
          <Empty icon={Users} text={platformAdmin ? s.dash.empty : `${s.dash.empty} ${s.dash.onlyAdminCreates}`} />
        ) : (
          <div className="grid-cards">
            {mine.map((g) => <GroupCard key={g.id} g={g} user={user} s={s} lang={lang} onOpen={onOpen} />)}
          </div>
        )}
      </section>

      <section>
        <div className="head-row" style={{ marginBottom: 12 }}>
          <SectionTitle><Search size={13} /> {s.dash.discover}</SectionTitle>
        </div>
        {others.length === 0 ? (
          <Empty icon={Search} text={s.dash.emptyDiscover} />
        ) : (
          <div className="grid-cards">
            {others.map((g) => <GroupCard key={g.id} g={g} user={user} s={s} lang={lang} onOpen={onOpen} />)}
          </div>
        )}
      </section>
    </div>
  );
}
