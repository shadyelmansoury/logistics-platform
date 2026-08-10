import { useEffect, useState } from 'react';
import {
  ArrowLeft, Crown, Users, CalendarDays, Wallet, Settings2,
  CheckCircle2, Circle, Hourglass, UserPlus, Trash2, LogOut, HandCoins,
} from 'lucide-react';
import { C, font } from '../theme.js';
import { Card, Btn, Badge, SectionTitle, Avatar, Empty, Field, Input, inputStyle, ErrorBox } from './ui.jsx';
import { monthLabel, fmtMoney, t } from '../i18n.js';
import * as store from '../store.js';

const statusColors = {
  forming: { c:C.gold, bg:C.goldLight, b:C.goldBorder },
  active: { c:C.primary, bg:C.primaryLight, b:C.primaryBorder },
  completed: { c:C.muted, bg:C.surfaceAlt, b:C.border },
};

// ─── Header ───────────────────────────────────────────────────────────────────
function Header({ g, s, lang, admin }) {
  const d = store.getDB();
  const status = store.groupStatus(g);
  const sc = statusColors[status];
  const gs = s.group;
  const adminUser = store.userById(d, g.adminId);
  const pot = g.amount * (g.maxMembers - 1);

  const stats = [
    { label: gs.monthlyAmount, val: fmtMoney(g.amount, g.currency, lang) },
    { label: gs.perTurn, val: fmtMoney(pot, g.currency, lang) },
    { label: gs.duration, val: `${g.maxMembers} ${gs.months}` },
    { label: gs.startsLabel, val: monthLabel(g.startMonth, s.locale) },
  ];

  return (
    <Card style={{ padding:22 }}>
      <div style={{ display:'flex', alignItems:'flex-start', gap:14, flexWrap:'wrap' }}>
        <Avatar name={g.name} size={52} color={C.primary} />
        <div style={{ flex:1, minWidth:200 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
            <span style={{ fontSize:24, fontWeight:800, color:C.ink, fontFamily:font.display }}>{g.name}</span>
            <Badge color={sc.c} bg={sc.bg} border={sc.b}>{gs.status[status]}</Badge>
            {admin && <Badge color={C.gold} bg={C.goldLight} border={C.goldBorder}><Crown size={10} style={{ verticalAlign:-1 }} /> {s.dash.adminBadge}</Badge>}
          </div>
          {g.description && <div style={{ fontSize:13, color:C.muted, marginTop:6, lineHeight:1.6 }}>{g.description}</div>}
          <div style={{ fontSize:12, color:C.mutedLight, marginTop:6 }}>
            {gs.adminLabel}: {adminUser?.name || '—'} · {g.members.length}/{g.maxMembers} {s.dash.members}
          </div>
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(140px, 1fr))', gap:10, marginTop:16 }}>
        {stats.map((st, i) => (
          <div key={i} style={{ padding:'10px 12px', background:C.surfaceAlt, borderRadius:10, border:`1px solid ${C.border}` }}>
            <div style={{ fontSize:10, color:C.muted, textTransform:'uppercase', letterSpacing:0.5, fontFamily:font.mono, marginBottom:4 }}>{st.label}</div>
            <div style={{ fontSize:15, fontWeight:800, color:C.ink, fontFamily:font.display }}>{st.val}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize:11, color:C.mutedLight, marginTop:10, lineHeight:1.5 }}>{gs.potNote}</div>
    </Card>
  );
}

// ─── Month picker (member without a month) ────────────────────────────────────
function MonthPicker({ g, user, s, lang, onPicked }) {
  const [selected, setSelected] = useState(null);
  const gs = s.group;
  const months = store.monthsOf(g);
  const me = store.memberOf(g, user.id);

  return (
    <Card style={{ border:`1.5px solid ${C.primaryBorder}`, background:C.primaryLight }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
        <CalendarDays size={17} color={C.primary} />
        <span style={{ fontSize:17, fontWeight:800, color:C.primaryDark, fontFamily:font.display }}>
          {me.month ? gs.changeMonth : gs.pickTitle}
        </span>
      </div>
      <div style={{ fontSize:12, color:C.inkMid, lineHeight:1.6, marginBottom:14 }}>{gs.pickHint}</div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(150px, 1fr))', gap:8 }}>
        {months.map((m) => {
          const owner = store.recipientOf(g, m);
          const takenByOther = owner && owner.userId !== user.id;
          const isMine = owner && owner.userId === user.id;
          const isSelected = selected === m;
          const d = store.getDB();
          return (
            <button key={m} disabled={takenByOther}
              onClick={() => setSelected(isSelected ? null : m)}
              style={{
                padding:'10px 12px', borderRadius:10, textAlign:'start', fontFamily:font.body,
                cursor: takenByOther ? 'not-allowed' : 'pointer',
                background: isSelected ? C.primary : isMine ? C.goldLight : takenByOther ? C.surfaceAlt : C.surface,
                border: `1.5px solid ${isSelected ? C.primaryDark : isMine ? C.goldBorder : takenByOther ? C.border : C.borderMid}`,
                opacity: takenByOther ? 0.65 : 1,
              }}>
              <div style={{ fontSize:13, fontWeight:700, color: isSelected ? '#fff' : C.ink }}>
                {monthLabel(m, s.locale)}
              </div>
              <div style={{ fontSize:11, marginTop:2, color: isSelected ? 'rgba(255,255,255,0.8)' : takenByOther ? C.muted : isMine ? C.gold : C.primary }}>
                {isMine ? gs.you : takenByOther ? store.userById(d, owner.userId)?.name : gs.available}
              </div>
            </button>
          );
        })}
      </div>
      {selected && (
        <Btn size="lg" style={{ width:'100%', marginTop:14 }}
          onClick={() => { store.pickMonth(g.id, user.id, selected); setSelected(null); onPicked?.(); }}>
          {gs.confirmPick} — {monthLabel(selected, s.locale)}
        </Btn>
      )}
    </Card>
  );
}

// ─── Schedule tab ─────────────────────────────────────────────────────────────
function ScheduleTab({ g, user, s, lang }) {
  const d = store.getDB();
  const gs = s.group;
  const months = store.monthsOf(g);
  const current = store.nowMonth();
  const pot = g.amount * (g.maxMembers - 1);

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
      {months.map((m, i) => {
        const owner = store.recipientOf(g, m);
        const ownerUser = owner ? store.userById(d, owner.userId) : null;
        const isMine = owner?.userId === user?.id;
        const isCurrent = m === current;
        const isPast = m < current;
        const paidCount = Object.keys(g.payments[m] || {}).filter((pid) => pid !== owner?.userId && store.memberOf(g, pid)).length;
        const payerTotal = Math.max(g.members.length - 1, 0);
        return (
          <div key={m} style={{
            display:'flex', alignItems:'center', gap:14, padding:'13px 16px', borderRadius:12,
            background: isMine ? C.goldLight : isCurrent ? C.primaryLight : C.surface,
            border: `1.5px solid ${isMine ? C.goldBorder : isCurrent ? C.primaryBorder : C.border}`,
            opacity: isPast && !isMine ? 0.75 : 1, boxShadow:C.shadow,
          }}>
            <div style={{ width:30, height:30, borderRadius:'50%', flexShrink:0,
              background: owner ? (isMine ? C.gold : C.primary) : C.surfaceAlt,
              border: owner ? 'none' : `1.5px dashed ${C.borderMid}`,
              color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800 }}>
              {owner ? i + 1 : ''}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                <span style={{ fontSize:14, fontWeight:700, color:C.ink }}>{monthLabel(m, s.locale)}</span>
                {isCurrent && <Badge>{gs.currentMonth}</Badge>}
                {isMine && <Badge color={C.gold} bg={C.goldLight} border={C.goldBorder}>{gs.you}</Badge>}
              </div>
              <div style={{ fontSize:12, color: owner ? C.muted : C.mutedLight, marginTop:2 }}>
                {owner
                  ? `${ownerUser?.name || '?'} ${gs.receives} ${fmtMoney(pot, g.currency, lang)}`
                  : gs.unassigned}
              </div>
            </div>
            {owner && payerTotal > 0 && (
              <div style={{ textAlign:'center', flexShrink:0 }}>
                <div style={{ fontSize:13, fontWeight:800, color: paidCount >= payerTotal ? C.primary : C.muted, fontFamily:font.display }}>
                  {paidCount}/{payerTotal}
                </div>
                <div style={{ fontSize:9, color:C.mutedLight, fontFamily:font.mono, textTransform:'uppercase' }}>{gs.paid}</div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Payments tab ─────────────────────────────────────────────────────────────
function PaymentsTab({ g, user, s, lang, admin }) {
  const d = store.getDB();
  const gs = s.group;
  const months = store.monthsOf(g);
  const current = store.nowMonth();
  const defaultOpen = months.includes(current) ? current : months[0];
  const [open, setOpen] = useState(defaultOpen);
  const pot = g.amount * (g.maxMembers - 1);

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
      {months.map((m) => {
        const owner = store.recipientOf(g, m);
        const ownerUser = owner ? store.userById(d, owner.userId) : null;
        const payers = g.members.filter((mem) => mem.userId !== owner?.userId);
        const paidCount = payers.filter((p) => g.payments[m]?.[p.userId]).length;
        const isOpen = open === m;
        return (
          <Card key={m} style={{ padding:0, overflow:'hidden' }}>
            <button onClick={() => setOpen(isOpen ? null : m)}
              style={{ width:'100%', display:'flex', alignItems:'center', gap:12, padding:'13px 16px',
                background: isOpen ? C.surfaceAlt : C.surface, border:'none', cursor:'pointer',
                fontFamily:font.body, textAlign:'start' }}>
              <Wallet size={16} color={owner ? C.primary : C.mutedLight} style={{ flexShrink:0 }} />
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:14, fontWeight:700, color:C.ink }}>
                  {monthLabel(m, s.locale)}{m === current ? ` · ${gs.currentMonth}` : ''}
                </div>
                <div style={{ fontSize:11, color:C.muted, marginTop:1 }}>
                  {owner ? `${ownerUser?.name} ${gs.receives} ${fmtMoney(pot, g.currency, lang)}` : gs.unassigned}
                </div>
              </div>
              {owner && payers.length > 0 && (
                <Badge color={paidCount >= payers.length ? C.primary : C.muted}
                  bg={paidCount >= payers.length ? C.primaryLight : C.surfaceAlt}
                  border={paidCount >= payers.length ? C.primaryBorder : C.border}>
                  {t(gs.progress, { p: paidCount, t: payers.length })}
                </Badge>
              )}
            </button>
            {isOpen && owner && (
              <div style={{ padding:'4px 16px 14px', display:'flex', flexDirection:'column', gap:6 }}>
                {payers.map((p) => {
                  const pu = store.userById(d, p.userId);
                  const paidAt = g.payments[m]?.[p.userId];
                  const canToggle = admin || p.userId === user?.id;
                  return (
                    <div key={p.userId} style={{ display:'flex', alignItems:'center', gap:10,
                      padding:'8px 12px', background:C.bg, borderRadius:10, border:`1px solid ${C.border}` }}>
                      {paidAt
                        ? <CheckCircle2 size={16} color={C.primary} style={{ flexShrink:0 }} />
                        : <Circle size={16} color={C.mutedLight} style={{ flexShrink:0 }} />}
                      <div style={{ flex:1, fontSize:13, fontWeight:600, color:C.ink }}>
                        {pu?.name}{p.userId === user?.id ? ` (${gs.you})` : ''}
                      </div>
                      <span style={{ fontSize:11, fontWeight:700, color: paidAt ? C.primary : C.muted }}>
                        {paidAt ? gs.paid : gs.notPaid}
                      </span>
                      {canToggle && (
                        <Btn size="sm" variant={paidAt ? 'secondary' : 'primary'}
                          onClick={() => store.togglePaid(g.id, m, p.userId)}>
                          {paidAt ? gs.unmark : gs.markPaid}
                        </Btn>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            {isOpen && !owner && (
              <div style={{ padding:'4px 16px 14px', fontSize:12, color:C.mutedLight }}>{gs.unassigned}</div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

// ─── Members tab ──────────────────────────────────────────────────────────────
function MembersTab({ g, user, s, admin, onLeft }) {
  const d = store.getDB();
  const gs = s.group;
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
      {g.members.map((m) => {
        const mu = store.userById(d, m.userId);
        const isMe = m.userId === user?.id;
        const isGroupAdmin = m.userId === g.adminId;
        return (
          <div key={m.userId} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px',
            background:C.surface, borderRadius:12, border:`1px solid ${C.border}`, boxShadow:C.shadow }}>
            <Avatar name={mu?.name} size={38} color={isGroupAdmin ? C.gold : C.primary} />
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                <span style={{ fontSize:14, fontWeight:700, color:C.ink }}>{mu?.name}{isMe ? ` (${gs.you})` : ''}</span>
                {isGroupAdmin && <Badge color={C.gold} bg={C.goldLight} border={C.goldBorder}><Crown size={10} style={{ verticalAlign:-1 }} /> {s.dash.adminBadge}</Badge>}
              </div>
              <div style={{ fontSize:12, color:C.muted, marginTop:2 }}>
                {m.month ? `${gs.monthOf}: ${monthLabel(m.month, s.locale)}` : gs.noMonth}
              </div>
            </div>
            {admin && !isGroupAdmin && (
              <Btn size="sm" variant="danger" onClick={() => {
                if (window.confirm(gs.removeConfirm)) store.removeMember(g.id, m.userId);
              }}>
                <Trash2 size={12} style={{ verticalAlign:-2 }} /> {gs.remove}
              </Btn>
            )}
            {isMe && !isGroupAdmin && (
              <Btn size="sm" variant="danger" onClick={() => {
                if (window.confirm(gs.leaveConfirm)) { store.removeMember(g.id, user.id); onLeft(); }
              }}>
                <LogOut size={12} style={{ verticalAlign:-2 }} /> {gs.leave}
              </Btn>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Manage tab (admin) ───────────────────────────────────────────────────────
function ManageTab({ g, s, lang, onDeleted }) {
  const d = store.getDB();
  const gs = s.group;
  const [form, setForm] = useState({
    name: g.name, description: g.description, amount: String(g.amount),
    maxMembers: String(g.maxMembers), startMonth: g.startMonth,
  });
  const [msg, setMsg] = useState(null); // {ok, text}
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const full = g.members.length >= g.maxMembers;

  const save = (e) => {
    e.preventDefault();
    setMsg(null);
    const amount = Number(form.amount);
    const maxMembers = Number(form.maxMembers);
    if (!form.name.trim() || !amount || amount <= 0) return setMsg({ ok:false, text:s.create.errAmount });
    if (!maxMembers || maxMembers < 2 || maxMembers > 36) return setMsg({ ok:false, text:s.create.errMax });
    try {
      store.updateGroup(g.id, {
        name: form.name.trim(), description: form.description.trim(),
        amount, maxMembers, startMonth: form.startMonth,
      });
      setMsg({ ok:true, text:gs.saved });
    } catch {
      setMsg({ ok:false, text:gs.errMaxTooLow });
    }
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <Card>
        <SectionTitle><UserPlus size={13} style={{ verticalAlign:-2 }} /> {gs.requests}</SectionTitle>
        {g.joinRequests.length === 0 ? (
          <Empty icon={UserPlus} text={gs.noRequests} />
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {g.joinRequests.map((r) => {
              const ru = store.userById(d, r.userId);
              return (
                <div key={r.userId} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px',
                  background:C.bg, borderRadius:10, border:`1px solid ${C.border}` }}>
                  <Avatar name={ru?.name} size={34} />
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14, fontWeight:700, color:C.ink }}>{ru?.name}</div>
                    <div style={{ fontSize:11, color:C.muted, direction:'ltr', textAlign:'start' }}>{ru?.email}{ru?.phone ? ` · ${ru.phone}` : ''}</div>
                  </div>
                  <Btn size="sm" disabled={full} onClick={() => store.approveRequest(g.id, r.userId)}>{gs.approve}</Btn>
                  <Btn size="sm" variant="danger" onClick={() => store.rejectRequest(g.id, r.userId)}>{gs.reject}</Btn>
                </div>
              );
            })}
            {full && <div style={{ fontSize:12, color:C.red }}>{gs.errFull}</div>}
          </div>
        )}
      </Card>

      <Card>
        <SectionTitle><Settings2 size={13} style={{ verticalAlign:-2 }} /> {gs.manageTitle}</SectionTitle>
        {msg && (
          <div style={{ padding:'10px 14px', borderRadius:10, fontSize:13, marginBottom:14,
            background: msg.ok ? C.primaryLight : C.redLight,
            border: `1px solid ${msg.ok ? C.primaryBorder : C.redBorder}`,
            color: msg.ok ? C.primaryDark : C.red }}>
            {msg.text}
          </div>
        )}
        <form onSubmit={save}>
          <Field label={s.create.name}><Input value={form.name} onChange={set('name')} /></Field>
          <Field label={s.create.desc}>
            <textarea value={form.description} onChange={set('description')} rows={2} style={{ ...inputStyle, resize:'vertical' }} />
          </Field>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
            <Field label={s.create.amount}><Input type="number" min="1" value={form.amount} onChange={set('amount')} dir="ltr" /></Field>
            <Field label={s.create.maxMembers}><Input type="number" min="2" max="36" value={form.maxMembers} onChange={set('maxMembers')} dir="ltr" /></Field>
            <Field label={s.create.startMonth}><Input type="month" value={form.startMonth} onChange={set('startMonth')} dir="ltr" /></Field>
          </div>
          <Btn type="submit" style={{ marginTop:4 }}>{gs.save}</Btn>
        </form>
      </Card>

      <Card style={{ border:`1px solid ${C.redBorder}` }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, flexWrap:'wrap' }}>
          <div style={{ fontSize:13, color:C.muted }}>{gs.deleteConfirm}</div>
          <Btn variant="danger" onClick={() => {
            if (window.confirm(gs.deleteConfirm)) { store.deleteGroup(g.id); onDeleted(); }
          }}>
            <Trash2 size={13} style={{ verticalAlign:-2 }} /> {gs.deleteGroup}
          </Btn>
        </div>
      </Card>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function GroupDetail({ db, groupId, user, s, lang, onBack }) {
  const [tab, setTab] = useState('schedule');
  const [changingMonth, setChangingMonth] = useState(false);
  const g = store.groupById(db, groupId);
  const gs = s.group;

  // The group can disappear underneath us (deleted on another device and
  // synced via realtime) — navigate home instead of rendering nothing.
  useEffect(() => { if (!g) onBack(); }, [g]);
  if (!g) return null;

  const member = store.memberOf(g, user.id);
  const admin = store.isAdmin(g, user.id);
  const requested = store.hasRequested(g, user.id);
  const full = g.members.length >= g.maxMembers;
  const spotsLeft = g.maxMembers - g.members.length;

  const tabs = [
    { id:'schedule', label:gs.tabs.schedule, Icon:CalendarDays },
    { id:'payments', label:gs.tabs.payments, Icon:Wallet, memberOnly:true },
    { id:'members', label:gs.tabs.members, Icon:Users },
    ...(admin ? [{ id:'manage', label:`${gs.tabs.manage}${g.joinRequests.length ? ` (${g.joinRequests.length})` : ''}`, Icon:Settings2 }] : []),
  ].filter((tb) => !tb.memberOnly || member);

  return (
    <div style={{ maxWidth:760, margin:'0 auto', padding:'24px 20px', display:'flex', flexDirection:'column', gap:16 }}>
      <div>
        <Btn variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft size={13} style={{ verticalAlign:-2, transform:s.dir==='rtl'?'scaleX(-1)':'none' }} /> {s.common.back}
        </Btn>
      </div>

      <Header g={g} s={s} lang={lang} admin={admin} />

      {/* Join banner for non-members */}
      {!member && (
        <Card style={{ background:C.goldLight, border:`1.5px solid ${C.goldBorder}` }}>
          <div style={{ display:'flex', alignItems:'center', gap:14, flexWrap:'wrap' }}>
            <HandCoins size={22} color={C.gold} style={{ flexShrink:0 }} />
            <div style={{ flex:1, minWidth:200 }}>
              <div style={{ fontSize:14, fontWeight:700, color:C.ink }}>
                {requested ? gs.requested : gs.notMember}
              </div>
              <div style={{ fontSize:12, color:C.muted, marginTop:3 }}>
                {gs.joinHint}{!full && !requested ? ` · ${t(gs.spotsLeft, { n: spotsLeft })}` : ''}
              </div>
            </div>
            {requested ? (
              <Btn variant="secondary" onClick={() => store.cancelRequest(g.id, user.id)}>{s.common.cancel}</Btn>
            ) : full ? (
              <Badge color={C.muted} bg={C.surfaceAlt} border={C.border}>{s.dash.full}</Badge>
            ) : (
              <Btn variant="gold" onClick={() => store.requestJoin(g.id, user.id)}>{gs.join}</Btn>
            )}
          </div>
        </Card>
      )}

      {/* Month picker: member without a month, or member changing month while forming */}
      {member && (!member.month || changingMonth) && (
        <MonthPicker g={g} user={user} s={s} lang={lang} onPicked={() => setChangingMonth(false)} />
      )}
      {member && member.month && !changingMonth && (
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px',
          background:C.goldLight, border:`1px solid ${C.goldBorder}`, borderRadius:12 }}>
          <Hourglass size={15} color={C.gold} />
          <div style={{ flex:1, fontSize:13, fontWeight:700, color:C.ink }}>
            {gs.yourMonthIs} {monthLabel(member.month, s.locale)}
          </div>
          {store.groupStatus(g) === 'forming' && (
            <Btn size="sm" variant="secondary" onClick={() => setChangingMonth(true)}>{gs.changeMonth}</Btn>
          )}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display:'flex', gap:6, borderBottom:`1.5px solid ${C.border}`, paddingBottom:0, flexWrap:'wrap' }}>
        {tabs.map(({ id, label, Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 15px', border:'none',
              background:'transparent', cursor:'pointer', fontFamily:font.body, fontSize:13,
              fontWeight: tab === id ? 800 : 600, color: tab === id ? C.primary : C.muted,
              borderBottom: `2.5px solid ${tab === id ? C.primary : 'transparent'}`, marginBottom:-1.5 }}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {tab === 'schedule' && <ScheduleTab g={g} user={user} s={s} lang={lang} />}
      {tab === 'payments' && member && <PaymentsTab g={g} user={user} s={s} lang={lang} admin={admin} />}
      {tab === 'members' && <MembersTab g={g} user={user} s={s} admin={admin} onLeft={onBack} />}
      {tab === 'manage' && admin && <ManageTab g={g} s={s} lang={lang} onDeleted={onBack} />}
    </div>
  );
}
