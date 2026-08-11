import { useEffect, useState } from 'react';
import { ArrowLeft, ShieldCheck, Shield, UserRound, Landmark } from 'lucide-react';
import { Card, Btn, Field, Input, ErrorBox, InfoBox, SectionTitle, ConfirmDialog, PhoneInput } from './ui.jsx';
import * as store from '../store.js';

// ─── 2FA management ───────────────────────────────────────────────────────────
function MfaSection({ s }) {
  const ac = s.account;
  const [state, setState] = useState({ loading: true, enabled: false, factorId: null });
  const [enrolling, setEnrolling] = useState(null); // { factorId, qr, secret }
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState(null); // { ok, text }
  const [confirmDisable, setConfirmDisable] = useState(false);
  const [busy, setBusy] = useState(false);

  const loadStatus = () =>
    store.mfaStatus()
      .then((st) => setState({ loading: false, ...st }))
      .catch(() => setState({ loading: false, enabled: false, factorId: null }));

  useEffect(() => { if (store.mfaAvailable) loadStatus(); }, []);

  if (!store.mfaAvailable) {
    return <InfoBox>{ac.mfaDemoNote}</InfoBox>;
  }
  if (state.loading) return <div className="field-hint">{s.common.loading}</div>;

  const startEnroll = async () => {
    setMsg(null);
    setBusy(true);
    try {
      setEnrolling(await store.mfaEnroll());
      setCode('');
    } catch {
      setMsg({ ok: false, text: s.auth.errGeneric });
    } finally {
      setBusy(false);
    }
  };

  const activate = async (e) => {
    e.preventDefault();
    setMsg(null);
    setBusy(true);
    try {
      await store.mfaVerifyEnroll(enrolling.factorId, code.trim());
      setEnrolling(null);
      setMsg({ ok: true, text: ac.mfaEnabled });
      loadStatus();
    } catch {
      setMsg({ ok: false, text: s.auth.errMfa });
    } finally {
      setBusy(false);
    }
  };

  const disable = async () => {
    setConfirmDisable(false);
    setMsg(null);
    try {
      await store.mfaUnenroll(state.factorId);
      setMsg({ ok: true, text: ac.mfaDisabled });
      loadStatus();
    } catch {
      setMsg({ ok: false, text: s.auth.errGeneric });
    }
  };

  const qrSrc = enrolling
    ? (enrolling.qr.startsWith('data:') ? enrolling.qr
       : `data:image/svg+xml;utf8,${encodeURIComponent(enrolling.qr)}`)
    : null;

  return (
    <div className="stack" style={{ gap: 12 }}>
      {msg && (msg.ok ? <InfoBox>{msg.text}</InfoBox> : <ErrorBox>{msg.text}</ErrorBox>)}

      <div className="banner" style={{ padding: 0 }}>
        {state.enabled
          ? <ShieldCheck size={20} style={{ color: 'var(--primary)', flexShrink: 0 }} />
          : <Shield size={20} style={{ color: 'var(--faint)', flexShrink: 0 }} />}
        <div className="banner-main">
          <div className="banner-title">
            {ac.mfaHeading} — {state.enabled ? ac.mfaOn : ac.mfaOff}
          </div>
          <div className="banner-sub">{ac.mfaDesc}</div>
        </div>
        {state.enabled ? (
          <Btn variant="danger" size="sm" onClick={() => setConfirmDisable(true)}>{ac.mfaDisable}</Btn>
        ) : !enrolling && (
          <Btn size="sm" onClick={startEnroll} disabled={busy}>{ac.mfaEnable}</Btn>
        )}
      </div>

      {enrolling && (
        <div className="mfa-enroll">
          <p className="field-hint">{ac.mfaScan}</p>
          <div className="qr-box">
            <img src={qrSrc} alt="2FA QR code" width="180" height="180" />
          </div>
          <p className="field-hint">{ac.mfaSecret}</p>
          <code className="mfa-secret">{enrolling.secret}</code>
          <form onSubmit={activate} className="mfa-code-row">
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="000000"
              dir="ltr"
              inputMode="numeric"
              maxLength={6}
              autoComplete="one-time-code"
              aria-label={ac.mfaConfirmCode}
            />
            <Btn type="submit" disabled={busy || code.trim().length !== 6}>{ac.mfaActivate}</Btn>
            <Btn variant="ghost" onClick={() => setEnrolling(null)}>{s.common.cancel}</Btn>
          </form>
        </div>
      )}

      <ConfirmDialog
        open={confirmDisable}
        danger
        title={ac.mfaDisable}
        body={ac.mfaDisableConfirm}
        confirmLabel={s.common.confirm}
        cancelLabel={s.common.cancel}
        onConfirm={disable}
        onCancel={() => setConfirmDisable(false)}
      />
    </div>
  );
}

