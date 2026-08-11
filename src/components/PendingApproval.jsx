import { Hourglass } from 'lucide-react';
import { Card, Btn, Logo } from './ui.jsx';
import * as store from '../store.js';

// Shown to freshly registered accounts until a platform admin approves them.
export default function PendingApproval({ s }) {
  const a = s.auth;
  return (
    <div className="page page-narrow">
      <Card style={{ maxWidth: 440, marginInline: 'auto', textAlign: 'center' }}>
        <div className="stack" style={{ gap: 14, alignItems: 'center' }}>
          <Logo size={52} />
          <span className="feature-icon" style={{ width: 46, height: 46 }}>
            <Hourglass size={22} />
          </span>
          <div className="page-title" style={{ fontSize: 19 }}>{a.pendingTitle}</div>
          <p className="field-hint" style={{ maxWidth: 360 }}>{a.pendingDesc}</p>
          <Btn variant="secondary" onClick={() => store.logout()}>{s.nav.logout}</Btn>
        </div>
      </Card>
    </div>
  );
}
