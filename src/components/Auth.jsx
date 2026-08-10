import { useState } from 'react';
import { HandCoins, Users, CalendarCheck } from 'lucide-react';
import { Card, Btn, Field, Input, ErrorBox, InfoBox, Logo } from './ui.jsx';
import * as store from '../store.js';

export default function Auth({ s }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);
  const a = s.auth;

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (mode === 'register') {
      if (!form.name.trim() || !form.email.trim() || !form.password) return setError(a.errRequired);
      if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return setError(a.errEmail);
      if (form.password.length < 6) return setError(a.errPassShort);
      if (form.password !== form.confirm) return setError(a.errPassMatch);
    } else if (!form.email.trim() || !form.password) {
      return setError(a.errRequired);
    }
    setInfo('');
    setBusy(true);
    try {
      if (mode === 'register') {
        const res = await store.register(form);
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
                  <Field label={a.name}><Input value={form.name} onChange={set('name')} autoComplete="name" /></Field>
                  <Field label={a.phone}><Input value={form.phone} onChange={set('phone')} autoComplete="tel" dir="ltr" inputMode="tel" /></Field>
                </>
              )}
              <Field label={a.email}><Input type="email" value={form.email} onChange={set('email')} autoComplete="email" dir="ltr" inputMode="email" /></Field>
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
