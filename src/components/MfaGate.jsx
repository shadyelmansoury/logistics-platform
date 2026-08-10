import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { Card, Btn, Input, ErrorBox } from './ui.jsx';
import * as store from '../store.js';

// Second login step for accounts with 2FA enabled: the password was correct,
// now the 6-digit authenticator code must be verified before any data loads.
export default function MfaGate({ s }) {
  const a = s.auth;
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await store.completeMfaLogin(code.trim());
    } catch {
      setError(a.errMfa);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page page-narrow">
      <Card style={{ maxWidth: 420, marginInline: 'auto' }}>
        <div className="stack" style={{ gap: 14, textAlign: 'center' }}>
          <span className="feature-icon" style={{ marginInline: 'auto', width: 46, height: 46 }}>
            <ShieldCheck size={22} />
          </span>
          <div>
            <div className="page-title" style={{ fontSize: 19 }}>{a.mfaTitle}</div>
            <p className="field-hint" style={{ marginTop: 6 }}>{a.mfaPrompt}</p>
          </div>
          <ErrorBox>{error}</ErrorBox>
          <form onSubmit={submit} className="stack" style={{ gap: 12 }}>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="000000"
              dir="ltr"
              inputMode="numeric"
              maxLength={6}
              autoComplete="one-time-code"
              aria-label={a.mfaCode}
              style={{ textAlign: 'center', fontSize: 22, letterSpacing: 6, fontFamily: 'var(--font-mono)' }}
              autoFocus
            />
            <Btn type="submit" size="lg" block disabled={busy || code.trim().length !== 6}>
              {a.mfaVerify}
            </Btn>
            <Btn variant="ghost" onClick={() => store.logout()}>{s.common.cancel}</Btn>
          </form>
        </div>
      </Card>
    </div>
  );
}
