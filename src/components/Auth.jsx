import { useState } from 'react';
import { HandCoins, Users, CalendarCheck, Landmark } from 'lucide-react';
import { Card, Btn, Field, Input, ErrorBox, InfoBox, Logo, PhoneInput } from './ui.jsx';
import * as store from '../store.js';

export default function Auth({ s }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    etransferEmail: '', sameEtransfer: true,
    password: '', confirm: '',
  });
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);
  const a = s.auth;

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const isEmail = (v) => /^\S+@\S+\.\S+$/.test(v.trim());

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (mode === 'register') {
      if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim() || !form.password) {
        return setError(a.errRequired);
      }
      if (!form.phone.trim()) return setError(a.errPhoneRequired);
      if (!isEmail(form.email)) return setError(a.errEmail);
      if (!form.sameEtransfer && !isEmail(form.etransferEmail)) return setError(a.errEmail);
      if (form.password.length < 6) return setError(a.errPassShort);
      if (form.password !== form.confirm) return setError(a.errPassMatch);
    } else if (!form.email.trim() || !form.password) {
      return setError(a.errRequired);
    }
    setInfo('');
    setBusy(true);
    try {
      if (mode === 'register') {
        const res = await store.register({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          etransferEmail: form.sameEtransfer ? form.email : form.etransferEmail,
          password: form.password,
        });
        if (res?.needsConfirmation) {
          setInfo(a.confirmSent);
          setMode('login');
        }
      } else {
        await store.login(form.email, form.password);
      }
    } catch (err) {
      setError(
        err.message === 'emailTaken' ? a.errEmailTaken
        : err.message === 'invalidCreds' ? a.errInvalid
        : mode === 'login' ? a.errInvalid : a.errGeneric,
      );
    } finally {
      setBusy(false);
    }
  };

  const isAr = s.dir === 'rtl';
  const features = [
    { Icon: Users, text: isAr ? 'مجموعة من ناس تعرفهم وتثق فيهم' : 'A circle of people you know and trust' },
    { Icon: HandCoins, text: isAr ? 'مبلغ ثابت متفق عليه كل شهر' : 'A fixed agreed amount every month' },
    { Icon: CalendarCheck, text: isAr ? 'كل عضو يختار شهر قبضه بنفسه' : 'Each member picks their own payout month' },
    { Icon: Landmark, text: isAr ? 'التحويلات على بريد حسابك البنكي مباشرة' : 'Money goes straight to your bank e-transfer email' },
  ];

  return (
    <div className="page">
      <div className="auth-hero">
        <span className="auth-logo"><Logo size={56} /></span>
        <h1 className="auth-title">
          <span className="accent">{s.appName}</span> · {s.appNameAr}
        </h1>
        <p className="auth-tagline">{s.tagline}</p>
      </div>

      <div className="auth-grid">
        <Card>
          <div className="stack" style={{ gap: 14 }}>
            <div>
              <div className="page-title" style={{ fontSize: 19 }}>
                {mode === 'login' ? a.loginTitle : a.registerTitle}
              </div>
              <div className="field-hint">{a.welcome}</div>
            </div>
            <ErrorBox>{error}</ErrorBox>
            <InfoBox>{info}</InfoBox>
            <form onSubmit={submit} className="stack" style={{ gap: 14 }}>
              {mode === 'register' && (
                <>
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
                </>
              )}
              <Field label={a.email}>
                <Input type="email" value={form.email} onChange={set('email')} autoComplete="email" dir="ltr" inputMode="email" />
              </Field>
              {mode === 'register' && (
                <Field label={a.etransferEmail} hint={a.etransferHint}>
                  <label className="check-row">
                    <input
                      type="checkbox"
                      checked={form.sameEtransfer}
                      onChange={(e) => setForm({ ...form, sameEtransfer: e.target.checked })}
                    />
                    <span>{a.sameAsEmail}</span>
                  </label>
                  {!form.sameEtransfer && (
                    <Input type="email" value={form.etransferEmail} onChange={set('etransferEmail')}
                      dir="ltr" inputMode="email" style={{ marginTop: 6 }} />
                  )}
                </Field>
              )}
              <Field label={a.password}>
                <Input type="password" value={form.password} onChange={set('password')}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'} dir="ltr" />
              </Field>
              {mode === 'register' && (
                <Field label={a.confirm}>
                  <Input type="password" value={form.confirm} onChange={set('confirm')} autoComplete="new-password" dir="ltr" />
                </Field>
              )}
              <Btn type="submit" size="lg" block disabled={busy}>
                {mode === 'login' ? a.login : a.register}
              </Btn>
            </form>
            <button
              type="button"
              className="link-btn"
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
            >
              {mode === 'login' ? a.toRegister : a.toLogin}
            </button>
          </div>
        </Card>

        <div className="stack" style={{ gap: 12 }}>
          <Card className="card-primary">
            <p style={{ fontSize: 14, lineHeight: 1.8 }}>{a.intro}</p>
          </Card>
          {features.map(({ Icon, text }, i) => (
            <div key={i} className="feature-row">
              <span className="feature-icon"><Icon size={18} /></span>
              <span className="feature-text">{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
