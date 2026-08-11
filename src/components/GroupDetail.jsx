import { useEffect, useState } from 'react';
import {
  ArrowLeft, Crown, Users, CalendarDays, Wallet, Settings2, ChevronDown,
  CheckCircle2, Circle, Hourglass, UserPlus, Trash2, LogOut, HandCoins, Landmark,
  EyeOff, PauseCircle, PlayCircle, Eye, ShieldAlert,
} from 'lucide-react';
import {
  Card, Btn, Badge, SectionTitle, Avatar, Empty, Field, Input, ErrorBox, InfoBox, ConfirmDialog,
} from './ui.jsx';
import { monthLabel, fmtMoney, t } from '../i18n.js';
import * as store from '../store.js';

const STATUS_VARIANT = { forming: 'gold', active: 'primary', completed: 'muted' };

const namesOf = (d, members) =>
  members.map((m) => store.userById(d, m.userId)?.name || '?').join(' + ');

// ─── Header ───────────────────────────────────────────────────────────────────
function Header({ g, s, lang, admin, platformAdmin, me }) {
  const d = store.getDB();
  const status = store.groupStatus(g);
  const gs = s.group;
  const adminUser = store.userById(d, g.adminId);
  const idealPot = g.amount * (g.maxMembers - 1);

  const stats = [
    { label: gs.monthlyAmount, val: fmtMoney(g.amount, g.currency, lang) },
    me
      ? { label: gs.yourDues, val: fmtMoney(store.duesOf(g, me), g.currency, lang) }
      : { label: gs.perTurn, val: fmtMoney(idealPot, g.currency, lang) },
    { label: gs.duration, val: `${g.maxMembers} ${gs.months}` },
    { label: gs.startsLabel, val: monthLabel(g.startMonth, s.locale) },
  ];

  return (
    <Card>
      <div className="group-card-head">
        <Avatar name={g.name} size={52} />
        <div style={{ flex: 1, minWidth: 200 }}>
          <div className="group-card-title">
            <span className="group-title">{g.name}</span>
            <Badge variant={STATUS_VARIANT[status]}>{gs.status[status]}</Badge>
            {admin && <Badge variant="gold"><Crown size={11} /> {s.dash.adminBadge}</Badge>}
            {g.hidden && (admin || platformAdmin) && <Badge variant="muted"><EyeOff size={11} /> {gs.hiddenBadge}</Badge>}
            {g.disabled && <Badge variant="danger"><PauseCircle size={11} /> {gs.disabledBadge}</Badge>}
          </div>
          {g.description && <p className="group-desc">{g.description}</p>}
          <div className="group-sub">
            {gs.adminLabel}: {adminUser?.name || '—'} · {g.members.length} {s.dash.members}
          </div>
        </div>
      </div>
      <div className="stat-grid" style={{ marginTop: 16 }}>
        {stats.map((st, i) => (
          <div key={i} className="stat">
            <div className="stat-label">{st.label}</div>
            <div className="stat-value">{st.val}</div>
          </div>
        ))}
      </div>
      <p className="hint-note">{gs.potNote}</p>
    </Card>
  );
}

