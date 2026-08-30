import { useEffect, useState } from 'react';
import {
  ArrowLeft, Crown, Users, CalendarDays, Wallet, Settings2, ChevronDown,
  CheckCircle2, Circle, Hourglass, UserPlus, Trash2, LogOut, HandCoins, Landmark,
  EyeOff, PauseCircle, PlayCircle, Eye, ShieldAlert, PartyPopper, ChevronDown as ChevronExpand,
  Pencil,
} from 'lucide-react';
import {
  Card, Btn, Badge, SectionTitle, Avatar, Empty, Field, Input, ErrorBox, InfoBox, ConfirmDialog, CopyChip,
} from './ui.jsx';
import { monthLabel, fmtMoney, t } from '../i18n.js';
import * as store from '../store.js';

const STATUS_VARIANT = { forming: 'gold', active: 'primary', completed: 'muted' };

const namesOf = (d, members) =>
  members.map((m) => store.userById(d, m.userId)?.name || '?').join(' + ');

// ─── Header ───────────────────────────────────────────────────────────────────
function Header({ g, s, lang, admin, platformAdmin, me, onEdit }) {
  const d = store.getDB();
  const status = store.groupStatus(g);
  const gs = s.group;
  const adminUser = store.userById(d, g.adminId);
  const idealPot = g.amount * (g.maxMembers - 1);

  const stats = [
    { label: gs.monthlyAmount, val: fmtMoney(g.amount, g.currency, lang) },
    me
      ? { label: gs.yourDues, val: fmtMoney(store.memberTotalDues(g, me.userId), g.currency, lang) }
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
            {onEdit && (
              <button type="button" className="edit-pencil" onClick={onEdit}
                aria-label={gs.editGroup} title={gs.editGroup}>
                <Pencil size={14} />
              </button>
            )}
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
function MonthPicker({
  g, s, forUserId, excludeSlotId = null,
  title, hint, cta, onConfirm, onCancel, errorMsg,
}) {
  const [selected, setSelected] = useState(null);
  const [shareChoice, setShareChoice] = useState('full');
  const gs = s.group;
  const months = store.monthsOf(g);
  const d = store.getDB();

  const selectedOthers = selected
    ? store.recipientsOf(g, selected).filter((m) => m.userId !== forUserId && m.id !== excludeSlotId)
    : [];
  const joiningHalf = selectedOthers.length === 1;
  const effectiveShare = joiningHalf ? 0.5 : (shareChoice === 'half' ? 0.5 : 1);

  return (
    <Card className="card-primary">
      <div className="stack" style={{ gap: 12 }}>
        <div className="head-row">
          <div>
            <div className="group-card-title" style={{ fontSize: 17 }}>
              <CalendarDays size={17} style={{ color: 'var(--primary)' }} />
              <span>{title}</span>
            </div>
            <p className="field-hint" style={{ marginTop: 4 }}>{hint}</p>
            <p className="field-hint" style={{ marginTop: 4 }}>{gs.shareHint}</p>
          </div>
          {onCancel && (
            <Btn size="sm" variant="ghost" onClick={onCancel}>{s.common.cancel}</Btn>
          )}
        </div>

        {errorMsg && <ErrorBox>{errorMsg}</ErrorBox>}

        <div className="month-grid">
          {months.map((m) => {
            const here = store.recipientsOf(g, m);
            const mine = here.some((x) => x.userId === forUserId && x.id !== excludeSlotId);
            const occupants = here.filter((x) => x.userId !== forUserId && x.id !== excludeSlotId);
            const total = occupants.reduce((sum, x) => sum + store.shareOf(x), 0);
            const full = occupants.length >= 2 || total >= 1;
            const halfOpen = occupants.length === 1 && total === 0.5;
            const isSelected = selected === m;
            const disabled = mine || full;
            const cls = ['month-cell', isSelected && 'is-selected', mine && !isSelected && 'is-mine',
              halfOpen && !isSelected && !mine && 'is-half'].filter(Boolean).join(' ');
            return (
              <button
                key={m}
                type="button"
                disabled={disabled}
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
            onClick={() => { onConfirm(selected, effectiveShare); setSelected(null); }}>
            {cta} — {monthLabel(selected, s.locale)}
            {effectiveShare === 0.5 ? ` (${gs.shareHalf})` : ''}
          </Btn>
        )}
      </div>
    </Card>
  );
}

// ─── This month's due payment (member quick-confirm) ─────────────────────────
function DueCard({ g, user, s, lang }) {
  const d = store.getDB();
  const gs = s.group;
  const due = store.currentDueMonth(g);
  const slots = store.memberSlots(g, user.id);
  if (!due || slots.length === 0 || g.disabled) return null;

  const iReceive = slots.some((sl) => sl.month === due);
  const myDues = store.memberDuesForMonth(g, user.id, due);

  // A "your turn" banner shows if any of my slots receives this month.
  const receiveBanner = iReceive ? (
    <div className="banner banner-gold">
      <HandCoins size={15} style={{ color: 'var(--gold)', flexShrink: 0 }} />
      <div className="banner-main"><span className="banner-title">{gs.dueYourTurn}</span></div>
    </div>
  ) : null;

  // Nothing to pay this month (only receiving, or no dues) → just the banner.
  if (myDues <= 0) return receiveBanner;

  const paid = store.hasPaid(g, due, user.id);
  const overdue = !paid && store.isPastGraceDay();
  const recips = store.recipientsOf(g, due);
  const amount = fmtMoney(myDues, g.currency, lang);

  return (
    <>
    {receiveBanner}
    <Card className={overdue ? 'card-danger-outline' : paid ? '' : 'card-primary'}>
      <div className="banner" style={{ padding: 0 }}>
        {paid
          ? <CheckCircle2 size={22} style={{ color: 'var(--primary)', flexShrink: 0 }} />
          : <Wallet size={22} style={{ color: overdue ? 'var(--danger)' : 'var(--primary)', flexShrink: 0 }} />}
        <div className="banner-main">
          <div className="banner-title" style={overdue ? { color: 'var(--danger)' } : undefined}>
            {overdue ? gs.overdueTitle : t(gs.dueTitle, { month: monthLabel(due, s.locale) })}
          </div>
          <div className="banner-sub">
            {paid
              ? gs.duePaid
              : overdue
                ? t(gs.overdueDesc, { amount, month: monthLabel(due, s.locale) })
                : recips.length
                  ? t(gs.dueSend, { amount, name: namesOf(d, recips) })
                  : t(gs.dueSend, { amount, name: '—' })}
          </div>
          {recips.map((r) => {
            const ru = store.userById(d, r.userId);
            return (ru?.etransferEmail || ru?.email) ? (
              <div key={r.userId} className="send-to" style={{ marginTop: 8 }}>
                <Landmark size={14} />
                <span>{gs.sendTo} {ru.name}:</span>
                <CopyChip text={ru.etransferEmail || ru.email}
                  copyLabel={s.common.copy} copiedLabel={s.common.copied} />
              </div>
            ) : null;
          })}
        </div>
        {paid ? (
          <Btn size="sm" variant="secondary" onClick={() => store.togglePaid(g.id, due, user.id)}>{gs.unmark}</Btn>
        ) : (
          <Btn variant={overdue ? 'solid-danger' : 'primary'} onClick={() => store.togglePaid(g.id, due, user.id)}>
            <CheckCircle2 size={15} /> {gs.confirmPaid}
          </Btn>
        )}
      </div>
    </Card>
    </>
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
        const payers = store.payersOf(g, m);
        const paidCount = payers.filter((uid) => g.payments[m]?.[uid]).length;
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
            {isCurrent && recips.length > 0 && (
              <div className="schedule-sendto">
                {recips.map((r) => {
                  const ru = store.userById(d, r.userId);
                  return (ru?.etransferEmail || ru?.email) ? (
                    <CopyChip key={r.userId} text={ru.etransferEmail || ru.email}
                      copyLabel={s.common.copy} copiedLabel={s.common.copied} />
                  ) : null;
                })}
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
        const payers = store.payersOf(g, m);
        const paidCount = payers.filter((uid) => g.payments[m]?.[uid]).length;
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
                      <CopyChip text={ru?.etransferEmail || ru?.email || ''}
                        copyLabel={s.common.copy} copiedLabel={s.common.copied} />
                    </div>
                  );
                })}
                {payers.map((uid) => {
                  const pu = store.userById(d, uid);
                  const paidAt = g.payments[m]?.[uid];
                  const canToggle = !frozen && (admin || uid === user?.id);
                  return (
                    <div key={uid} className="pay-row">
                      {paidAt
                        ? <CheckCircle2 size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                        : <Circle size={16} style={{ color: 'var(--faint)', flexShrink: 0 }} />}
                      <span className="pay-row-name">
                        {pu?.name}{uid === user?.id ? ` (${gs.you})` : ''}
                        <span className="pay-row-dues"> · {fmtMoney(store.memberDuesForMonth(g, uid, m), g.currency, lang)}</span>
                      </span>
                      <span className={`pay-row-status${paidAt ? ' is-paid' : ''}`}>
                        {paidAt ? gs.paid : gs.notPaid}
                      </span>
                      {canToggle && (
                        <Btn size="sm" variant={paidAt ? 'secondary' : 'primary'}
                          onClick={() => store.togglePaid(g.id, m, uid)}>
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
function MemberHistory({ g, member, s, lang }) {
  const gs = s.group;
  const now = store.nowMonth();
  const elapsed = store.monthsOf(g).filter((m) => m <= now);
  if (elapsed.length === 0) return <div className="pay-body"><span className="field-hint">—</span></div>;
  return (
    <div className="pay-body">
      {elapsed.map((m) => {
        const received = member.month === m;
        const paid = store.hasPaid(g, m, member.userId);
        return (
          <div key={m} className="pay-row">
            {received
              ? <HandCoins size={16} style={{ color: 'var(--gold)', flexShrink: 0 }} />
              : paid
                ? <CheckCircle2 size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                : <Circle size={16} style={{ color: 'var(--faint)', flexShrink: 0 }} />}
            <span className="pay-row-name">{monthLabel(m, s.locale)}</span>
            <span className={`pay-row-status${(received || paid) ? ' is-paid' : ''}`}
              style={received ? { color: 'var(--gold)' } : undefined}>
              {received
                ? t(gs.historyReceived, { amount: fmtMoney(store.recipientCut(g, m, member), g.currency, lang) })
                : paid ? gs.paid : gs.notPaid}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function MembersTab({ g, user, s, lang, admin, onLeft }) {
  const d = store.getDB();
  const gs = s.group;
  const [confirming, setConfirming] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [moving, setMoving] = useState(null);
  const [moveMsg, setMoveMsg] = useState(null);
  const now = store.nowMonth();
  const elapsedFor = (m) => store.monthsOf(g).filter((mm) => mm <= now && mm !== m.month);
  const paidCountFor = (m) => elapsedFor(m).filter((mm) => store.hasPaid(g, mm, m.userId)).length;

  const doConfirm = () => {
    const isLastOwn = confirming.type === 'leave'
      && store.memberSlots(g, user.id).length <= 1;
    store.removeSlot(g.id, confirming.slotId);
    setConfirming(null);
    if (isLastOwn) onLeft();
  };

  return (
    <div className="stack-sm">
      {g.members.map((m) => {
        const mu = store.userById(d, m.userId);
        const isMe = m.userId === user?.id;
        const isGroupAdmin = m.userId === g.adminId;
        const isHalf = store.shareOf(m) === 0.5;
        const elapsedCount = elapsedFor(m).length;
        const isExpanded = expanded === m.id;
        return (
          <div key={m.id} className="member-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 0, padding: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', flexWrap: 'wrap' }}>
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
              {elapsedCount > 0 && (
                <Btn size="sm" variant="ghost"
                  onClick={() => setExpanded(isExpanded ? null : m.id)}
                  aria-expanded={isExpanded}>
                  <Badge variant={paidCountFor(m) >= elapsedCount ? 'primary' : 'muted'}>
                    {t(gs.historyChip, { p: paidCountFor(m), t: elapsedCount })}
                  </Badge>
                  <ChevronExpand size={14} style={{ transform: isExpanded ? 'rotate(180deg)' : 'none' }} />
                </Btn>
              )}
              {admin && (
                <Btn size="sm" variant="secondary"
                  onClick={() => { setMoving(moving === m.id ? null : m.id); setMoveMsg(null); }}>
                  <CalendarDays size={13} /> {gs.moveMonth}
                </Btn>
              )}
              {admin && !isGroupAdmin && (
                <Btn size="sm" variant="danger" onClick={() => setConfirming({ type: 'remove', slotId: m.id })}>
                  <Trash2 size={13} /> {gs.remove}
                </Btn>
              )}
              {isMe && !isGroupAdmin && (
                <Btn size="sm" variant="danger" onClick={() => setConfirming({ type: 'leave', slotId: m.id })}>
                  <LogOut size={13} /> {gs.leave}
                </Btn>
              )}
            </div>
            {moving === m.id && (
              <div style={{ padding: '0 16px 14px' }}>
                <MonthPicker g={g} s={s} forUserId={m.userId} excludeSlotId={m.id}
                  title={gs.moveTitle} hint={gs.moveHint} cta={gs.moveCta} errorMsg={moveMsg}
                  onConfirm={(mo, sh) => {
                    try { store.moveSlot(g.id, m.id, mo, sh); setMoving(null); setMoveMsg(null); }
                    catch { setMoveMsg(gs.changeErrFull); }
                  }}
                  onCancel={() => { setMoving(null); setMoveMsg(null); }} />
              </div>
            )}
            {isExpanded && <MemberHistory g={g} member={m} s={s} lang={lang} />}
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
  const [mcMsg, setMcMsg] = useState(null);
  const [addUid, setAddUid] = useState('');
  const [addMonth, setAddMonth] = useState('');
  const [addMsg, setAddMsg] = useState(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const full = store.isGroupFull(g);
  const eligible = d.users.filter((u) =>
    (u.approved || u.role === 'admin') && !g.members.some((m) => m.userId === u.id));
  const doAddMember = () => {
    if (!addUid) return;
    setAddMsg(null);
    try {
      store.adminAddMember(g.id, addUid, addMonth || null);
      setAddUid(''); setAddMonth('');
    } catch (e) {
      setAddMsg(e.message === 'groupFull' ? gs.errFull : gs.changeErrFull);
    }
  };

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
        <div className="stack" style={{ gap: 12 }}>
          <SectionTitle><UserPlus size={13} /> {gs.addMemberTitle}</SectionTitle>
          <p className="field-hint">{gs.addMemberHint}</p>
          {addMsg && <ErrorBox>{addMsg}</ErrorBox>}
          {eligible.length === 0 ? (
            <Empty icon={Users} text={gs.addMemberNone} />
          ) : (
            <>
              <div className="form-row form-row-2">
                <select className="input" value={addUid} onChange={(e) => { setAddUid(e.target.value); setAddMsg(null); }}>
                  <option value="">{gs.pickMemberPh}</option>
                  {eligible.map((u) => <option key={u.id} value={u.id}>{u.name || u.email}</option>)}
                </select>
                <select className="input" value={addMonth} onChange={(e) => setAddMonth(e.target.value)} disabled={!addUid}>
                  <option value="">{gs.monthLater}</option>
                  {store.openMonths(g).map((m) => <option key={m} value={m}>{monthLabel(m, s.locale)}</option>)}
                </select>
              </div>
              <div><Btn onClick={doAddMember} disabled={!addUid || full}>{gs.addMemberBtn}</Btn></div>
              {full && <ErrorBox>{gs.errFull}</ErrorBox>}
            </>
          )}
        </div>
      </Card>

      <Card>
        <div className="stack" style={{ gap: 12 }}>
          <SectionTitle><CalendarDays size={13} /> {gs.changeRequests}</SectionTitle>
          {mcMsg && <ErrorBox>{mcMsg}</ErrorBox>}
          {(g.monthChangeRequests || []).length === 0 ? (
            <Empty icon={CalendarDays} text={gs.noRequests} />
          ) : (
            <div className="stack-sm">
              {g.monthChangeRequests.map((r) => {
                const ru = store.userById(d, r.userId);
                const current = g.members.find((m) => m.id === r.slotId)?.month;
                return (
                  <div key={r.slotId} className="member-row" style={{ background: 'var(--bg)' }}>
                    <Avatar name={ru?.name} size={34} />
                    <div className="member-main">
                      <div className="member-name">{ru?.name}</div>
                      <div className="member-sub">
                        {gs.currentLabel}: {current ? monthLabel(current, s.locale) : '—'}
                        {' → '}
                        {gs.requestedLabel}: {monthLabel(r.month, s.locale)}
                        {r.share === 0.5 ? ` (${gs.halfBadge})` : ''}
                      </div>
                    </div>
                    <Btn size="sm" onClick={() => {
                      setMcMsg(null);
                      try { store.approveMonthChange(g.id, r.slotId); }
                      catch { setMcMsg(gs.changeErrFull); }
                    }}>{gs.approve}</Btn>
                    <Btn size="sm" variant="danger" onClick={() => store.rejectMonthChange(g.id, r.slotId)}>{gs.reject}</Btn>
                  </div>
                );
              })}
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

// ─── My months (pick, change, add extra months) ──────────────────────────────
function MySlots({ g, user, s, lang, frozen }) {
  const gs = s.group;
  const d = store.getDB();
  const [changingSlot, setChangingSlot] = useState(null);
  const [adding, setAdding] = useState(false);
  const slots = store.memberSlots(g, user.id);
  const emptySlot = slots.find((sl) => !sl.month) || null;
  const filled = slots.filter((sl) => sl.month);
  const openCount = store.openMonths(g).length;

  return (
    <div className="stack-sm">
      {/* First pick fills the empty join slot */}
      {!frozen && emptySlot && (
        <MonthPicker g={g} s={s} forUserId={user.id}
          title={gs.pickTitle} hint={gs.pickHint} cta={gs.confirmPick}
          onConfirm={(m, sh) => store.pickMonth(g.id, user.id, m, sh)} />
      )}

      {/* Each confirmed month */}
      {filled.map((sl) => {
        const change = store.monthChangeOfSlot(g, sl.id);
        const sharedWith = store.shareOf(sl) === 0.5
          ? namesOf(d, store.recipientsOf(g, sl.month).filter((m) => m.userId !== user.id))
          : '';
        if (changingSlot === sl.id && !change) {
          return (
            <MonthPicker key={sl.id} g={g} s={s} forUserId={user.id} excludeSlotId={sl.id}
              title={gs.requestChangeTitle} hint={gs.requestChangeHint} cta={gs.requestChangeCta}
              onConfirm={(m, sh) => { store.requestMonthChange(g.id, user.id, sl.id, m, sh); setChangingSlot(null); }}
              onCancel={() => setChangingSlot(null)} />
          );
        }
        return (
          <div key={sl.id} className="banner banner-gold">
            <Hourglass size={15} style={{ color: 'var(--gold)', flexShrink: 0 }} />
            <div className="banner-main">
              <span className="banner-title">
                {gs.yourMonthIs} {monthLabel(sl.month, s.locale)}
                {store.shareOf(sl) === 0.5 ? ` (${gs.halfBadge}${sharedWith ? ` — ${gs.sharedWith} ${sharedWith}` : ''})` : ''}
              </span>
              {change && (
                <span className="banner-sub">{t(gs.changePending, { month: monthLabel(change.month, s.locale) })}</span>
              )}
            </div>
            {change ? (
              <Btn size="sm" variant="secondary" onClick={() => store.cancelMonthChange(g.id, sl.id)}>{s.common.cancel}</Btn>
            ) : !frozen ? (
              <Btn size="sm" variant="secondary" onClick={() => setChangingSlot(sl.id)}>{gs.changeMonth}</Btn>
            ) : null}
          </div>
        );
      })}

      {/* Add another month */}
      {!frozen && !emptySlot && (adding ? (
        <MonthPicker g={g} s={s} forUserId={user.id}
          title={gs.pickTitle} hint={gs.pickHint} cta={gs.confirmPick}
          onConfirm={(m, sh) => { store.pickMonth(g.id, user.id, m, sh); setAdding(false); }}
          onCancel={() => setAdding(false)} />
      ) : openCount > 0 ? (
        <div>
          <Btn variant="secondary" onClick={() => setAdding(true)}>
            <CalendarDays size={14} /> {gs.addMonth}
          </Btn>
        </div>
      ) : null)}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function GroupDetail({ db, groupId, initialTab, user, s, lang, onBack }) {
  const [tab, setTab] = useState(
    ['schedule', 'payments', 'members', 'manage'].includes(initialTab) ? initialTab : 'schedule',
  );
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

  const canSeeDetails = Boolean(member) || admin || platformAdmin;

  return (
    <div className="page stack">
      <div>
        <Btn variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft size={14} style={{ transform: s.dir === 'rtl' ? 'scaleX(-1)' : 'none' }} /> {s.common.back}
        </Btn>
      </div>

      <Header g={g} s={s} lang={lang} admin={admin} platformAdmin={platformAdmin} me={member}
        onEdit={(admin || platformAdmin) ? () => setTab('manage') : null} />

      {/* Completion celebration */}
      {store.groupStatus(g) === 'completed' && (
        <Card className="card-gold">
          <div className="banner" style={{ padding: 0 }}>
            <PartyPopper size={24} style={{ color: 'var(--gold)', flexShrink: 0 }} />
            <div className="banner-main">
              <div className="banner-title" style={{ fontSize: 16 }}>{gs.completedTitle}</div>
              <div className="banner-sub">
                {t(gs.completedDesc, {
                  total: fmtMoney(
                    store.monthsOf(g).reduce((sum, m) => sum + store.potOf(g, m), 0),
                    g.currency, lang,
                  ),
                })}
              </div>
            </div>
          </div>
        </Card>
      )}

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

      {/* This month's due payment */}
      {member && <DueCard g={g} user={user} s={s} lang={lang} />}

      {/* Your months: pick your first month, change a month (admin approval),
          or add extra months (any number of open months) */}
      {member && <MySlots g={g} user={user} s={s} lang={lang} frozen={frozen} />}

      {/* Non-members see the summary only; details unlock on approval */}
      {!canSeeDetails && (
        <Empty icon={EyeOff} text={gs.lockedDetails} />
      )}

      {/* Tabs */}
      {canSeeDetails && (
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

      )}

      {canSeeDetails && tab === 'schedule' && <ScheduleTab g={g} user={user} s={s} lang={lang} />}
      {canSeeDetails && tab === 'payments' && member && (
        <PaymentsTab g={g} user={user} s={s} lang={lang} admin={admin || platformAdmin} frozen={frozen} />
      )}
      {canSeeDetails && tab === 'members' && (
        <MembersTab g={g} user={user} s={s} lang={lang} admin={admin || platformAdmin} onLeft={onBack} />
      )}
      {canSeeDetails && tab === 'manage' && (admin || platformAdmin) && (
        <ManageTab g={g} s={s} platformAdmin={platformAdmin} onDeleted={onBack} />
      )}
    </div>
  );
}
