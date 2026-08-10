import { useEffect } from 'react';

// ─── Brand mark (same drawing as public/favicon.svg) ──────────────────────────
export const Logo = ({ size = 34 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="Gam3ya">
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
