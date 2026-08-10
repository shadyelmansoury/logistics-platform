import { useState } from 'react';
import { HandCoins, Users, CalendarCheck } from 'lucide-react';
import { C, font } from '../theme.js';
import { Card, Btn, Field, Input, ErrorBox } from './ui.jsx';
import * as store from '../store.js';

export default function Auth({ s }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name:'', email:'', phone:'', password:'', confirm:'' });
  const [error, setError] = useState('');
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
    setBusy(true);
    try {
      if (mode === 'register') await store.register(form);
      else await store.login(form.email, form.password);
    } catch (err) {
      setError(err.message === 'emailTaken' ? a.errEmailTaken : a.errInvalid);
    } finally {
      setBusy(false);
    }
  };

  const features = [
    { Icon: Users, text: s.dir === 'rtl' ? 'مجموعة من ناس تعرفهم وتثق فيهم' : 'A circle of people you know and trust' },
    { Icon: HandCoins, text: s.dir === 'rtl' ? 'مبلغ ثابت متفق عليه كل شهر' : 'A fixed agreed amount every month' },
    { Icon: CalendarCheck, text: s.dir === 'rtl' ? 'كل عضو يختار شهر قبضه بنفسه' : 'Each member picks their own payout month' },
  ];

  return (
    <div style={{ maxWidth:960, margin:'0 auto', padding:'40px 20px', display:'grid',
      gridTemplateColumns:'1fr', gap:28 }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:44, fontWeight:800, color:C.primary, fontFamily:font.display, lineHeight:1.1 }}>
          {s.appName} <span style={{ color:C.gold }}>·</span> <span style={{ color:C.ink }}>{s.appNameAr}</span>
        </div>
        <div style={{ fontSize:15, color:C.muted, marginTop:8 }}>{s.tagline}</div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:24, alignItems:'start' }}>
        <Card style={{ padding:24 }}>
          <div style={{ fontSize:19, fontWeight:800, color:C.ink, marginBottom:4, fontFamily:font.display }}>
            {mode === 'login' ? a.loginTitle : a.registerTitle}
          </div>
          <div style={{ fontSize:12, color:C.muted, marginBottom:18 }}>{a.welcome}</div>
          <ErrorBox>{error}</ErrorBox>
          <form onSubmit={submit}>
            {mode === 'register' && (
              <>
                <Field label={a.name}><Input value={form.name} onChange={set('name')} autoComplete="name" /></Field>
                <Field label={a.phone}><Input value={form.phone} onChange={set('phone')} autoComplete="tel" dir="ltr" /></Field>
              </>
            )}
            <Field label={a.email}><Input type="email" value={form.email} onChange={set('email')} autoComplete="email" dir="ltr" /></Field>
            <Field label={a.password}><Input type="password" value={form.password} onChange={set('password')} autoComplete={mode==='login'?'current-password':'new-password'} dir="ltr" /></Field>
            {mode === 'register' && (
              <Field label={a.confirm}><Input type="password" value={form.confirm} onChange={set('confirm')} autoComplete="new-password" dir="ltr" /></Field>
            )}
            <Btn type="submit" size="lg" disabled={busy} style={{ width:'100%', marginTop:6 }}>
              {mode === 'login' ? a.login : a.register}
            </Btn>
          </form>
          <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
            style={{ background:'none', border:'none', color:C.primary, fontSize:13, fontWeight:600,
              cursor:'pointer', marginTop:16, width:'100%', fontFamily:font.body }}>
            {mode === 'login' ? a.toRegister : a.toLogin}
          </button>
        </Card>

        <div>
          <Card style={{ background:C.primaryLight, border:`1px solid ${C.primaryBorder}`, padding:22 }}>
            <div style={{ fontSize:14, color:C.inkMid, lineHeight:1.8 }}>{a.intro}</div>
          </Card>
          <div style={{ display:'flex', flexDirection:'column', gap:10, marginTop:14 }}>
            {features.map(({ Icon, text }, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px',
                background:C.surface, borderRadius:12, border:`1px solid ${C.border}` }}>
                <div style={{ width:36, height:36, borderRadius:10, background:C.goldLight,
                  border:`1px solid ${C.goldBorder}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <Icon size={18} color={C.gold} />
                </div>
                <div style={{ fontSize:13, color:C.inkMid, fontWeight:600 }}>{text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
