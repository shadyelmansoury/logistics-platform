import { useState } from 'react';
import { KeyRound } from 'lucide-react';
import { Card, Btn, Field, Input, ErrorBox } from './ui.jsx';
import * as store from '../store.js';

// Shown when the user arrives via a password-reset email link: they must set
// a new password before the app continues.
export default function SetPassword({ s }) {
  const a = s.auth;
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) return setError(a.errPassShort);
    if (password !== confirm) return setError(a.errPassMatch);
    setBusy(true);
    try {
      await store.updatePassword(password);
    } catch {
      setError(a.errGeneric);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page page-narrow">
      <Card style={{ maxWidth: 420, marginInline: 'auto' }}>
        <div className="stack" style={{ gap: 14 }}>
          <div style={{ textAlign: 'center' }}>
            <span className="feature-icon" style={{ marginInline: 'auto', width: 46, height: 46 }}>
              <KeyRound size={22} />
            </span>
            <div className="page-title" style={{ fontSize: 19, marginTop: 10 }}>{a.newPasswordTitle}</div>
            <p className="field-hint" style={{ marginTop: 6 }}>{a.newPasswordDesc}</p>
          </div>
          <ErrorBox>{error}</ErrorBox>
          <form onSubmit={submit} className="stack" style={{ gap: 14 }}>
            <Field label={a.newPassword}>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password" dir="ltr" autoFocus />
            </Field>
            <Field label={a.confirm}>
              <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password" dir="ltr" />
            </Field>
            <Btn type="submit" size="lg" block disabled={busy}>{a.updatePassword}</Btn>
          </form>
        </div>
      </Card>
    </div>
  );
}