// ─── Account page ─────────────────────────────────────────────────────────────
export default function Account({ user, s, onBack }) {
  const ac = s.account;
  const a = s.auth;
  const [form, setForm] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    phone: user.phone || '',
    etransferEmail: user.etransferEmail || user.email || '',
  });
  const [msg, setMsg] = useState(null);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const save = (e) => {
    e.preventDefault();
    setMsg(null);
    if (!form.firstName.trim() || !form.lastName.trim()) return setMsg({ ok: false, text: a.errRequired });
    if (!form.phone.trim()) return setMsg({ ok: false, text: a.errPhoneRequired });
    if (!/^\S+@\S+\.\S+$/.test(form.etransferEmail.trim())) return setMsg({ ok: false, text: a.errEmail });
    store.updateProfile(user.id, {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      phone: form.phone.trim(),
      etransferEmail: form.etransferEmail.trim(),
    });
    setMsg({ ok: true, text: ac.saved });
  };

  return (
    <div className="page page-narrow stack">
      <div>
        <Btn variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft size={14} style={{ transform: s.dir === 'rtl' ? 'scaleX(-1)' : 'none' }} /> {s.common.back}
        </Btn>
      </div>

      <Card>
        <form onSubmit={save} className="stack" style={{ gap: 14 }}>
          <div>
            <SectionTitle><UserRound size={13} /> {ac.title}</SectionTitle>
            <p className="field-hint" style={{ marginTop: 6 }}>{ac.subtitle}</p>
          </div>
          {msg && (msg.ok ? <InfoBox>{msg.text}</InfoBox> : <ErrorBox>{msg.text}</ErrorBox>)}
          <div className="form-row form-row-2">
            <Field label={a.firstName}>
              <Input value={form.firstName} onChange={set('firstName')} autoComplete="given-name" />
            </Field>
            <Field label={a.lastName}>
              <Input value={form.lastName} onChange={set('lastName')} autoComplete="family-name" />
            </Field>
          </div>
          <Field label={a.phone}>
            <PhoneInput value={form.phone} countries={s.countries} ariaLabel={a.phone}
              onChange={(v) => setForm((f) => ({ ...f, phone: v }))} />
          </Field>
          <Field label={a.email} hint={ac.emailNote}>
            <Input value={user.email} disabled dir="ltr" />
          </Field>
          <Field label={<span className="label-icon"><Landmark size={13} /> {a.etransferEmail}</span>} hint={a.etransferHint}>
            <Input type="email" value={form.etransferEmail} onChange={set('etransferEmail')} dir="ltr" inputMode="email" />
          </Field>
          <div><Btn type="submit">{ac.save}</Btn></div>
        </form>
      </Card>

      <Card>
        <div className="stack" style={{ gap: 12 }}>
          <SectionTitle><ShieldCheck size={13} /> {ac.security}</SectionTitle>
          <MfaSection s={s} />
        </div>
      </Card>
    </div>
  );
}
