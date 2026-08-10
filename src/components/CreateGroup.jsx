import { useState } from 'react';
import { ArrowLeft, Crown } from 'lucide-react';
import { Card, Btn, Field, Input, ErrorBox } from './ui.jsx';
import { t, fmtMoney } from '../i18n.js';
import * as store from '../store.js';

const CURRENCIES = ['EGP', 'USD', 'EUR', 'SAR', 'AED'];

export default function CreateGroup({ user, s, lang, onDone, onBack }) {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const defaultStart = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}`;

  const [form, setForm] = useState({
    name: '', description: '', amount: '', currency: 'EGP', maxMembers: '10', startMonth: defaultStart,
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
    <div className="page page-narrow">
      <Btn variant="ghost" size="sm" onClick={onBack} style={{ marginBottom: 14 }}>
        <ArrowLeft size={14} style={{ transform: s.dir === 'rtl' ? 'scaleX(-1)' : 'none' }} /> {s.common.back}
      </Btn>
      <Card>
        <form onSubmit={submit} className="stack" style={{ gap: 16 }}>
          <h1 className="page-title">{c.title}</h1>
          <ErrorBox>{error}</ErrorBox>
          <Field label={c.name}><Input value={form.name} onChange={set('name')} placeholder={c.namePh} /></Field>
          <Field label={c.desc}>
            <textarea className="input" value={form.description} onChange={set('description')} placeholder={c.descPh} rows={3} />
          </Field>
          <div className="form-row form-row-2-1">
            <Field label={c.amount}>
              <Input type="number" min="1" value={form.amount} onChange={set('amount')} dir="ltr" inputMode="numeric" />
            </Field>
            <Field label={c.currency}>
              <select className="input" value={form.currency} onChange={set('currency')}>
                {CURRENCIES.map((cur) => <option key={cur} value={cur}>{s.currencies[cur]}</option>)}
              </select>
            </Field>
          </div>
          <div className="form-row form-row-2">
            <Field label={c.maxMembers}>
              <Input type="number" min="2" max="36" value={form.maxMembers} onChange={set('maxMembers')} dir="ltr" inputMode="numeric" />
            </Field>
            <Field label={c.startMonth}>
              <Input type="month" value={form.startMonth} onChange={set('startMonth')} dir="ltr" />
            </Field>
          </div>

          {potPreview && <div className="alert alert-info">{potPreview}</div>}
          <div className="banner banner-gold">
            <Crown size={16} style={{ color: 'var(--gold)', flexShrink: 0 }} />
            <div className="banner-main">
              <div className="banner-sub" style={{ marginTop: 0 }}>{c.youAdmin}</div>
            </div>
          </div>

          <Btn type="submit" size="lg" block>{c.submit}</Btn>
        </form>
      </Card>
    </div>
  );
}
