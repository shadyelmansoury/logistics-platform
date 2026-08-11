import { useEffect, useState } from 'react';
import { Copy, Check } from 'lucide-react';

// ─── Brand mark (same drawing as public/favicon.svg) ──────────────────────────
export const Logo = ({ size = 34 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="Gameya">
    <rect width="64" height="64" rx="15" fill="#0C7B5F" />
    <g fill="none" stroke="#FFFFFF" strokeWidth="4.6" strokeLinecap="round">
      <path d="M16.2 29.2 A16 16 0 0 1 47.8 29.2" />
      <path d="M47.8 34.8 A16 16 0 0 1 16.2 34.8" />
    </g>
    <path d="M43.6 27.6 L52 26.4 L48.7 34.3 Z" fill="#FFFFFF" />
    <path d="M20.4 36.4 L12 37.6 L15.3 29.7 Z" fill="#FFFFFF" />
    <circle cx="32" cy="32" r="6.4" fill="#EFC968" />
    <circle cx="32" cy="32" r="2.6" fill="#0C7B5F" />
  </svg>
);

// ─── Primitives ───────────────────────────────────────────────────────────────

export const Card = ({ children, className = '', ...rest }) => (
  <div className={`card ${className}`} {...rest}>{children}</div>
);

export const Btn = ({ children, variant = 'primary', size = 'md', block = false, type = 'button', className = '', ...rest }) => (
  <button
    type={type}
    className={`btn btn-${variant}${size !== 'md' ? ` btn-${size}` : ''}${block ? ' btn-block' : ''}${className ? ` ${className}` : ''}`}
    {...rest}
  >
    {children}
  </button>
);

export const Badge = ({ children, variant = 'primary', className = '' }) => (
  <span className={`badge badge-${variant}${className ? ` ${className}` : ''}`}>{children}</span>
);

export const Field = ({ label, children, hint }) => (
  <div className="field">
    <label className="field-label">{label}</label>
    {children}
    {hint && <div className="field-hint">{hint}</div>}
  </div>
);

export const Input = ({ className = '', ...rest }) => (
  <input className={`input${className ? ` ${className}` : ''}`} {...rest} />
);

export const ErrorBox = ({ children }) =>
  children ? <div className="alert alert-error" role="alert">{children}</div> : null;

export const InfoBox = ({ children }) =>
  children ? <div className="alert alert-info" role="status">{children}</div> : null;

export const SectionTitle = ({ children, className = '' }) => (
  <h2 className={`section-title${className ? ` ${className}` : ''}`}>{children}</h2>
);

export const Avatar = ({ name, size = 36, gold = false }) => {
  const initials = (name || '?').split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  return (
    <span
      className={`avatar${gold ? ' avatar-gold' : ''}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
};

export const Empty = ({ icon: Icon, text }) => (
  <div className="empty">
    {Icon && <Icon size={30} />}
    <div className="empty-text">{text}</div>
  </div>
);

// ─── Copy-to-clipboard chip ───────────────────────────────────────────────────
// Shows the value in a monospace chip with a one-tap copy button — used for
// e-transfer emails so payers never retype them by hand.

export function CopyChip({ text, copyLabel, copiedLabel }) {
  const [copied, setCopied] = useState(false);
  const doCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Older browsers: fall back to a hidden textarea
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button type="button" className={`copy-chip${copied ? ' is-copied' : ''}`} onClick={doCopy}
      title={copied ? copiedLabel : copyLabel} aria-label={`${copyLabel}: ${text}`}>
      <bdi>{text}</bdi>
      {copied ? <Check size={13} /> : <Copy size={13} />}
      <span className="copy-chip-label">{copied ? copiedLabel : copyLabel}</span>
    </button>
  );
}

// ─── Phone input with country dial-code selector ──────────────────────────────
// Stores the full number in international format (+14165551234), which the
// SMS reminder engine requires.

export const DIAL_CODES = [
  { key: 'CA', code: '+1' },
  { key: 'US', code: '+1' },
  { key: 'EG', code: '+20' },
  { key: 'GB', code: '+44' },
  { key: 'AE', code: '+971' },
  { key: 'SA', code: '+966' },
  { key: 'KW', code: '+965' },
  { key: 'QA', code: '+974' },
  { key: 'BH', code: '+973' },
  { key: 'JO', code: '+962' },
  { key: 'LB', code: '+961' },
  { key: 'DE', code: '+49' },
  { key: 'FR', code: '+33' },
  { key: 'AU', code: '+61' },
];

const parsePhone = (value) => {
  if (!value) return { key: 'CA', national: '' };
  const sorted = [...DIAL_CODES].sort((a, b) => b.code.length - a.code.length);
  const hit = sorted.find((c) => value.startsWith(c.code));
  if (hit) return { key: hit.key, national: value.slice(hit.code.length) };
  return { key: 'CA', national: value.replace(/^\+/, '') };
};

export function PhoneInput({ value, onChange, countries, ariaLabel }) {
  const [key, setKey] = useState(() => parsePhone(value).key);
  const national = parsePhone(value).national;

  const emit = (k, nat) => {
    const digits = (nat || '').replace(/\D/g, '');
    const code = DIAL_CODES.find((c) => c.key === k)?.code || '+1';
    onChange(digits ? code + digits : '');
  };

  return (
    <div className="phone-input">
      <select
        className="input phone-cc"
        value={key}
        onChange={(e) => { setKey(e.target.value); emit(e.target.value, national); }}
        aria-label={ariaLabel}
      >
        {DIAL_CODES.map((c) => (
          <option key={c.key} value={c.key}>
            {(countries?.[c.key] || c.key)} ({c.code})
          </option>
        ))}
      </select>
      <Input
        type="tel"
        inputMode="tel"
        dir="ltr"
        autoComplete="tel-national"
        value={national}
        onChange={(e) => emit(key, e.target.value)}
      />
    </div>
  );
}

// ─── Confirm dialog (replaces window.confirm) ─────────────────────────────────

export function ConfirmDialog({ open, title, body, confirmLabel, cancelLabel, danger = false, onConfirm, onCancel }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onCancel} role="presentation">
      <div
        className="modal"
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-title">{title}</div>
        <div className="modal-body">{body}</div>
        <div className="modal-actions">
          <Btn variant="secondary" onClick={onCancel}>{cancelLabel}</Btn>
          <Btn variant={danger ? 'solid-danger' : 'primary'} onClick={onConfirm} autoFocus>{confirmLabel}</Btn>
        </div>
      </div>
    </div>
  );
}