// ─── Month picker (supports full and half shares) ─────────────────────────────
function MonthPicker({ g, user, s, lang, onPicked }) {
  const [selected, setSelected] = useState(null);
  const [shareChoice, setShareChoice] = useState('full');
  const gs = s.group;
  const months = store.monthsOf(g);
  const me = store.memberOf(g, user.id);
  const d = store.getDB();

  const selectedOthers = selected
    ? store.recipientsOf(g, selected).filter((m) => m.userId !== user.id)
    : [];
  const joiningHalf = selectedOthers.length === 1;
  const effectiveShare = joiningHalf ? 0.5 : (shareChoice === 'half' ? 0.5 : 1);

  return (
    <Card className="card-primary">
      <div className="stack" style={{ gap: 12 }}>
        <div>
          <div className="group-card-title" style={{ fontSize: 17 }}>
            <CalendarDays size={17} style={{ color: 'var(--primary)' }} />
            <span>{me.month ? gs.changeMonth : gs.pickTitle}</span>
          </div>
          <p className="field-hint" style={{ marginTop: 4 }}>{gs.pickHint}</p>
          <p className="field-hint" style={{ marginTop: 4 }}>{gs.shareHint}</p>
        </div>

        <div className="month-grid">
          {months.map((m) => {
            const occupants = store.recipientsOf(g, m).filter((x) => x.userId !== user.id);
            const mine = store.recipientsOf(g, m).some((x) => x.userId === user.id);
            const total = occupants.reduce((sum, x) => sum + store.shareOf(x), 0);
            const full = occupants.length >= 2 || total >= 1;
            const halfOpen = occupants.length === 1 && total === 0.5;
            const isSelected = selected === m;
            const cls = ['month-cell', isSelected && 'is-selected', mine && !isSelected && 'is-mine',
              halfOpen && !isSelected && !mine && 'is-half'].filter(Boolean).join(' ');
            return (
              <button
                key={m}
                type="button"
                disabled={full && !mine}
                className={cls}
                onClick={() => setSelected(isSelected ? null : m)}
                aria-pressed={isSelected}
              >
                <div className="month-cell-name">{monthLabel(m, s.locale)}</div>
                <div className="month-cell-owner">
                  {mine ? gs.you
                    : full ? namesOf(d, occupants)
                    : halfOpen ? `${gs.halfOpen} · ${namesOf(d, occupants)}`
                    : gs.available}
                </div>
              </button>
            );
          })}
        </div>

        {selected && !joiningHalf && (
          <div className="segmented" role="radiogroup" aria-label={gs.shareFull}>
            {[['full', gs.shareFull], ['half', gs.shareHalf]].map(([val, label]) => (
              <button key={val} type="button" role="radio" aria-checked={shareChoice === val}
                className={`segment${shareChoice === val ? ' is-active' : ''}`}
                onClick={() => setShareChoice(val)}>
                {label}
              </button>
            ))}
          </div>
        )}
        {selected && joiningHalf && <InfoBox>{gs.joinAsHalf}</InfoBox>}

        {selected && (
          <Btn size="lg" block
            onClick={() => {
              store.pickMonth(g.id, user.id, selected, effectiveShare);
              setSelected(null);
              onPicked?.();
            }}>
            {gs.confirmPick} — {monthLabel(selected, s.locale)}
            {effectiveShare === 0.5 ? ` (${gs.shareHalf})` : ''}
          </Btn>
        )}
      </div>
    </Card>
  );
}

