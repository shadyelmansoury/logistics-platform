import { Users, Plus, Search, Crown, Hourglass, CalendarPlus, EyeOff, PauseCircle } from 'lucide-react';
import { Card, Btn, Badge, SectionTitle, Empty, Avatar } from './ui.jsx';
import { monthLabel, fmtMoney } from '../i18n.js';
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
      <section>
        <div className="head-row" style={{ marginBottom: 12 }}>
          <SectionTitle><Users size={13} /> {s.dash.myGroups}</SectionTitle>
          <Btn size="sm" onClick={onCreate}><Plus size={14} /> {s.nav.newGroup}</Btn>
        </div>
        {mine.length === 0 ? (
          <Empty icon={Users} text={s.dash.empty} />
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
