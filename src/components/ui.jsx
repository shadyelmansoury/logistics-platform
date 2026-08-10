import { C, font } from '../theme.js';

export const Card = ({ children, style }) => (
  <div style={{ background:C.surface, borderRadius:14, border:`1px solid ${C.border}`, boxShadow:C.shadow, padding:18, ...style }}>
    {children}
  </div>
);

export const Btn = ({ children, onClick, variant='primary', size='md', disabled, style, type='button' }) => {
  const variants = {
    primary:  { background:C.primary, color:'#fff', border:`1px solid ${C.primaryDark}` },
    secondary:{ background:C.surface, color:C.ink, border:`1px solid ${C.borderMid}` },
    ghost:    { background:'transparent', color:C.muted, border:'1px solid transparent' },
    danger:   { background:C.redLight, color:C.red, border:`1px solid ${C.redBorder}` },
    gold:     { background:C.gold, color:'#fff', border:`1px solid ${C.gold}` },
  };
  const sizes = { sm:{ padding:'6px 12px', fontSize:12 }, md:{ padding:'10px 18px', fontSize:14 }, lg:{ padding:'13px 24px', fontSize:15 } };
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      style={{ ...variants[variant], ...sizes[size], borderRadius:10, fontWeight:600, fontFamily:font.body,
        cursor:disabled?'not-allowed':'pointer', opacity:disabled?0.5:1, transition:'opacity .15s', ...style }}>
      {children}
    </button>
  );
};

export const Badge = ({ children, color=C.primary, bg=C.primaryLight, border=C.primaryBorder, style }) => (
  <span style={{ padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700, color, background:bg,
    border:`1px solid ${border}`, whiteSpace:'nowrap', display:'inline-block', ...style }}>
    {children}
  </span>
);

export const Field = ({ label, children, hint }) => (
  <div style={{ marginBottom:14 }}>
    <label style={{ display:'block', fontSize:12, fontWeight:700, color:C.inkMid, marginBottom:6 }}>{label}</label>
    {children}
    {hint && <div style={{ fontSize:11, color:C.muted, marginTop:5, lineHeight:1.5 }}>{hint}</div>}
  </div>
);

export const inputStyle = {
  width:'100%', padding:'11px 13px', borderRadius:10, border:`1px solid ${C.borderMid}`,
  fontSize:14, fontFamily:font.body, color:C.ink, background:C.surface, outline:'none',
};

export const Input = (props) => <input {...props} style={{ ...inputStyle, ...props.style }} />;

export const ErrorBox = ({ children }) => !children ? null : (
  <div style={{ padding:'10px 14px', background:C.redLight, border:`1px solid ${C.redBorder}`,
    borderRadius:10, color:C.red, fontSize:13, marginBottom:14 }}>
    {children}
  </div>
);

export const SectionTitle = ({ children, style }) => (
  <div style={{ fontSize:13, fontWeight:800, color:C.muted, textTransform:'uppercase',
    letterSpacing:1, marginBottom:12, fontFamily:font.mono, ...style }}>
    {children}
  </div>
);

export const Avatar = ({ name, size=36, color=C.primary }) => {
  const initials = (name || '?').split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  return (
    <div style={{ width:size, height:size, borderRadius:'50%', background:`${color}22`,
      border:`1.5px solid ${color}55`, color, display:'flex', alignItems:'center', justifyContent:'center',
      fontSize:size*0.36, fontWeight:800, flexShrink:0 }}>
      {initials}
    </div>
  );
};

export const Empty = ({ icon:Icon, text }) => (
  <div style={{ padding:'36px 20px', textAlign:'center', color:C.muted, background:C.surfaceAlt,
    borderRadius:14, border:`1px dashed ${C.borderMid}` }}>
    {Icon && <Icon size={30} style={{ opacity:0.5, marginBottom:10 }} />}
    <div style={{ fontSize:13, lineHeight:1.6, maxWidth:420, margin:'0 auto' }}>{text}</div>
  </div>
);
