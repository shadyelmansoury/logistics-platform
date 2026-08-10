import { useState } from 'react';
import { ArrowLeft, Crown } from 'lucide-react';
import { C, font } from '../theme.js';
import { Card, Btn, Field, Input, inputStyle, ErrorBox } from './ui.jsx';
import { t, fmtMoney } from '../i18n.js';
import * as store from '../store.js';

const CURRENCIES = ['EGP', 'USD', 'EUR', 'SAR', 'AED'];

export default function CreateGroup({ user, s, lang, onDone, onBack }) {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const defaultStart = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}`;

  const [form, setForm] = useState({
    name:'', description:'', amount:'', currency:'EGP', maxMembers:'10', startMonth:defaultStart,
  });
  const [error, setError] = useState('');
  const c = s.create;

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const n = Number(form.maxMembers) || 0;
  const amount = Number(form.amount) || 0;
  const potPreview = n >= 2 && amount > 0
    ? t(c.hint, { n, total: fmtMoney(amount * (n - 1), form.currency, lang) })
    : null;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) return setError(s.auth.errRequired);
    if (!amount || amount <= 0) return setError(c.errAmount);
    if (!n || n < 2 || n > 36) return setError(c.errMax);
    if (!/^\d{4}-\d{2}$/.test(form.startMonth)) return setError(c.errStart);
    try {
      const g = await store.createGroup({ ...form, adminId: user.id });
      onDone(g.id);
    } catch {
      setError(s.auth.errGeneric);
    }
  };

  return (
    <div style={{ maxWidth:560, margin:'0 auto', padding:'28px 20px' }}>
      <Btn variant="ghost" size="sm" onClick={onBack} style={{ marginBottom:14 }}>
        <ArrowLeft size={13} style={{ verticalAlign:-2, transform:s.dir==='rtl'?'scaleX(-1)':'none' }} /> {s.common.back}
      </Btn>
      <Card style={{ padding:24 }}>
        <div style={{ fontSize:22, fontWeight:800, color:C.ink, fontFamily:font.display, marginBottom:18 }}>{c.title}</div>
        <ErrorBox>{error}</ErrorBox>
        <form onSubmit={submit}>
          <Field label={c.name}><Input value={form.name} onChange={set('name')} placeholder={c.namePh} /></Field>
          <Field label={c.desc}>
            <textarea value={form.description} onChange={set('description')} placeholder={c.descPh}
              rows={3} style={{ ...inputStyle, resize:'vertical' }} />
          </Field>
          <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:12 }}>
            <Field label={c.amount}><Input type="number" min="1" value={form.amount} onChange={set('amount')} dir="ltr" /></Field>
            <Field label={c.currency}>
              <select value={form.currency} onChange={set('currency')} style={inputStyle}>
                {CURRENCIES.map((cur) => <option key={cur} value={cur}>{s.currencies[cur]}</option>)}
              </select>
            </Field>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <Field label={c.maxMembers}><Input type="number" min="2" max="36" value={form.maxMembers} onChange={set('maxMembers')} dir="ltr" /></Field>
            <Field label={c.startMonth}><Input type="month" value={form.startMonth} onChange={set('startMonth')} dir="ltr" /></Field>
          </div>

          {potPreview && (
            <div style={{ padding:'12px 14px', background:C.primaryLight, border:`1px solid ${C.primaryBorder}`,
              borderRadius:10, fontSize:13, color:C.primaryDark, lineHeight:1.6, marginBottom:14 }}>
              {potPreview}
            </div>
          )}
          <div style={{ display:'flex', gap:10, alignItems:'flex-start', padding:'12px 14px',
            background:C.goldLight, border:`1px solid ${C.goldBorder}`, borderRadius:10, marginBottom:18 }}>
            <Crown size={15} color={C.gold} style={{ flexShrink:0, marginTop:2 }} />
            <div style={{ fontSize:12, color:C.inkMid, lineHeight:1.6 }}>{c.youAdmin}</div>
          </div>

          <Btn type="submit" size="lg" style={{ width:'100%' }}>{c.submit}</Btn>
        </form>
      </Card>
    </div>
  );
}
