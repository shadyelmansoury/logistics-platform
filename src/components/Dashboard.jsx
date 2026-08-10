import { Users, Plus, Search, Crown, Hourglass, CalendarPlus } from 'lucide-react';
import { C, font } from '../theme.js';
import { Card, Btn, Badge, SectionTitle, Empty, Avatar } from './ui.jsx';
import { monthLabel, fmtMoney, t } from '../i18n.js';
import * as store from '../store.js';

function GroupCard({ g, user, s, lang, onOpen }) {
  const d = store.getDB();
  const member = store.memberOf(g, user.id);
  const admin = store.isAdmin(g, user.id);
  const requested = store.hasRequested(g, user.id);
  const full = g.members.length >= g.maxMembers;
  const status = store.groupStatus(g);
  const gs = s.group;
  const adminUser = store.userById(d, g.adminId);

  const statusColors = {
    forming: { c:C.gold, bg:C.goldLight, b:C.goldBorder },
    active: { c:C.primary, bg:C.primaryLight, b:C.primaryBorder },
    completed: { c:C.muted, bg:C.surfaceAlt, b:C.border },
  }[status];

  return (
    <Card style={{ display:'flex', flexDirection:'column', gap:12 }}>
      <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
        <Avatar name={g.name} size={44} color={admin ? C.gold : C.primary} />
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
            <span style={{ fontSize:17, fontWeight:800, color:C.ink, fontFamily:font.display }}>{g.name}</span>
            {admin && <Badge color={C.gold} bg={C.goldLight} border={C.goldBorder}><Crown size={10} style={{ verticalAlign:-1 }} /> {s.dash.adminBadge}</Badge>}
            <Badge color={statusColors.c} bg={statusColors.bg} border={statusColors.b}>{gs.status[status]}</Badge>
          </div>
          <div style={{ fontSize:12, color:C.muted, marginTop:4 }}>
            {fmtMoney(g.amount, g.currency, lang)} {s.dash.monthly} · {g.members.length}/{g.maxMembers} {s.dash.members}
          </div>
          <div style={{ fontSize:12, color:C.mutedLight, marginTop:2 }}>
            {s.dash.starts} {monthLabel(g.startMonth, s.locale)}{adminUser && !admin ? ` · ${gs.adminLabel}: ${adminUser.name}` : ''}
          </div>
        </div>
      </div>

      <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
        {member && !member.month && status === 'forming' && (
          <Badge color={C.blue} bg={C.blueLight} border={C.blueBorder}>
            <CalendarPlus size={10} style={{ verticalAlign:-1 }} /> {s.dash.pickMonthBadge}
          </Badge>
        )}
        {requested && (
          <Badge color={C.muted} bg={C.surfaceAlt} border={C.border}>
            <Hourglass size={10} style={{ verticalAlign:-1 }} /> {s.dash.pendingBadge}
          </Badge>
        )}
        <div style={{ flex:1 }} />
        {member || requested ? (
          <Btn size="sm" variant={member ? 'primary' : 'secondary'} onClick={() => onOpen(g.id)}>{s.dash.open}</Btn>
        ) : full ? (
          <>
            <Badge color={C.muted} bg={C.surfaceAlt} border={C.border}>{s.dash.full}</Badge>
            <Btn size="sm" variant="secondary" onClick={() => onOpen(g.id)}>{s.dash.open}</Btn>
          </>
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
  const mine = db.groups.filter((g) => store.memberOf(g, user.id) || store.hasRequested(g, user.id));
  const others = db.groups.filter((g) => !store.memberOf(g, user.id) && !store.hasRequested(g, user.id));

  return (
    <div style={{ maxWidth:860, margin:'0 auto', padding:'28px 20px', display:'flex', flexDirection:'column', gap:28 }}>
      <div>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
          <SectionTitle style={{ marginBottom:0 }}><Users size={13} style={{ verticalAlign:-2 }} /> {s.dash.myGroups}</SectionTitle>
          <Btn size="sm" onClick={onCreate}><Plus size={13} style={{ verticalAlign:-2 }} /> {s.nav.newGroup}</Btn>
        </div>
        {mine.length === 0 ? (
          <Empty icon={Users} text={s.dash.empty} />
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:14 }}>
            {mine.map((g) => <GroupCard key={g.id} g={g} user={user} s={s} lang={lang} onOpen={onOpen} />)}
          </div>
        )}
      </div>

      <div>
        <SectionTitle><Search size={13} style={{ verticalAlign:-2 }} /> {s.dash.discover}</SectionTitle>
        {others.length === 0 ? (
          <Empty icon={Search} text={s.dash.emptyDiscover} />
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:14 }}>
            {others.map((g) => <GroupCard key={g.id} g={g} user={user} s={s} lang={lang} onOpen={onOpen} />)}
          </div>
        )}
      </div>
    </div>
  );
}