// ─── Schedule tab ─────────────────────────────────────────────────────────────
function ScheduleTab({ g, user, s, lang }) {
  const d = store.getDB();
  const gs = s.group;
  const months = store.monthsOf(g);
  const current = store.nowMonth();

  return (
    <div className="stack-sm">
      {months.map((m, i) => {
        const recips = store.recipientsOf(g, m);
        const isMine = recips.some((r) => r.userId === user?.id);
        const isCurrent = m === current;
        const isPast = m < current;
        const halfOpen = store.monthShareTotal(g, m) === 0.5;
        const payers = g.members.filter((mem) => mem.month !== m);
        const paidCount = payers.filter((p) => g.payments[m]?.[p.userId]).length;
        const rowCls = ['schedule-row', isMine && 'is-mine', !isMine && isCurrent && 'is-current',
          isPast && !isMine && 'is-past'].filter(Boolean).join(' ');
        return (
          <div key={m} className={rowCls}>
            <span className={`turn-dot${recips.length ? (isMine ? ' is-gold' : '') : ' is-empty'}`}>
              {recips.length ? i + 1 : ''}
            </span>
            <div className="schedule-main">
              <div className="schedule-month">
                <span>{monthLabel(m, s.locale)}</span>
                {isCurrent && <Badge variant="primary">{gs.currentMonth}</Badge>}
                {isMine && <Badge variant="gold">{gs.you}</Badge>}
                {recips.length === 2 && <Badge variant="info">{gs.halfBadge}</Badge>}
              </div>
              <div className={`schedule-recipient${recips.length ? '' : ' is-unassigned'}`}>
                {recips.length === 0
                  ? gs.unassigned
                  : recips.length === 1
                    ? `${store.userById(d, recips[0].userId)?.name || '?'} ${gs.receives} ${fmtMoney(store.recipientCut(g, m, recips[0]), g.currency, lang)}${halfOpen ? ` · ${gs.halfOpen}` : ''}`
                    : `${namesOf(d, recips)} — ${fmtMoney(store.recipientCut(g, m, recips[0]), g.currency, lang)} ${gs.each}`}
              </div>
            </div>
            {recips.length > 0 && payers.length > 0 && (
              <div className="schedule-count">
                <div className={`schedule-count-value${paidCount >= payers.length ? ' is-complete' : ''}`}>
                  {paidCount}/{payers.length}
                </div>
                <div className="schedule-count-label">{gs.paid}</div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Payments tab ─────────────────────────────────────────────────────────────
function PaymentsTab({ g, user, s, lang, admin, frozen }) {
  const d = store.getDB();
  const gs = s.group;
  const months = store.monthsOf(g);
  const current = store.nowMonth();
  const [open, setOpen] = useState(months.includes(current) ? current : months[0]);

  return (
    <div className="stack-sm">
      {months.map((m) => {
        const recips = store.recipientsOf(g, m);
        const payers = g.members.filter((mem) => mem.month !== m);
        const paidCount = payers.filter((p) => g.payments[m]?.[p.userId]).length;
        const isOpen = open === m;
        return (
          <Card key={m} className="card-tight">
            <button
              type="button"
              className={`pay-head${isOpen ? ' is-open' : ''}`}
              onClick={() => setOpen(isOpen ? null : m)}
              aria-expanded={isOpen}
            >
              <Wallet size={16} style={{ color: recips.length ? 'var(--primary)' : 'var(--faint)', flexShrink: 0 }} />
              <div className="pay-head-main">
                <div className="pay-head-month">
                  {monthLabel(m, s.locale)}{m === current ? ` · ${gs.currentMonth}` : ''}
                </div>
                <div className="pay-head-sub">
                  {recips.length
                    ? `${namesOf(d, recips)} ${gs.receives} ${fmtMoney(store.potOf(g, m), g.currency, lang)}`
                    : gs.unassigned}
                </div>
              </div>
              {recips.length > 0 && payers.length > 0 && (
                <Badge variant={paidCount >= payers.length ? 'primary' : 'muted'}>
                  {t(gs.progress, { p: paidCount, t: payers.length })}
                </Badge>
              )}
              <ChevronDown size={16} className="pay-chevron" />
            </button>
            {isOpen && recips.length > 0 && payers.length > 0 && (
              <div className="progress" aria-hidden="true">
                <div className="progress-fill" style={{ width: `${(paidCount / payers.length) * 100}%` }} />
              </div>
            )}
            {isOpen && recips.length > 0 && (
              <div className="pay-body">
                {recips.map((r) => {
                  const ru = store.userById(d, r.userId);
                  return (
                    <div key={r.userId} className="send-to">
                      <Landmark size={14} />
                      <span>
                        {gs.sendTo} {ru?.name}
                        {recips.length === 2 ? ` (${fmtMoney(store.recipientCut(g, m, r), g.currency, lang)})` : ''}:
                      </span>
                      <bdi>{ru?.etransferEmail || ru?.email}</bdi>
                    </div>
                  );
                })}
                {payers.map((p) => {
                  const pu = store.userById(d, p.userId);
                  const paidAt = g.payments[m]?.[p.userId];
                  const canToggle = !frozen && (admin || p.userId === user?.id);
                  return (
                    <div key={p.userId} className="pay-row">
                      {paidAt
                        ? <CheckCircle2 size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                        : <Circle size={16} style={{ color: 'var(--faint)', flexShrink: 0 }} />}
                      <span className="pay-row-name">
                        {pu?.name}{p.userId === user?.id ? ` (${gs.you})` : ''}
                        <span className="pay-row-dues"> · {fmtMoney(store.duesOf(g, p), g.currency, lang)}</span>
                      </span>
                      <span className={`pay-row-status${paidAt ? ' is-paid' : ''}`}>
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
            {isOpen && recips.length === 0 && (
              <div className="pay-body">
                <span className="field-hint">{gs.unassigned}</span>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

// ─── Members tab ──────────────────────────────────────────────────────────────
function MembersTab({ g, user, s, lang, admin, onLeft }) {
  const d = store.getDB();
  const gs = s.group;
  const [confirming, setConfirming] = useState(null);

  const doConfirm = () => {
    if (confirming.type === 'leave') {
      store.removeMember(g.id, user.id);
      setConfirming(null);
      onLeft();
    } else {
      store.removeMember(g.id, confirming.userId);
      setConfirming(null);
    }
  };

  return (
    <div className="stack-sm">
      {g.members.map((m) => {
        const mu = store.userById(d, m.userId);
        const isMe = m.userId === user?.id;
        const isGroupAdmin = m.userId === g.adminId;
        const isHalf = store.shareOf(m) === 0.5;
        return (
          <div key={m.userId} className="member-row">
            <Avatar name={mu?.name} size={38} gold={isGroupAdmin} />
            <div className="member-main">
              <div className="member-name">
                <span>{mu?.name}{isMe ? ` (${gs.you})` : ''}</span>
                {isGroupAdmin && <Badge variant="gold"><Crown size={11} /> {s.dash.adminBadge}</Badge>}
                {isHalf && <Badge variant="info">{gs.halfBadge}</Badge>}
              </div>
              <div className="member-sub">
                {m.month ? `${gs.monthOf}: ${monthLabel(m.month, s.locale)}` : gs.noMonth}
                {` · ${fmtMoney(store.duesOf(g, m), g.currency, lang)} ${s.dash.monthly}`}
              </div>
              {(mu?.phone || mu?.etransferEmail) && (
                <div className="member-sub member-contact">
                  {[mu.phone, mu.etransferEmail].filter(Boolean).join(' · ')}
                </div>
              )}
            </div>
            {admin && !isGroupAdmin && (
              <Btn size="sm" variant="danger" onClick={() => setConfirming({ type: 'remove', userId: m.userId })}>
                <Trash2 size={13} /> {gs.remove}
              </Btn>
            )}
            {isMe && !isGroupAdmin && (
              <Btn size="sm" variant="danger" onClick={() => setConfirming({ type: 'leave' })}>
                <LogOut size={13} /> {gs.leave}
              </Btn>
            )}
          </div>
        );
      })}
      <ConfirmDialog
        open={Boolean(confirming)}
        danger
        title={confirming?.type === 'leave' ? gs.leave : gs.remove}
        body={confirming?.type === 'leave' ? gs.leaveConfirm : gs.removeConfirm}
        confirmLabel={s.common.confirm}
        cancelLabel={s.common.cancel}
        onConfirm={doConfirm}
        onCancel={() => setConfirming(null)}
      />
    </div>
  );
}

// ─── Manage tab (group admin + platform admin) ────────────────────────────────
function ManageTab({ g, s, platformAdmin, onDeleted }) {
  const d = store.getDB();
  const gs = s.group;
  const ac = s.adminc;
  const [form, setForm] = useState({
    name: g.name, description: g.description, amount: String(g.amount),
    maxMembers: String(g.maxMembers), startMonth: g.startMonth,
  });
  const [msg, setMsg] = useState(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const full = store.isGroupFull(g);

  const save = (e) => {
    e.preventDefault();
    setMsg(null);
    const amount = Number(form.amount);
    const maxMembers = Number(form.maxMembers);
    if (!form.name.trim() || !amount || amount <= 0) return setMsg({ ok: false, text: s.create.errAmount });
    if (!maxMembers || maxMembers < 2 || maxMembers > 36) return setMsg({ ok: false, text: s.create.errMax });
    try {
      store.updateGroup(g.id, {
        name: form.name.trim(), description: form.description.trim(),
        amount, maxMembers, startMonth: form.startMonth,
      });
      setMsg({ ok: true, text: gs.saved });
    } catch {
      setMsg({ ok: false, text: gs.errMaxTooLow });
    }
  };

  return (
    <div className="stack">
      {platformAdmin && (
        <Card className="card-gold">
          <div className="stack" style={{ gap: 10 }}>
            <SectionTitle><ShieldAlert size={13} /> {ac.title}</SectionTitle>
            <div className="head-row">
              <span className="field-hint">{g.hidden ? ac.hiddenNote : gs.hiddenBadge}</span>
              <Btn size="sm" variant="secondary" onClick={() => store.setGroupHidden(g.id, !g.hidden)}>
                {g.hidden ? <><Eye size={13} /> {ac.unhide}</> : <><EyeOff size={13} /> {ac.hide}</>}
              </Btn>
            </div>
            <div className="head-row">
              <span className="field-hint">{g.disabled ? ac.disabledNote : gs.disabledBadge}</span>
              <Btn size="sm" variant={g.disabled ? 'primary' : 'danger'}
                onClick={() => store.setGroupDisabled(g.id, !g.disabled)}>
                {g.disabled ? <><PlayCircle size={13} /> {ac.enable}</> : <><PauseCircle size={13} /> {ac.disable}</>}
              </Btn>
            </div>
          </div>
        </Card>
      )}

      <Card>
        <div className="stack" style={{ gap: 12 }}>
          <SectionTitle><UserPlus size={13} /> {gs.requests}</SectionTitle>
          {g.joinRequests.length === 0 ? (
            <Empty icon={UserPlus} text={gs.noRequests} />
          ) : (
            <div className="stack-sm">
              {g.joinRequests.map((r) => {
                const ru = store.userById(d, r.userId);
                return (
                  <div key={r.userId} className="member-row" style={{ background: 'var(--bg)' }}>
                    <Avatar name={ru?.name} size={34} />
                    <div className="member-main">
                      <div className="member-name">{ru?.name}</div>
                      <div className="member-sub member-contact">
                        {ru?.email}{ru?.phone ? ` · ${ru.phone}` : ''}
                      </div>
                    </div>
                    <Btn size="sm" disabled={full} onClick={() => store.approveRequest(g.id, r.userId)}>{gs.approve}</Btn>
                    <Btn size="sm" variant="danger" onClick={() => store.rejectRequest(g.id, r.userId)}>{gs.reject}</Btn>
                  </div>
                );
              })}
              {full && <ErrorBox>{gs.errFull}</ErrorBox>}
            </div>
          )}
        </div>
      </Card>

      <Card>
        <form onSubmit={save} className="stack" style={{ gap: 14 }}>
          <SectionTitle><Settings2 size={13} /> {gs.manageTitle}</SectionTitle>
          {msg && (msg.ok ? <InfoBox>{msg.text}</InfoBox> : <ErrorBox>{msg.text}</ErrorBox>)}
          <Field label={s.create.name}><Input value={form.name} onChange={set('name')} /></Field>
          <Field label={s.create.desc}>
            <textarea className="input" value={form.description} onChange={set('description')} rows={2} />
          </Field>
          <div className="form-row form-row-3">
            <Field label={s.create.amount}>
              <Input type="number" min="1" value={form.amount} onChange={set('amount')} dir="ltr" inputMode="numeric" />
            </Field>
            <Field label={s.create.maxMembers}>
              <Input type="number" min="2" max="36" value={form.maxMembers} onChange={set('maxMembers')} dir="ltr" inputMode="numeric" />
            </Field>
            <Field label={s.create.startMonth}>
              <Input type="month" value={form.startMonth} onChange={set('startMonth')} dir="ltr" />
            </Field>
          </div>
          <div><Btn type="submit">{gs.save}</Btn></div>
        </form>
      </Card>

      <Card className="card-danger-outline">
        <div className="head-row">
          <span className="field-hint" style={{ maxWidth: 420 }}>{gs.deleteConfirm}</span>
          <Btn variant="danger" onClick={() => setConfirmingDelete(true)}>
            <Trash2 size={14} /> {gs.deleteGroup}
          </Btn>
        </div>
      </Card>

      <ConfirmDialog
        open={confirmingDelete}
        danger
        title={gs.deleteGroup}
        body={gs.deleteConfirm}
        confirmLabel={s.common.confirm}
        cancelLabel={s.common.cancel}
        onConfirm={() => { store.deleteGroup(g.id); setConfirmingDelete(false); onDeleted(); }}
        onCancel={() => setConfirmingDelete(false)}
      />
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function GroupDetail({ db, groupId, user, s, lang, onBack }) {
  const [tab, setTab] = useState('schedule');
  const [changingMonth, setChangingMonth] = useState(false);
  const g = store.groupById(db, groupId);
  const gs = s.group;

  useEffect(() => {
    if (g) return undefined;
    const timer = setTimeout(onBack, 2500);
    return () => clearTimeout(timer);
  }, [g]);
  if (!g) return <div className="loading-screen">{s.common.loading}</div>;

  const member = store.memberOf(g, user.id);
  const admin = store.isAdmin(g, user.id);
  const platformAdmin = store.isPlatformAdmin(db, user.id);
  const requested = store.hasRequested(g, user.id);
  const full = store.isGroupFull(g);
  const openCount = store.openMonths(g).length;
  const frozen = g.disabled;

  const tabs = [
    { id: 'schedule', label: gs.tabs.schedule, Icon: CalendarDays },
    { id: 'payments', label: gs.tabs.payments, Icon: Wallet, memberOnly: true },
    { id: 'members', label: gs.tabs.members, Icon: Users },
    ...((admin || platformAdmin) ? [{
      id: 'manage',
      label: `${gs.tabs.manage}${g.joinRequests.length ? ` (${g.joinRequests.length})` : ''}`,
      Icon: Settings2,
    }] : []),
  ].filter((tb) => !tb.memberOnly || member);

  const sharedWithNames = member?.month
    ? namesOf(db, store.recipientsOf(g, member.month).filter((m) => m.userId !== user.id))
    : '';

  return (
    <div className="page stack">
      <div>
        <Btn variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft size={14} style={{ transform: s.dir === 'rtl' ? 'scaleX(-1)' : 'none' }} /> {s.common.back}
        </Btn>
      </div>

      <Header g={g} s={s} lang={lang} admin={admin} platformAdmin={platformAdmin} me={member} />

      {/* Disabled notice */}
      {frozen && (
        <Card className="card-danger-outline">
          <div className="banner" style={{ padding: 0 }}>
            <PauseCircle size={22} style={{ color: 'var(--danger)', flexShrink: 0 }} />
            <div className="banner-main">
              <div className="banner-title">{gs.disabledTitle}</div>
              <div className="banner-sub">{gs.disabledDesc}</div>
            </div>
          </div>
        </Card>
      )}

      {/* Join banner for non-members */}
      {!member && !frozen && (
        <Card className="card-gold">
          <div className="banner" style={{ padding: 0 }}>
            <HandCoins size={22} style={{ color: 'var(--gold)', flexShrink: 0 }} />
            <div className="banner-main">
              <div className="banner-title">{requested ? gs.requested : gs.notMember}</div>
              <div className="banner-sub">
                {gs.joinHint}{!full && !requested ? ` · ${t(gs.monthsOpen, { n: openCount })}` : ''}
              </div>
            </div>
            {requested ? (
              <Btn variant="secondary" onClick={() => store.cancelRequest(g.id, user.id)}>{s.common.cancel}</Btn>
            ) : full ? (
              <Badge variant="muted">{s.dash.full}</Badge>
            ) : (
              <Btn variant="gold" onClick={() => store.requestJoin(g.id, user.id)}>{gs.join}</Btn>
            )}
          </div>
        </Card>
      )}

      {/* Month picker / current month banner */}
      {member && !frozen && (!member.month || changingMonth) && (
        <MonthPicker g={g} user={user} s={s} lang={lang} onPicked={() => setChangingMonth(false)} />
      )}
      {member && member.month && (!changingMonth || frozen) && (
        <div className="banner banner-gold">
          <Hourglass size={15} style={{ color: 'var(--gold)', flexShrink: 0 }} />
          <div className="banner-main">
            <span className="banner-title">
              {gs.yourMonthIs} {monthLabel(member.month, s.locale)}
              {store.shareOf(member) === 0.5 ? ` (${gs.halfBadge}${sharedWithNames ? ` — ${gs.sharedWith} ${sharedWithNames}` : ''})` : ''}
            </span>
          </div>
          {store.groupStatus(g) === 'forming' && !frozen && (
            <Btn size="sm" variant="secondary" onClick={() => setChangingMonth(true)}>{gs.changeMonth}</Btn>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="tabs" role="tablist">
        {tabs.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            className={`tab${tab === id ? ' is-active' : ''}`}
            onClick={() => setTab(id)}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {tab === 'schedule' && <ScheduleTab g={g} user={user} s={s} lang={lang} />}
      {tab === 'payments' && member && (
        <PaymentsTab g={g} user={user} s={s} lang={lang} admin={admin || platformAdmin} frozen={frozen} />
      )}
      {tab === 'members' && (
        <MembersTab g={g} user={user} s={s} lang={lang} admin={admin || platformAdmin} onLeft={onBack} />
      )}
      {tab === 'manage' && (admin || platformAdmin) && (
        <ManageTab g={g} s={s} platformAdmin={platformAdmin} onDeleted={onBack} />
      )}
    </div>
  );
}
