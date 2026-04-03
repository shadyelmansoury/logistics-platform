import { useState } from "react";
import {
  Anchor, Plane, Truck, RefreshCw, Ship,
  CheckCircle, AlertTriangle, XCircle, Clock, Info,
  FileText, CreditCard, Package, Building2, Cpu,
  Shield, ShieldCheck, Thermometer, MapPin, Radio, Activity,
  Server, Database, Cloud, Globe, Lock, Code, Layers, Zap,
  ArrowRight, RotateCcw, Upload, Bell,
  Warehouse, Users, TrendingUp,
  ClipboardCheck, Boxes, FileCheck, PackageCheck,
  ChevronRight, ChevronLeft, Bot, Network, BarChart3,
  Map, PenLine, ScanLine, SendHorizonal, Flag,
} from "lucide-react";

// ─── Design System ────────────────────────────────────────────────────────────
const C = {
  bg:           '#F4F7FB',
  surface:      '#FFFFFF',
  surfaceAlt:   '#EEF3FA',
  navy:         '#0C1E3D',
  navyMid:      '#1A3460',
  primary:      '#1B52C9',
  primaryLight: '#EBF1FF',
  primaryBorder:'#C0D2F7',
  teal:         '#0A8C80',
  tealLight:    '#E7F8F6',
  tealBorder:   '#9FE0D8',
  amber:        '#D97706',
  amberLight:   '#FFFBEB',
  amberBorder:  '#FCD34D',
  amberAccent:  '#F59E0B',
  purple:       '#6D28D9',
  purpleLight:  '#F3F0FF',
  purpleBorder: '#C4B5FD',
  green:        '#15803D',
  greenLight:   '#F0FDF4',
  greenBorder:  '#86EFAC',
  red:          '#B91C1C',
  redLight:     '#FEF2F2',
  redBorder:    '#FCA5A5',
  orange:       '#C2410C',
  orangeLight:  '#FFF7ED',
  text:         '#0C1E3D',
  textMid:      '#334155',
  muted:        '#64748B',
  mutedLight:   '#94A3B8',
  border:       '#DDE5EF',
  borderMid:    '#C3CFDF',
  shadow:       '0 1px 4px rgba(12,30,61,0.08)',
  shadowMd:     '0 4px 20px rgba(12,30,61,0.10)',
  shadowLg:     '0 10px 40px rgba(12,30,61,0.12)',
};

const font = {
  display: "'Barlow Condensed', sans-serif",
  body:    "'DM Sans', sans-serif",
  mono:    "'DM Mono', monospace",
};

// ─── Icon helpers ─────────────────────────────────────────────────────────────
const Ic = ({ icon: Icon, size = 16, color, style = {} }) => (
  <Icon size={size} color={color || 'currentColor'} style={{ flexShrink: 0, ...style }} />
);

const statusConfig = {
  ok:   { Icon: CheckCircle, color: C.green,   bg: C.greenLight,  border: C.greenBorder  },
  warn: { Icon: AlertTriangle, color: C.amber, bg: C.amberLight,  border: C.amberBorder  },
  error:{ Icon: XCircle,     color: C.red,     bg: C.redLight,    border: C.redBorder    },
  wait: { Icon: Clock,        color: C.muted,  bg: C.surfaceAlt,  border: C.border       },
  info: { Icon: Info,         color: C.primary,bg: C.primaryLight,border: C.primaryBorder},
};

// ─── Shared Components ────────────────────────────────────────────────────────
const InfoGrid = ({ items, cols = 2 }) => (
  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 8 }}>
    {items.map((item, i) => (
      <div key={i} style={{ padding: '10px 14px', background: C.surfaceAlt, borderRadius: 8, border: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 10, color: C.muted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: font.mono }}>{item.label}</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: item.color || C.text, fontFamily: font.body }}>{item.val}</div>
        {item.sub && <div style={{ fontSize: 10, color: C.mutedLight, marginTop: 2 }}>{item.sub}</div>}
      </div>
    ))}
  </div>
);

const CheckRow = ({ status, label, note, badge }) => {
  const s = statusConfig[status] || statusConfig.wait;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', background: C.surface, borderRadius: 8, border: `1px solid ${C.border}`, marginBottom: 6, boxShadow: C.shadow }}>
      <s.Icon size={16} color={s.color} style={{ flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{label}</div>
        {note && <div style={{ fontSize: 10, color: C.muted, marginTop: 1 }}>{note}</div>}
      </div>
      {badge && <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: s.bg, color: s.color, border: `1px solid ${s.border}`, whiteSpace: 'nowrap' }}>{badge}</span>}
    </div>
  );
};

const AIBox = ({ items }) => (
  <div style={{ padding: '14px 16px', background: C.tealLight, border: `1px solid ${C.tealBorder}`, borderRadius: 10, borderLeft: `3px solid ${C.teal}` }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
      <Bot size={14} color={C.teal} />
      <span style={{ fontSize: 10, color: C.teal, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', fontFamily: font.mono }}>Atmet AI Insight</span>
    </div>
    {items.map((item, i) => (
      <div key={i} style={{ fontSize: 12, color: i === 0 ? C.text : C.muted, lineHeight: 1.65, marginBottom: 2 }}>{item}</div>
    ))}
  </div>
);

const AppCard = ({ agency, status, time, rec }) => {
  const s = { Approved: { c: C.green, bg: C.greenLight, b: C.greenBorder }, Pending: { c: C.amber, bg: C.amberLight, b: C.amberBorder }, 'In Review': { c: C.primary, bg: C.primaryLight, b: C.primaryBorder }, Cleared: { c: C.green, bg: C.greenLight, b: C.greenBorder } }[status] || { c: C.amber, bg: C.amberLight, b: C.amberBorder };
  return (
    <div style={{ padding: '14px', background: C.surface, borderRadius: 10, border: `1px solid ${C.border}`, borderLeft: `3px solid ${s.c}`, boxShadow: C.shadow }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6, gap: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{agency}</div>
        <span style={{ padding: '3px 9px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: s.bg, color: s.c, border: `1px solid ${s.b}`, whiteSpace: 'nowrap' }}>{status}</span>
      </div>
      <div style={{ fontSize: 11, color: C.muted, marginBottom: rec ? 8 : 0, fontFamily: font.mono }}>{time}</div>
      {rec && (
        <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start', padding: '6px 10px', background: C.tealLight, borderRadius: 6 }}>
          <Bot size={12} color={C.teal} style={{ marginTop: 1, flexShrink: 0 }} />
          <div style={{ fontSize: 11, color: C.teal, lineHeight: 1.5 }}>{rec}</div>
        </div>
      )}
    </div>
  );
};

const SummaryKPIs = ({ items }) => (
  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${items.length}, 1fr)`, gap: 8 }}>
    {items.map((s, i) => (
      <div key={i} style={{ padding: '14px 10px', background: C.surface, borderRadius: 10, border: `1px solid ${C.border}`, textAlign: 'center', boxShadow: C.shadow }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <s.Icon size={16} color={s.color} />
          </div>
        </div>
        <div style={{ fontSize: 20, fontWeight: 800, color: s.color, fontFamily: font.display }}>{s.val}</div>
        <div style={{ fontSize: 10, color: C.muted, marginTop: 3, fontFamily: font.mono }}>{s.label}</div>
      </div>
    ))}
  </div>
);

// ─── Step Content Renderer ────────────────────────────────────────────────────
const renderContent = (ucId, stepIdx) => {

  // ══ SEA ══
  if (ucId === 'sea') {
    if (stepIdx === 0) return (<div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ padding: 16, background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, boxShadow: C.shadow }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: 12, background: C.primaryLight, border: `1px solid ${C.primaryBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Ship size={26} color={C.primary} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: C.text, fontFamily: font.display }}>MV HAMBURG EXPRESS</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>IMO 9450648 · Container Vessel · Flag: Germany</div>
          </div>
          <div style={{ marginLeft: 'auto', padding: '6px 12px', background: C.tealLight, border: `1px solid ${C.tealBorder}`, borderRadius: 8, textAlign: 'center' }}>
            <div style={{ fontSize: 9, color: C.muted, fontFamily: font.mono }}>STATUS</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.teal }}>EN ROUTE</div>
          </div>
        </div>
        <InfoGrid cols={3} items={[{ label: 'ETA — Hamad Port', val: 'Apr 05, 2026 · 14:30', color: C.amber }, { label: 'Terminal', val: 'CT2 — Berth 07' }, { label: 'Containers', val: '32 units · 850 TEU' }, { label: 'HS Code Range', val: '7610.10.00 – 9403.90' }, { label: 'Voyage No.', val: 'HHE-DOH-2026-041' }, { label: 'Declared Value', val: 'USD 2,340,000' }]} />
      </div>
      <CheckRow status="ok" label="Pre-Arrival Notification submitted to Hamad Port Authority" badge="Auto-sent" />
      <CheckRow status="ok" label="Qatar Customs notified — advance cargo information received" badge="Received" />
      <CheckRow status="ok" label="Freight forwarder Al Mana Logistics assigned to shipment" badge="Confirmed" />
      <CheckRow status="warn" label="3 reefer containers detected — cold storage berth requested" note="Temperature-sensitive cargo flagged automatically" badge="Note" />
      <AIBox items={['Vessel profile verified against Hamad Port Authority database — no flags.', 'HS code screening complete: Low risk. No restricted or controlled goods detected.', 'Recommendation: Proceed to import declaration. Auto-assign to Green Lane.']} />
    </div>);

    if (stepIdx === 1) return (<div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ padding: 14, background: C.surface, borderRadius: 10, border: `1px solid ${C.border}`, boxShadow: C.shadow }}>
          <div style={{ fontSize: 10, color: C.muted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: font.mono }}>Shipper</div>
          <InfoGrid cols={2} items={[{ label: 'Company', val: 'Schüco International KG' }, { label: 'Country', val: 'Germany' }, { label: 'City', val: 'Hamburg' }, { label: 'Tax ID', val: 'DE112233445' }]} />
        </div>
        <div style={{ padding: 14, background: C.surface, borderRadius: 10, border: `1px solid ${C.border}`, boxShadow: C.shadow }}>
          <div style={{ fontSize: 10, color: C.muted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: font.mono }}>Consignee</div>
          <InfoGrid cols={2} items={[{ label: 'Company', val: 'Al Mana Real Estate LLC' }, { label: 'Country', val: 'Qatar' }, { label: 'City', val: 'Doha' }, { label: 'CR No.', val: '90012334' }]} />
        </div>
      </div>
      <div style={{ padding: 14, background: C.surface, borderRadius: 10, border: `1px solid ${C.border}`, boxShadow: C.shadow }}>
        <div style={{ fontSize: 10, color: C.muted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: font.mono }}>Cargo Details</div>
        <InfoGrid cols={3} items={[{ label: 'Description', val: 'Aluminum Facade Systems' }, { label: 'HS Code', val: '7610.10.00', color: C.amber }, { label: 'Gross Weight', val: '480 MT' }, { label: 'Volume', val: '1,840 CBM' }, { label: 'Incoterms', val: 'CIF Hamad Port' }, { label: 'Declared Value', val: 'USD 2,340,000' }]} />
      </div>
      <CheckRow status="ok" label="Bill of Lading — BL/HHE-2026-18821" badge="Uploaded" />
      <CheckRow status="ok" label="Commercial Invoice — INV-SCH-2026-441" badge="Uploaded" />
      <CheckRow status="ok" label="Certificate of Origin — ICC Germany" badge="Uploaded" />
      <CheckRow status="warn" label="Insurance Certificate" note="Requested from shipper — awaiting upload" badge="Pending" />
      <AIBox items={['Import declaration 94% pre-filled from vessel manifest — minimal manual input required.', 'Insurance Certificate missing. Portal auto-notified shipper via email + SMS.', 'Proceeding: Insurance can be appended within 24 hrs without delaying clearance.']} />
    </div>);

    if (stepIdx === 2) return (<div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ padding: '14px 16px', background: C.tealLight, border: `1px solid ${C.tealBorder}`, borderRadius: 10, display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 44, height: 44, borderRadius: 10, background: C.teal, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Bot size={22} color="#fff" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: C.text }}>Atmet AI — Document Analysis Complete</div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>5 documents · 847 fields extracted · Analysis time: 1m 42s</div>
        </div>
        <div style={{ padding: '6px 14px', background: C.greenLight, border: `1px solid ${C.greenBorder}`, borderRadius: 8, textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.green }}>PASS</div>
          <div style={{ fontSize: 10, color: C.muted, fontFamily: font.mono }}>96.4%</div>
        </div>
      </div>
      {[{ name: 'Bill of Lading', fields: 24, status: 'ok', conf: '99.1%', note: 'All fields verified against vessel manifest' }, { name: 'Commercial Invoice', fields: 18, status: 'ok', conf: '97.8%', note: 'Value and HS code cross-checked' }, { name: 'Packing List', fields: 32, status: 'ok', conf: '98.4%', note: 'Container numbers matched to manifest' }, { name: 'Certificate of Origin', fields: 12, status: 'warn', conf: '91.2%', note: 'Stamp partially obscured — manual confirmation requested' }, { name: 'Insurance Certificate', fields: 0, status: 'wait', conf: 'Pending', note: 'Awaiting upload from shipper' }].map((d, i) => {
        const s = statusConfig[d.status] || statusConfig.wait;
        return (<div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: C.surface, borderRadius: 8, border: `1px solid ${C.border}`, boxShadow: C.shadow }}>
          <s.Icon size={16} color={s.color} style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{d.name}</div>
            <div style={{ fontSize: 10, color: C.muted }}>{d.note}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: d.status === 'ok' ? C.green : d.status === 'warn' ? C.amber : C.muted }}>{d.conf}</div>
            <div style={{ fontSize: 10, color: C.muted, fontFamily: font.mono }}>{d.fields > 0 ? `${d.fields} fields` : '—'}</div>
          </div>
        </div>);
      })}
      <InfoGrid cols={2} items={[{ label: 'Value vs Manifest', val: 'Match — Verified', color: C.green }, { label: 'HS Code Risk', val: 'Low — Score 2 / 10', color: C.green }, { label: 'Restricted Goods', val: 'None Detected', color: C.green }, { label: 'Customs Lane', val: 'Green Lane — Auto-clear', color: C.teal }]} />
      <AIBox items={['4 of 5 documents verified. Certificate of Origin flagged for human review (low risk).', 'Cleared for Green Lane — no physical inspection required.', 'Forwarding to Qatar Customs and Port Authority for parallel approval processing.']} />
    </div>);

    if (stepIdx === 3) return (<div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <AppCard agency="Qatar Customs Authority" status="Approved" time="Auto-approved · 18 min" rec="Green Lane confirmed. No physical inspection required." />
        <AppCard agency="Hamad Port Authority" status="Approved" time="Berth CT2-07 confirmed · Apr 04 23:00" rec="Slot allocated. Crane gang assigned. Reefer berth for 3 containers." />
        <AppCard agency="Ministry of Commerce & Industry" status="Approved" time="Cleared · 34 min" rec="Conformity certificate accepted. No product restrictions." />
        <AppCard agency="Qatar Standards Authority (QGOSM)" status="In Review" time="Pending · est. 2 hrs" rec="Random sample inspection for 1 container — non-blocking for release." />
      </div>
      <div style={{ padding: 14, background: C.surface, borderRadius: 10, border: `1px solid ${C.border}`, boxShadow: C.shadow }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Overall Approval Progress</div>
          <div style={{ fontSize: 12, color: C.amber, fontWeight: 700 }}>3 of 4 Approved</div>
        </div>
        <div style={{ height: 8, background: C.surfaceAlt, borderRadius: 4, overflow: 'hidden', border: `1px solid ${C.border}` }}>
          <div style={{ height: '100%', width: '75%', background: `linear-gradient(90deg, ${C.teal}, ${C.green})`, borderRadius: 4, transition: 'width 0.4s' }} />
        </div>
        <div style={{ fontSize: 11, color: C.muted, marginTop: 8 }}>QGOSM inspection is non-blocking — cargo release can proceed on bond pending result.</div>
      </div>
      <AIBox items={['3 of 4 agencies approved. QGOSM sample inspection pending — non-blocking for release.', 'Recommendation: Initiate duty calculation now. Cargo released on provisional bond.', 'Estimated time to full clearance: approximately 1.5 hours.']} />
    </div>);

    if (stepIdx === 4) return (<div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ padding: 16, background: C.surface, borderRadius: 10, border: `1px solid ${C.border}`, boxShadow: C.shadow }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, color: C.text }}>Duty & Tax Assessment — Ref: QCA-2026-18821</div>
        {[{ desc: 'CIF Declared Value', val: 'USD 2,340,000', sub: 'QAR 8,517,800', hl: false }, { desc: 'Customs Duty (5% — HS 7610.10.00)', val: 'USD 117,000', sub: 'QAR 425,890', hl: false }, { desc: 'VAT (10%)', val: 'USD 234,000', sub: 'QAR 851,780', hl: false }, { desc: 'Port Handling Fee', val: 'USD 12,400', sub: 'QAR 45,140', hl: false }, { desc: 'Total Payable', val: 'USD 363,400', sub: 'QAR 1,322,810', hl: true }].map((row, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 12px', background: row.hl ? C.amberLight : C.surfaceAlt, borderRadius: 8, marginBottom: 5, border: `1px solid ${row.hl ? C.amberBorder : C.border}` }}>
            <div style={{ fontSize: 12, color: row.hl ? C.amber : C.textMid, fontWeight: row.hl ? 700 : 400 }}>{row.desc}</div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: row.hl ? C.amber : C.text }}>{row.val}</div>
              <div style={{ fontSize: 10, color: C.muted, fontFamily: font.mono }}>{row.sub}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ padding: 14, background: C.greenLight, border: `1px solid ${C.greenBorder}`, borderRadius: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <CheckCircle size={20} color={C.green} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: C.green }}>Payment Confirmed</div>
            <div style={{ fontSize: 11, color: C.muted, fontFamily: font.mono }}>Transaction ID: QCA-PAY-2026-18821 · Apr 04, 2026 · 16:42</div>
          </div>
        </div>
        <InfoGrid cols={2} items={[{ label: 'Method', val: 'QPAY — Online Banking' }, { label: 'Receipt No.', val: 'RCP-2026-88441' }, { label: 'Paid By', val: 'Al Mana Logistics WLL' }, { label: 'Customs Release', val: 'Triggered Automatically', color: C.green }]} />
      </div>
      <AIBox items={['Duty auto-calculated from HS code + verified CIF value. Zero manual input required.', 'Payment receipt matched against Customs system — gate release order triggered.', 'Gate Release Order being generated for Hamad Port Terminal CT2.']} />
    </div>);

    if (stepIdx === 5) return (<div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ padding: 18, background: C.surface, border: `2px solid ${C.amberBorder}`, borderRadius: 12, boxShadow: C.shadowMd }}>
        <div style={{ fontSize: 10, color: C.amber, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10, fontFamily: font.mono }}>Official Gate Release Order</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: C.text, fontFamily: font.display }}>GRO-QLP-2025-8821</div>
            <div style={{ fontSize: 11, color: C.muted, fontFamily: font.mono }}>Issued: Apr 04, 2026 · 17:15 · Valid 72 hrs</div>
          </div>
          <span style={{ padding: '6px 16px', background: C.greenLight, border: `1px solid ${C.greenBorder}`, borderRadius: 8, fontWeight: 700, fontSize: 13, color: C.green }}>CLEARED</span>
        </div>
        <InfoGrid cols={3} items={[{ label: 'Terminal', val: 'Hamad Port CT2, Berth 07' }, { label: 'Release Type', val: 'Full Container Release' }, { label: 'Containers', val: '32 × 20/40 ft' }, { label: 'Transport Co.', val: 'Qatar Express Lines LLC' }, { label: 'Gate PIN', val: '8841-XXXX (SMS sent)', color: C.amber }, { label: 'Deadline', val: 'Apr 07, 2026 · 17:15' }]} />
      </div>
      <SummaryKPIs items={[{ label: 'Total Time', val: '7h 14m', Icon: Clock, color: C.teal }, { label: 'AI Automated', val: '74%', Icon: Bot, color: C.teal }, { label: 'Agencies', val: '4 cleared', Icon: Building2, color: C.amber }, { label: 'Outcome', val: 'Full Release', Icon: CheckCircle, color: C.green }]} />
      <AIBox items={['Shipment QLP-2025-8821 fully cleared in 7 hours 14 minutes.', '74% of processing steps automated by Atmet AI — zero manual customs touchpoints.', 'Manual process baseline: 18–24 hrs. Portal efficiency gain: approximately 11 hours saved.']} />
    </div>);
  }

  // ══ AIR ══
  if (ucId === 'air') {
    if (stepIdx === 0) return (<div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ padding: 16, background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, boxShadow: C.shadow }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: 12, background: C.tealLight, border: `1px solid ${C.tealBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Plane size={26} color={C.teal} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: C.text, fontFamily: font.display }}>QR CARGO 7742</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>AWB 157-88492100 · Qatar Airways Cargo · LHR → DOH</div>
          </div>
          <div style={{ marginLeft: 'auto', padding: '6px 12px', background: C.orangeLight, border: `1px solid ${C.amberBorder}`, borderRadius: 8, textAlign: 'center' }}>
            <div style={{ fontSize: 9, color: C.muted, fontFamily: font.mono }}>PRIORITY</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.orange }}>URGENT</div>
          </div>
        </div>
        <InfoGrid cols={3} items={[{ label: 'Flight', val: 'QR 3742 · Apr 04, 2026' }, { label: 'ETA — HIA', val: 'Apr 05, 2026 · 04:15', color: C.amber }, { label: 'Commodity', val: 'Pharmaceutical Products' }, { label: 'Weight / Pieces', val: '840 kg · 6 pallets' }, { label: 'Temperature Req.', val: '+2°C to +8°C', color: C.teal }, { label: 'Shipper', val: 'AstraZeneca UK Ltd' }]} />
      </div>
      <CheckRow status="ok" label="Air Waybill (AWB) uploaded and validated" badge="AWB Verified" />
      <CheckRow status="ok" label="IATA e-freight manifest received from origin" badge="Received" />
      <CheckRow status="ok" label="Cold chain requirements flagged — +2°C to +8°C" badge="Cold Storage" />
      <CheckRow status="warn" label="Pharmaceutical import — MOPH pre-clearance required" note="Auto-routing to pharma fast-track queue" badge="Required" />
      <CheckRow status="ok" label="HIA Cargo cold storage slot pre-confirmed" badge="Confirmed" />
      <AIBox items={['AWB matched against IATA manifest — 100% field alignment.', 'Pharmaceutical category auto-detected. Routing to MOPH fast-track queue.', 'Initiating parallel compliance screening while flight is en route.']} />
    </div>);

    if (stepIdx === 1) return (<div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ padding: '12px 16px', background: C.tealLight, border: `1px solid ${C.tealBorder}`, borderRadius: 10 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: C.text, marginBottom: 2 }}>AI Pharma Compliance Engine — Scanning 14 Databases</div>
        <div style={{ fontSize: 11, color: C.muted }}>Qatar SFDA · WHO GMP · IATA DGR · Cold Chain CEIV · MOPH Registry</div>
      </div>
      {[{ check: 'SFDA Registration', result: 'Registered', status: 'ok', detail: 'AZ-VAX approved in Qatar — Reg #QSF-2024-8812' }, { check: 'IATA DGR Classification', result: 'Non-DG', status: 'ok', detail: 'Not classified as dangerous goods' }, { check: 'Cold Chain CEIV Compliance', result: 'Compliant', status: 'ok', detail: 'Certified handler at origin and destination' }, { check: 'Shelf Life Check', result: 'Pass', status: 'ok', detail: 'Expiry Dec 2027 — minimum 12 months maintained' }, { check: 'MOPH Import Permit', result: 'Auto-Applied', status: 'warn', detail: 'Permit submitted via portal API — confirmation pending' }, { check: 'Narcotic / Controlled', result: 'Negative', status: 'ok', detail: 'No controlled substance classification' }].map((c, i) => {
        const s = statusConfig[c.status];
        return (<div key={i} style={{ display: 'flex', gap: 12, padding: '10px 14px', background: C.surface, borderRadius: 8, border: `1px solid ${C.border}`, boxShadow: C.shadow }}>
          <s.Icon size={16} color={s.color} style={{ flexShrink: 0, marginTop: 1 }} />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2, gap: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{c.check}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: s.color, whiteSpace: 'nowrap' }}>{c.result}</span>
            </div>
            <div style={{ fontSize: 10, color: C.muted }}>{c.detail}</div>
          </div>
        </div>);
      })}
      <AIBox items={['5 of 6 checks passed automatically. MOPH application auto-submitted via API.', 'No DGR restrictions — eligible for express clearance lane.', 'Forwarding full compliance dossier to MOPH for permit confirmation.']} />
    </div>);

    if (stepIdx === 2) return (<div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ padding: 14, background: C.surface, borderRadius: 10, border: `1px solid ${C.border}`, borderLeft: `3px solid ${C.orange}`, boxShadow: C.shadow }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: C.text }}>Ministry of Public Health — Qatar</div>
          <span style={{ padding: '4px 12px', background: C.greenLight, border: `1px solid ${C.greenBorder}`, borderRadius: 8, fontWeight: 700, fontSize: 12, color: C.green }}>PRE-CLEARED</span>
        </div>
        <InfoGrid cols={2} items={[{ label: 'Permit No.', val: 'MOPH-IMP-2026-00441' }, { label: 'Issued', val: 'Apr 04, 2026 · 22:30' }, { label: 'Validity', val: '30 days from arrival' }, { label: 'Processing Time', val: '52 minutes (fast-track)', color: C.green }]} />
      </div>
      <CheckRow status="ok" label="Cold chain maintained throughout — temperature log required on delivery" badge="Mandatory" />
      <CheckRow status="ok" label="Cargo to be collected by licensed pharmaceutical distributor only" badge="Mandatory" />
      <CheckRow status="ok" label="SFDA post-import report required within 30 days" badge="Required" />
      <CheckRow status="info" label="Random sample testing — 5% probability (not triggered)" note="Atmet AI will notify immediately if triggered" badge="Monitoring" />
      <InfoGrid cols={2} items={[{ label: 'Standard MOPH Processing', val: '3–5 business days', color: C.red }, { label: 'Portal AI Fast-Track', val: '52 minutes', color: C.green }, { label: 'Time Saved', val: 'Approx. 4.5 days', color: C.teal }, { label: 'Dossier Preparation', val: '100% automated by AI', color: C.teal }]} />
      <AIBox items={['MOPH pre-clearance obtained in 52 minutes via AI-assisted fast-track.', 'Compliance dossier auto-assembled and submitted — zero manual preparation required.', 'Permit forwarded to HIA Cargo for terminal handling instructions.']} />
    </div>);

    if (stepIdx === 3) return (<div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ padding: 14, background: C.surface, borderRadius: 10, border: `1px solid ${C.border}`, boxShadow: C.shadow }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: C.primaryLight, border: `1px solid ${C.primaryBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Warehouse size={22} color={C.primary} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: C.text }}>HIA Cargo Terminal — Cold Zone 3</div>
            <div style={{ fontSize: 11, color: C.muted }}>Apr 05, 2026 · 04:15 · Flight QR 3742 has landed</div>
          </div>
          <span style={{ marginLeft: 'auto', padding: '4px 12px', background: C.greenLight, border: `1px solid ${C.greenBorder}`, borderRadius: 8, fontWeight: 700, fontSize: 12, color: C.green }}>ARRIVED</span>
        </div>
        <InfoGrid cols={2} items={[{ label: 'Temperature on Arrival', val: '+4.2°C — Within range', color: C.teal, sub: '+2°C to +8°C required' }, { label: 'Pallets Received', val: '6 of 6 — All accounted for', color: C.green }, { label: 'Physical Inspection', val: 'Waived (MOPH permit)', color: C.teal }, { label: 'Storage Assigned', val: 'Cold Room C3-14 · 24/7 monitored' }]} />
      </div>
      <CheckRow status="ok" label="All 6 pallets offloaded intact from aircraft ULD" badge="Confirmed" />
      <CheckRow status="ok" label="Temperature data logger downloaded — compliant throughout flight" badge="Compliant" />
      <CheckRow status="ok" label="MOPH permit accepted by HIA customs officer" badge="Accepted" />
      <CheckRow status="ok" label="Cold storage confirmed — 4-hour buffer before pickup" badge="Ready" />
      <CheckRow status="warn" label="Consignee Aster DM Healthcare notified — pickup confirmed 09:00" note="Apr 05, 2026" badge="Notified" />
      <AIBox items={['IoT temperature sensors confirm cold chain integrity — 100% compliant end-to-end.', 'Physical inspection waived — MOPH pre-clearance fast-track applied successfully.', 'Generating Express Release Order. Estimated full clearance by 06:30.']} />
    </div>);

    if (stepIdx === 4) return (<div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ padding: 18, background: C.surface, border: `2px solid ${C.tealBorder}`, borderRadius: 12, boxShadow: C.shadowMd }}>
        <div style={{ fontSize: 10, color: C.teal, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10, fontFamily: font.mono }}>Express Release Order — Cold Chain Pharma</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: C.text, fontFamily: font.display }}>ERO-QAC-2026-7742</div>
            <div style={{ fontSize: 11, color: C.muted, fontFamily: font.mono }}>Issued: Apr 05, 2026 · 06:22 · HIA Cargo Authority</div>
          </div>
          <span style={{ padding: '6px 14px', background: C.greenLight, border: `1px solid ${C.greenBorder}`, borderRadius: 8, fontWeight: 700, color: C.green }}>CLEARED</span>
        </div>
        <InfoGrid cols={3} items={[{ label: 'Vehicle', val: 'Reefer Truck MQ 48812' }, { label: 'Dispatcher', val: 'Qatar Cold Chain WLL' }, { label: 'Destination', val: 'Aster DM Hub, Al Wakra' }, { label: 'ETA', val: 'Apr 05 · 09:45', color: C.amber }, { label: 'Temp Monitor', val: 'Live IoT via Portal', color: C.teal }, { label: 'Consignee', val: 'SMS + Email sent', color: C.green }]} />
      </div>
      <SummaryKPIs items={[{ label: 'Total Time', val: '3h 52m', Icon: Clock, color: C.teal }, { label: 'vs. Standard', val: '4.8× faster', Icon: Zap, color: C.amber }, { label: 'AI Checks', val: '14 passed', Icon: Bot, color: C.teal }, { label: 'Cold Chain', val: '100% intact', Icon: Thermometer, color: C.primary }]} />
      <AIBox items={['Pharmaceutical cargo cleared in 3 hours 52 minutes — 4.8× faster than standard processing.', 'Cold chain integrity maintained end-to-end. IoT monitoring active through final delivery.', 'London to Doha delivery hub: full regulatory compliance, zero exceptions.']} />
    </div>);
  }

  // ══ LAND ══
  if (ucId === 'land') {
    if (stepIdx === 0) return (<div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ padding: 16, background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, boxShadow: C.shadow }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: 12, background: C.amberLight, border: `1px solid ${C.amberBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Truck size={26} color={C.amber} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, color: C.text, fontFamily: font.display }}>LIEBHERR LTM 1300-6.2 MOBILE CRANE</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>Oversize Heavy Equipment · RAKIA Free Zone, UAE → Doha Industrial Area</div>
          </div>
        </div>
        <InfoGrid cols={3} items={[{ label: 'Equipment Type', val: 'All-Terrain Mobile Crane' }, { label: 'Total Length', val: '21.4 metres', color: C.orange }, { label: 'Width', val: '3.8 metres', color: C.orange }, { label: 'Height', val: '4.2 metres', color: C.orange }, { label: 'GVW', val: '96 tonnes', color: C.red }, { label: 'Consignee', val: 'Arabian Contracting Co.' }]} />
      </div>
      <CheckRow status="warn" label="Width > 3.5m — Special Transport Permit required" badge="Required" />
      <CheckRow status="warn" label="Overweight > 48 tonnes — Ashghal road load assessment needed" badge="Required" />
      <CheckRow status="warn" label="Height > 4.0m — bridge and overhead clearance analysis required" badge="Required" />
      <CheckRow status="ok" label="Application submitted via portal — Ref: LND-2026-4102" badge="Submitted" />
      <CheckRow status="ok" label="Equipment specs, insurance, transport plan — all uploaded" badge="Uploaded" />
      <AIBox items={['Equipment triggers 3 permit categories: oversize, overweight, over-height.', 'Initiating AI route analysis: Abu Samra border to Doha Industrial Area.', 'Parallel permit application submitted to Ashghal and MOI Traffic Department.']} />
    </div>);

    if (stepIdx === 1) return (<div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ padding: '12px 16px', background: C.tealLight, border: `1px solid ${C.tealBorder}`, borderRadius: 10 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: C.text, marginBottom: 2 }}>AI Route and Infrastructure Analysis</div>
        <div style={{ fontSize: 11, color: C.muted }}>Analyzed 847 km Qatar road network · 214 bridges · 38 overhead utilities · 12 restricted zones</div>
      </div>
      <div style={{ padding: 14, background: C.surface, borderRadius: 10, border: `1px solid ${C.border}`, boxShadow: C.shadow }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.amber, marginBottom: 12 }}>Recommended Route: Route A — AI Optimized</div>
        {['Abu Samra Border → Salwa Road (E-45)', 'Salwa Road → South Industrial Road', 'South Industrial Road → Industrial Area Gate 3'].map((seg, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', background: C.surfaceAlt, borderRadius: 8, marginBottom: 6 }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: C.amber, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#fff', flexShrink: 0, fontFamily: font.display }}>{i + 1}</div>
            <span style={{ fontSize: 12, color: C.text }}>{seg}</span>
          </div>
        ))}
      </div>
      <CheckRow status="ok" label="Salwa Interchange bridge — clearance 5.8m (required 4.2m)" badge="Cleared" />
      <CheckRow status="ok" label="Industrial Road overpass — clearance 4.9m" badge="Cleared" />
      <CheckRow status="warn" label="Power line crossing at km 18.4 — clearance 4.5m (tight)" note="Night travel recommended for additional safety buffer" badge="Caution" />
      <CheckRow status="ok" label="All road load ratings ≥ 100 tonnes on Route A" badge="Adequate" />
      <AIBox items={['Route A viable with one caution at km 18.4 — power line overhead clearance.', 'Recommending night travel window: 00:00–05:00 for adequate safety margin.', 'AI permit application pre-populated with route map and infrastructure report.']} />
    </div>);

    if (stepIdx === 2) return (<div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <AppCard agency="Ashghal — Public Works Authority" status="Approved" time="Approved in 2h 15m · Apr 04 · 12:30" rec="Route A approved. Night travel 00:00–05:00 mandatory. Slow-moving signs required." />
      <AppCard agency="MOI — Traffic & Patrol Department" status="Approved" time="Police escort assigned · Depart Apr 05 · 00:00" rec="2-vehicle escort assigned. Lead unit: MPQ-T 4412. Frequency: 468.700 MHz." />
      <AppCard agency="Ministry of Commerce & Industry" status="Approved" time="Import permit cleared · 45 min" rec="Capital goods — duty-free under UAE-Qatar bilateral agreement." />
      <div style={{ padding: 16, background: C.surface, border: `2px solid ${C.amberBorder}`, borderRadius: 12, boxShadow: C.shadow }}>
        <div style={{ fontSize: 10, color: C.amber, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8, fontFamily: font.mono }}>Special Transport Permit Issued</div>
        <div style={{ fontSize: 18, fontWeight: 800, color: C.text, marginBottom: 12, fontFamily: font.display }}>STP-QAT-2026-4102</div>
        <InfoGrid cols={2} items={[{ label: 'Valid', val: 'Apr 05–06, 2026 (48 hrs)' }, { label: 'Travel Window', val: '00:00 – 05:00 only', color: C.amber }, { label: 'Max Speed', val: '40 km/h', color: C.orange }, { label: 'Police Escort', val: 'Mandatory — 2 vehicles' }]} />
      </div>
      <AIBox items={['All 3 authorities approved. Permit STP-QAT-2026-4102 issued.', 'AI-prepared application accepted with zero revisions required.', 'Border crossing authorization forwarded to Abu Samra checkpoint.']} />
    </div>);

    if (stepIdx === 3) return (<div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ padding: 14, background: C.surface, borderRadius: 10, border: `1px solid ${C.border}`, boxShadow: C.shadow }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: C.text }}>Abu Samra Border Crossing</div>
            <div style={{ fontSize: 11, color: C.muted }}>Apr 05, 2026 · 00:05 · Entry into Qatar</div>
          </div>
          <span style={{ padding: '5px 12px', background: C.greenLight, border: `1px solid ${C.greenBorder}`, borderRadius: 8, fontWeight: 700, fontSize: 12, color: C.green }}>CROSSED</span>
        </div>
        <InfoGrid cols={3} items={[{ label: 'Permit Verified', val: 'STP-QAT-2026-4102', color: C.green }, { label: 'Axle Check', val: '94.2 T on-site — Pass', color: C.green }, { label: 'Time at Border', val: '38 minutes', color: C.teal }, { label: 'Police Escort', val: 'Lead MPQ-T 4412 Active' }, { label: 'Entry Time', val: '00:43 — Night window', color: C.green }, { label: 'Live Tracking', val: 'GPS Active — Portal', color: C.teal }]} />
      </div>
      <CheckRow status="ok" label="Qatar Customs — duty-free import cleared under bilateral agreement" badge="Cleared" />
      <CheckRow status="ok" label="Vehicle dimensions verified: 21.4 × 3.8 × 4.2m" badge="Verified" />
      <CheckRow status="ok" label="Police escort active on radio channel 468.700 MHz" badge="Active" />
      <CheckRow status="ok" label="Real-time GPS tracking live for all stakeholders on portal" badge="Live" />
      <div style={{ padding: 12, background: C.amberLight, border: `1px solid ${C.amberBorder}`, borderRadius: 10 }}>
        <div style={{ fontFamily: "'Noto Kufi Arabic', sans-serif", direction: 'rtl', fontSize: 13, color: C.amber, marginBottom: 4 }}>تنبيه: مسار مقيّد — سرعة قصوى 40 كم/ساعة — نافذة التنقل: 00:00 حتى 05:00</div>
        <div style={{ fontSize: 10, color: C.muted }}>Arabic portal alert sent to driver's mobile — route restrictions and checkpoints confirmed.</div>
      </div>
      <AIBox items={['Border crossing completed in 38 minutes — AI permit pre-clearance enabled fast processing.', 'Live GPS tracking active. Real-time alerts to all stakeholders via portal.', 'Estimated arrival at Industrial Area: 03:45 — within night travel window.']} />
    </div>);

    if (stepIdx === 4) return (<div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ padding: 18, background: C.surface, border: `2px solid ${C.amberBorder}`, borderRadius: 12, boxShadow: C.shadowMd }}>
        <div style={{ fontSize: 10, color: C.amber, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10, fontFamily: font.mono }}>Delivery Confirmation — Oversize Transport</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.text, fontFamily: font.display }}>Site: Arabian Contracting Co.</div>
            <div style={{ fontSize: 11, color: C.muted, fontFamily: font.mono }}>Industrial Area Zone 4, Doha · Apr 05, 2026 · 03:38</div>
          </div>
          <span style={{ padding: '6px 14px', background: C.greenLight, border: `1px solid ${C.greenBorder}`, borderRadius: 8, fontWeight: 700, color: C.green }}>DELIVERED</span>
        </div>
      </div>
      <CheckRow status="ok" label="Crane offloaded and positioned at site — zero road incidents" badge="Safe" />
      <CheckRow status="ok" label="Police escort dismissed at 03:44 — unit MPQ-T 4412" badge="Released" />
      <CheckRow status="ok" label="Delivery receipt signed — Eng. Khalid Al-Mohannadi" badge="Signed" />
      <CheckRow status="ok" label="Permit closed in portal — STP-QAT-2026-4102 archived" badge="Closed" />
      <SummaryKPIs items={[{ label: 'Total Time', val: '5h 38m', Icon: Clock, color: C.teal }, { label: 'Authorities', val: '3 approved', Icon: Building2, color: C.amber }, { label: 'Incidents', val: 'Zero', Icon: Shield, color: C.green }, { label: 'AI Automation', val: '68%', Icon: Bot, color: C.teal }]} />
      <AIBox items={['96-tonne crane delivered safely within the night travel window. Zero incidents.', 'All 3 permit authorities processed via portal — no physical office visits required.', 'Manual 3-day permit process reduced to 5.5 hours end-to-end.']} />
    </div>);
  }

  // ══ MULTIMODAL ══
  if (ucId === 'multimodal') {
    if (stepIdx === 0) return (<div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ padding: 16, background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, boxShadow: C.shadow }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: 12, background: C.purpleLight, border: `1px solid ${C.purpleBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <RefreshCw size={26} color={C.purple} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, color: C.text, fontFamily: font.display }}>MULTI-MODAL BOOKING: MML-2026-5500</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>Singapore PSA → Hamad Port → 4 Distribution Points, Qatar</div>
          </div>
        </div>
        <InfoGrid cols={3} items={[{ label: 'Commodity', val: 'Consumer Electronics (FMCG)' }, { label: 'Sea Carrier', val: 'MSC CONSTANZA — Voyage 126N' }, { label: 'Containers', val: '18 × 40ft — 2,160 CBM' }, { label: 'Shipper', val: 'Samsung Electronics SG' }, { label: 'Final Consignees', val: '4 — LuLu, IKEA, Carrefour, ACE', color: C.purple }, { label: 'Total Value', val: 'USD 4,800,000' }]} />
      </div>
      <CheckRow status="ok" label="Master B/L issued — MSC Singapore" badge="Issued" />
      <CheckRow status="ok" label="4 House B/Ls generated — one per consignee" badge="Created" />
      <CheckRow status="ok" label="4 Commercial invoices split by consignee allocation" badge="Ready" />
      <CheckRow status="ok" label="Packing list with container allocation per consignee" badge="Ready" />
      <CheckRow status="ok" label="Qatar Customs pre-declaration filed — 10 days in advance" badge="Pre-filed" />
      <AIBox items={['Multi-party documentation automatically split by consignee allocation using AI.', 'Pre-declaration filed 10 days early — eligible for express customs lane on arrival.', 'Activating live AIS vessel tracking for MML-2026-5500.']} />
    </div>);

    if (stepIdx === 1) return (<div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ padding: 14, background: C.surface, borderRadius: 10, border: `1px solid ${C.border}`, boxShadow: C.shadow }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: C.text }}>Live Vessel Tracker — MSC CONSTANZA</div>
          <span style={{ fontSize: 10, color: C.teal, fontFamily: font.mono }}>Auto-monitored · AIS · 4-hr updates</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', padding: '12px 0', marginBottom: 14 }}>
          {[{ label: 'Singapore PSA', sub: 'Departed Mar 28', done: true }, { label: 'Strait of Malacca', sub: 'Transited Mar 30', done: true }, { label: 'Arabian Sea', sub: 'Current Position', done: false, active: true }, { label: 'Gulf of Oman', sub: 'est. Apr 06', done: false }, { label: 'Hamad Port', sub: 'ETA Apr 08', done: false }].map((pt, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
              {i > 0 && <div style={{ position: 'absolute', top: 10, right: '50%', left: '-50%', height: 2, background: pt.done ? C.teal : C.border, zIndex: 0 }} />}
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: pt.active ? C.amber : pt.done ? C.teal : C.surfaceAlt, border: `2px solid ${pt.active ? C.amber : pt.done ? C.teal : C.borderMid}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, color: (pt.active || pt.done) ? '#fff' : C.muted, zIndex: 1, flexShrink: 0 }}>{pt.done ? '✓' : i + 1}</div>
              <div style={{ fontSize: 9, color: pt.active ? C.amber : pt.done ? C.teal : C.muted, textAlign: 'center', marginTop: 5, fontWeight: pt.active ? 700 : 400, lineHeight: 1.3 }}>{pt.label}</div>
              <div style={{ fontSize: 8, color: C.mutedLight, textAlign: 'center', fontFamily: font.mono }}>{pt.sub}</div>
            </div>
          ))}
        </div>
        <InfoGrid cols={2} items={[{ label: 'Current Position', val: 'Arabian Sea (17.4°N, 63.2°E)' }, { label: 'Speed', val: '18.4 knots' }, { label: 'ETA — Hamad Port', val: 'Apr 08, 2026 · 07:00', color: C.amber }, { label: 'Days Remaining', val: '3 days 14 hours' }]} />
      </div>
      <CheckRow status="ok" label="Hamad Port berth pre-reserved — CT1, Berths 04–06" badge="Reserved" />
      <CheckRow status="ok" label="4 consignees notified — ETA confirmation sent" badge="Notified" />
      <CheckRow status="ok" label="Customs advance notice filed — 18 containers × 4 B/Ls" badge="Filed" />
      <CheckRow status="ok" label="Truck fleet pre-allocated — 12 trucks on standby" badge="Pre-booked" />
      <AIBox items={['Live AIS tracking integrated — auto-alerts on any ETA deviation.', 'Portal auto-triggered 4 pre-arrival workflows simultaneously.', 'All clearance workflows ready the moment the vessel arrives at Hamad Port.']} />
    </div>);

    if (stepIdx === 2) return (<div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ padding: 12, background: C.tealLight, border: `1px solid ${C.tealBorder}`, borderRadius: 10, display: 'flex', gap: 12, alignItems: 'center' }}>
        <Anchor size={22} color={C.teal} style={{ flexShrink: 0 }} />
        <div>
          <div style={{ fontWeight: 700, color: C.text }}>MSC CONSTANZA — Hamad Port Arrival</div>
          <div style={{ fontSize: 11, color: C.muted }}>Apr 08, 2026 · 06:45 · CT1, Berths 04–06</div>
        </div>
        <span style={{ marginLeft: 'auto', padding: '4px 12px', background: C.greenLight, border: `1px solid ${C.greenBorder}`, borderRadius: 8, fontWeight: 700, fontSize: 12, color: C.green }}>BERTHED</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <AppCard agency="Qatar Customs Authority" status="Cleared" time="Pre-declaration approved · 32 min" rec="All 18 containers: Green Lane. No physical inspection." />
        <AppCard agency="Hamad Port Authority" status="Approved" time="Container discharge started · 08:00" rec="18 containers allocated to CY Block D." />
      </div>
      <div style={{ padding: 14, background: C.surface, borderRadius: 10, border: `1px solid ${C.border}`, boxShadow: C.shadow }}>
        <div style={{ fontSize: 11, color: C.muted, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: font.mono }}>Consignee Clearance Split</div>
        {[{ c: 'LuLu Hypermarket', n: 6, st: 'Cleared', d: 'USD 44,000' }, { c: 'IKEA Qatar', n: 4, st: 'Cleared', d: 'USD 31,200' }, { c: 'Carrefour Qatar', n: 5, st: 'Cleared', d: 'USD 38,800' }, { c: 'ACE Hardware', n: 3, st: 'In Review', d: 'USD 22,400' }].map((row, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: C.surfaceAlt, borderRadius: 7, marginBottom: 5, border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{row.c}</div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: C.muted, fontFamily: font.mono }}>{row.n} ctrs</span>
              <span style={{ fontSize: 11, color: C.amber, fontWeight: 600 }}>{row.d}</span>
              <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 700, background: row.st === 'Cleared' ? C.greenLight : C.amberLight, color: row.st === 'Cleared' ? C.green : C.amber, border: `1px solid ${row.st === 'Cleared' ? C.greenBorder : C.amberBorder}` }}>{row.st}</span>
            </div>
          </div>
        ))}
      </div>
      <AIBox items={['Pre-declaration advantage: customs cleared in 32 min vs. average 4–6 hours.', 'ACE Hardware — 1 container in conformity check. Non-blocking for other consignees.', '15 of 18 containers released. Unstuffing and truck dispatch initiated.']} />
    </div>);

    if (stepIdx === 3) return (<div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ padding: 14, background: C.surface, borderRadius: 10, border: `1px solid ${C.border}`, boxShadow: C.shadow }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: C.text, marginBottom: 12 }}>Container Unstuffing — CY Block D, Sheds 7–9</div>
        <InfoGrid cols={2} items={[{ label: 'Containers Unstuffing', val: '15 of 18 (3 on hold)' }, { label: 'Warehouse', val: 'Block D, Sheds 7–9' }, { label: 'Started', val: 'Apr 08 · 10:30' }, { label: 'Est. Completion', val: 'Apr 08 · 14:00', color: C.amber }]} />
      </div>
      <CheckRow status="ok" label="LuLu Hypermarket — 6 containers unstuffed, palletized, ready for truck" badge="Ready" />
      <CheckRow status="ok" label="IKEA Qatar — 4 containers unstuffed, quality check passed" badge="Ready" />
      <CheckRow status="warn" label="Carrefour Qatar — 5 containers unstuffing in progress, est. 13:30" badge="In Progress" />
      <CheckRow status="wait" label="ACE Hardware — 3 containers on customs conformity hold" badge="On Hold" />
      <InfoGrid cols={2} items={[{ label: 'WR Number', val: 'WHR-2026-5500-HMD' }, { label: 'Total SKUs', val: '14,280 units' }, { label: 'Pallets', val: '186 pallets' }, { label: 'Issued to', val: 'LuLu, IKEA, Carrefour', color: C.purple }]} />
      <AIBox items={['15 containers unstuffed. LuLu and IKEA loads ready for immediate dispatch.', 'Carrefour completing — 30 min estimated. ACE on customs hold.', 'Initiating truck dispatch for LuLu and IKEA consignments now.']} />
    </div>);

    if (stepIdx === 4) return (<div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ padding: 14, background: C.surface, borderRadius: 10, border: `1px solid ${C.border}`, boxShadow: C.shadow }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: C.text, marginBottom: 12 }}>Truck Fleet Dispatch — Multi-Drop</div>
        {[{ truck: 'MQ 3312 (12T)', dest: 'LuLu Hypermarket, Al Khor', pallets: 42, st: 'Dispatched · 13:15', col: C.green }, { truck: 'MQ 3318 (12T)', dest: 'LuLu Hypermarket, Lusail', pallets: 38, st: 'Dispatched · 13:15', col: C.green }, { truck: 'MQ 4101 (10T)', dest: 'IKEA Qatar, Doha Festival City', pallets: 54, st: 'Dispatched · 13:30', col: C.green }, { truck: 'MQ 4108 (10T)', dest: 'IKEA Qatar, Doha Festival City', pallets: 52, st: 'Dispatched · 13:30', col: C.green }, { truck: 'MQ 5220 (15T)', dest: 'Carrefour Qatar HQ', pallets: 0, st: 'Staged for 14:30', col: C.amber }].map((t, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: C.surfaceAlt, borderRadius: 8, border: `1px solid ${C.border}`, marginBottom: 6 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{t.truck}</div>
              <div style={{ fontSize: 11, color: C.muted }}>{t.dest}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              {t.pallets > 0 && <div style={{ fontSize: 11, color: C.muted, fontFamily: font.mono }}>{t.pallets} pallets</div>}
              <span style={{ fontSize: 11, fontWeight: 700, color: t.col }}>{t.st}</span>
            </div>
          </div>
        ))}
      </div>
      <AIBox items={['4 trucks dispatched. LuLu and IKEA loads en route — live GPS tracking active on portal.', 'Carrefour truck staged for 14:30 dispatch once unstuffing completes.', 'AI auto-notified all consignee warehouses with ETA and driver contact details.']} />
    </div>);

    if (stepIdx === 5) return (<div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ padding: 16, background: C.surface, border: `2px solid ${C.purpleBorder}`, borderRadius: 12, boxShadow: C.shadowMd }}>
        <div style={{ fontSize: 10, color: C.purple, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12, fontFamily: font.mono }}>Electronic Proof of Delivery — Multi-Drop</div>
        {[{ name: 'LuLu — Al Khor', time: '16:22', sign: 'Mgr. Mohd Al Rashid', done: true }, { name: 'LuLu — Lusail', time: '17:05', sign: 'Mgr. Fatima Al Nasr', done: true }, { name: 'IKEA — Doha Festival City', time: '16:48', sign: 'Mgr. Ahmed Thani', done: true }, { name: 'Carrefour — HQ', time: '19:30', sign: 'Mgr. Samer Kanaan', done: true }, { name: 'ACE Hardware — Industrial Area', time: 'Pending', sign: 'Customs hold ongoing', done: false }].map((d, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 12px', background: C.surfaceAlt, borderRadius: 8, border: `1px solid ${C.border}`, marginBottom: 6 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{d.name}</div>
              <div style={{ fontSize: 10, color: C.muted, fontFamily: font.mono }}>Signed: {d.sign} · {d.time}</div>
            </div>
            <span style={{ padding: '3px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700, background: d.done ? C.greenLight : C.amberLight, border: `1px solid ${d.done ? C.greenBorder : C.amberBorder}`, color: d.done ? C.green : C.amber, whiteSpace: 'nowrap' }}>{d.done ? 'Delivered' : 'Pending'}</span>
          </div>
        ))}
      </div>
      <SummaryKPIs items={[{ label: 'Total Journey', val: '~15 hrs', Icon: Clock, color: C.teal }, { label: 'Drops Done', val: '4 of 5', Icon: MapPin, color: C.green }, { label: 'AI Automation', val: '81%', Icon: Bot, color: C.teal }, { label: 'On-Time', val: '4 of 4', Icon: CheckCircle, color: C.green }]} />
      <AIBox items={['4 of 5 consignees received. ePODs signed and archived in portal.', 'ACE Hardware hold to resolve within 24 hrs (conformity check).', 'Complex 4-consignee multi-modal supply chain executed in approximately 15 hours end-to-end.']} />
    </div>);
  }
  return null;
};

// ─── Use Case Definitions ─────────────────────────────────────────────────────
const STEP_ICONS = {
  sea:        [Radio, FileText, Bot, Building2, CreditCard, CheckCircle],
  air:        [Upload, Bot, Shield, Warehouse, Thermometer],
  land:       [FileCheck, Bot, ShieldCheck, ScanLine, Truck],
  multimodal: [Package, Activity, Anchor, Boxes, Truck, ClipboardCheck],
};

const USE_CASES = [
  { id: 'sea', Icon: Ship, title: 'Sea Import', subtitle: 'Commercial Cargo', route: 'Hamburg Port → Hamad Port', color: C.primary, colorLight: C.primaryLight, colorBorder: C.primaryBorder, tagLabel: 'Most Common', tagColor: C.teal, description: 'Full import lifecycle for 32 containers — vessel pre-arrival notification through to gate release at Hamad Port.', totalTime: '6–9 hrs', steps: [{ title: 'Vessel Pre-Arrival Notification', dept: 'Portal Auto-Alert', est: '5 min' }, { title: 'Import Declaration Submission', dept: 'Freight Forwarder', est: '10 min' }, { title: 'AI Document Verification', dept: 'Atmet AI Engine', est: '~2 min auto' }, { title: 'Multi-Agency Approvals', dept: 'Customs + Port Auth', est: '2–4 hrs' }, { title: 'Duty Assessment & Payment', dept: 'Qatar Customs', est: '30 min' }, { title: 'Gate Release & Collection', dept: 'Hamad Port', est: '1 hr' }] },
  { id: 'air', Icon: Plane, title: 'Air Cargo Fast-Track', subtitle: 'Pharmaceutical Shipment', route: 'London Heathrow → HIA Doha', color: C.teal, colorLight: C.tealLight, colorBorder: C.tealBorder, tagLabel: 'Time-Critical', tagColor: C.orange, description: 'Temp-sensitive pharmaceutical cargo requiring health ministry pre-clearance — cleared in under 4 hours.', totalTime: '< 4 hrs', steps: [{ title: 'AWB & Cargo Manifest Upload', dept: 'Freight Forwarder', est: '5 min' }, { title: 'AI Pharma Compliance Screen', dept: 'Atmet AI Engine', est: '~3 min auto' }, { title: 'MOPH Health Ministry Pre-Clearance', dept: 'Ministry of Health', est: '45–90 min' }, { title: 'HIA Terminal Arrival & Handling', dept: 'HIA Cargo Terminal', est: '30 min' }, { title: 'Express Clearance & Cold Chain Dispatch', dept: 'Customs + Logistics', est: '< 1 hr' }] },
  { id: 'land', Icon: Truck, title: 'Land Border Crossing', subtitle: 'Oversize Heavy Equipment', route: 'RAKIA UAE → Abu Samra → Doha Industrial Area', color: C.amber, colorLight: C.amberLight, colorBorder: C.amberBorder, tagLabel: 'Complex Permit', tagColor: C.purple, description: '96-tonne crane requiring oversize permit, AI route analysis, joint authority approval and police escort.', totalTime: '5–7 hrs', steps: [{ title: 'Oversize Transport Permit Application', dept: 'Applicant / Agent', est: '10 min' }, { title: 'AI Route & Bridge Clearance Analysis', dept: 'Atmet AI Engine', est: '~5 min auto' }, { title: 'Ashghal & MOI Police Approval', dept: 'Ashghal + Police', est: '2–3 hrs' }, { title: 'Abu Samra Border Processing', dept: 'Border Authority', est: '1–2 hrs' }, { title: 'Escorted Delivery to Site', dept: 'Logistics + Escort', est: '2 hrs' }] },
  { id: 'multimodal', Icon: RefreshCw, title: 'Multi-Modal Supply Chain', subtitle: 'Sea + Land Distribution', route: 'Singapore PSA → Hamad Port → 4 Delivery Points', color: C.purple, colorLight: C.purpleLight, colorBorder: C.purpleBorder, tagLabel: 'Advanced Flow', tagColor: C.primary, description: 'Sea freight, port clearance, container unstuffing and 4-point last-mile truck distribution across Qatar.', totalTime: '12–18 hrs', steps: [{ title: 'Booking & Documentation Package', dept: 'Shipper / Forwarder', est: '15 min' }, { title: 'Sea Leg — Live Vessel Tracking', dept: 'Auto-Monitored Portal', est: 'Continuous' }, { title: 'Port Arrival & Customs Clearance', dept: 'Customs + Port Auth', est: '3–5 hrs' }, { title: 'Unstuffing & Warehouse Intake', dept: 'Port Warehouse', est: '2 hrs' }, { title: 'Truck Fleet Dispatch', dept: 'Logistics Coordinator', est: '1 hr' }, { title: 'Multi-Drop Delivery & ePOD', dept: 'Field + Portal', est: '4–8 hrs' }] },
];

// ─── Overview Page ────────────────────────────────────────────────────────────
const OverviewPage = ({ onExplore }) => {
  const techLayers = [
    { label: 'Presentation Layer', color: C.primary, colorLight: C.primaryLight, Icon: Globe, items: ['React 18 SPA', 'Mobile-Responsive', 'Arabic / English UI', 'Role-Based Dashboards'] },
    { label: 'Atmet AI Intelligence Layer', color: C.teal, colorLight: C.tealLight, Icon: Bot, items: ['Arabic-First NLP Engine', 'Document OCR & Extraction', 'Risk Scoring Engine', 'Auto-Approval Rules'] },
    { label: 'Integration Hub — Agency APIs', color: C.purple, colorLight: C.purpleLight, Icon: Network, items: ['Qatar Customs (QCA)', 'Hamad Port Authority', 'MOPH Qatar', 'Ashghal · MOI · MOCI · +8'] },
    { label: 'Data & Security Layer', color: C.green, colorLight: C.greenLight, Icon: Lock, items: ['PostgreSQL + Redis Cache', 'AIS Vessel Tracking Feed', 'IoT Cold Chain Monitoring', 'PDPPL Compliant · TLS 1.3'] },
  ];

  const capabilities = [
    { Icon: Anchor, title: 'Sea, Air & Land', desc: 'Single portal entry point across all modalities — Hamad Port, HIA Cargo, and Abu Samra.', color: C.primary },
    { Icon: Bot, title: 'AI-Powered Approvals', desc: '60–80% of approval steps automated. Smart routing to the right agency with instant recommendations.', color: C.teal },
    { Icon: Globe, title: 'Arabic-First Design', desc: 'Full bilingual Arabic/English portal with RTL support and Qatar dialect-aware NLP.', color: C.purple },
    { Icon: Building2, title: '14 Agencies Connected', desc: 'Customs, Port Authority, MOPH, Ashghal, MOI, MOCI and 8 additional government bodies.', color: C.amber },
    { Icon: Zap, title: '5× Faster Clearance', desc: 'Average clearance time reduced from 18–24 hours to 3–7 hours across all modalities.', color: C.green },
    { Icon: Shield, title: 'PDPPL Compliant', desc: "Fully compliant with Qatar's Personal Data Protection Law. TLS 1.3 encryption end-to-end.", color: C.red },
  ];

  return (
    <div style={{ maxWidth: 1020, margin: '0 auto', padding: '0 24px 80px' }}>

      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '52px 20px 40px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', background: C.amberLight, border: `1px solid ${C.amberBorder}`, borderRadius: 20, marginBottom: 20 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.amberAccent }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: C.amber, letterSpacing: 1, textTransform: 'uppercase', fontFamily: font.mono }}>MCIT · TASMU Smart Qatar · Open Tender Response</span>
        </div>
        <h1 style={{ fontFamily: font.display, fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: 800, color: C.navy, lineHeight: 1.05, marginBottom: 16, letterSpacing: 0.3 }}>
          Qatar Digital Logistics Portal
          <br />
          <span style={{ color: C.primary }}>Proof of Concept</span>
        </h1>
        <p style={{ fontSize: 15, color: C.muted, maxWidth: 560, margin: '0 auto 28px', lineHeight: 1.75 }}>
          An AI-powered, Arabic-first platform centralising logistics services across sea, air, and land — providing a single digital entry point for all Qatar logistics stakeholders.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={onExplore} style={{ padding: '12px 28px', borderRadius: 10, border: 'none', cursor: 'pointer', background: `linear-gradient(135deg, ${C.primary}, ${C.navyMid})`, color: '#fff', fontWeight: 700, fontSize: 14, fontFamily: font.body, display: 'flex', alignItems: 'center', gap: 8, boxShadow: C.shadowMd }}>
            Explore Use Cases <ArrowRight size={16} />
          </button>
          <div style={{ padding: '12px 20px', borderRadius: 10, border: `1px solid ${C.border}`, background: C.surface, fontSize: 13, color: C.muted, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 600, color: C.text }}>Powered by</span>
            <span style={{ fontWeight: 800, color: C.primary }}>Atmet AI</span>
            <span style={{ color: C.border }}>|</span>
            <span>Arabic-First Platform</span>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 40 }}>
        {[{ val: '14', label: 'Gov. Agencies Connected', Icon: Building2, color: C.primary }, { val: '5×', label: 'Faster Clearance', Icon: Zap, color: C.teal }, { val: '80%', label: 'Steps Automated by AI', Icon: Bot, color: C.purple }, { val: '3', label: 'Logistics Modalities', Icon: RefreshCw, color: C.amber }].map((s, i) => (
          <div key={i} style={{ padding: '18px 16px', background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, boxShadow: C.shadow, textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: `${s.color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <s.Icon size={18} color={s.color} />
              </div>
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: s.color, fontFamily: font.display }}>{s.val}</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 3, lineHeight: 1.4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* About POC */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 18 }}>
          <div style={{ width: 3, height: 20, background: C.primary, borderRadius: 2 }} />
          <h2 style={{ fontFamily: font.display, fontSize: 22, fontWeight: 800, color: C.navy }}>About This POC</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {[{ title: 'What This Demonstrates', icon: Flag, color: C.primary, content: 'This POC showcases how Atmet AI\'s Arabic-first enterprise platform can serve as the intelligence layer for Qatar\'s Digital Logistics Portal — enabling single-window access, AI-automated approvals, and real-time visibility across sea, air and land.' }, { title: 'Target Stakeholders', icon: Users, color: C.teal, content: 'Freight forwarders, shipping agents, importers and exporters, government agencies, logistics companies, and port and airport operators across Qatar\'s logistics ecosystem.' }, { title: 'Core Value Proposition', icon: TrendingUp, color: C.purple, content: 'Reduce average clearance time from 18–24 hours to under 7 hours. Eliminate physical office visits. Provide a single portal replacing 14 separate agency interactions. Full Arabic + English bilingual support.' }, { title: 'Scope of Tender Response', icon: FileText, color: C.amber, content: 'This interactive demo maps directly to the TASMU Smart Qatar MCIT tender brief: centralising logistics services, providing a single digital entry point, streamlining approvals, and enhancing efficiency and visibility for logistics stakeholders.' }].map((card, i) => (
            <div key={i} style={{ padding: '18px', background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, boxShadow: C.shadow }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: `${card.color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <card.icon size={16} color={card.color} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{card.title}</div>
              </div>
              <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.7 }}>{card.content}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Capabilities */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 18 }}>
          <div style={{ width: 3, height: 20, background: C.teal, borderRadius: 2 }} />
          <h2 style={{ fontFamily: font.display, fontSize: 22, fontWeight: 800, color: C.navy }}>Platform Capabilities</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {capabilities.map((cap, i) => (
            <div key={i} style={{ padding: '16px', background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, boxShadow: C.shadow, borderTop: `2px solid ${cap.color}` }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: `${cap.color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                <cap.Icon size={18} color={cap.color} />
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 5 }}>{cap.title}</div>
              <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.65 }}>{cap.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tech Stack Architecture */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 18 }}>
          <div style={{ width: 3, height: 20, background: C.purple, borderRadius: 2 }} />
          <h2 style={{ fontFamily: font.display, fontSize: 22, fontWeight: 800, color: C.navy }}>Technical Architecture</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, background: C.surface, borderRadius: 14, border: `1px solid ${C.border}`, overflow: 'hidden', boxShadow: C.shadowMd }}>
          {techLayers.map((layer, i) => (
            <div key={i}>
              <div style={{ padding: '16px 20px', borderBottom: i < techLayers.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 7, background: layer.colorLight, border: `1px solid ${layer.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <layer.Icon size={15} color={layer.color} />
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: layer.color, textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: font.mono }}>{layer.label}</div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginLeft: 40 }}>
                  {layer.items.map((item, j) => (
                    <span key={j} style={{ padding: '4px 10px', background: layer.colorLight, border: `1px solid ${layer.color}30`, borderRadius: 6, fontSize: 11, color: layer.color, fontWeight: 600, fontFamily: font.mono }}>{item}</span>
                  ))}
                </div>
              </div>
              {i < techLayers.length - 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 0', background: C.surfaceAlt, borderBottom: `1px solid ${C.border}` }}>
                  <ChevronRight size={14} color={C.muted} style={{ transform: 'rotate(90deg)' }} />
                </div>
              )}
            </div>
          ))}
        </div>
        {/* Stack specifics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginTop: 14 }}>
          {[{ label: 'Frontend', items: ['React 18', 'Lucide Icons', 'Recharts', 'DM Sans / Barlow'], Icon: Code, color: C.primary }, { label: 'AI Engine', items: ['Arabic NLP', 'OCR Pipeline', 'Rules Engine', 'Risk Scoring'], Icon: Bot, color: C.teal }, { label: 'Integrations', items: ['REST / SOAP', 'AIS Feed API', 'IoT MQTT', 'SMS Gateway'], Icon: Network, color: C.purple }, { label: 'Infrastructure', items: ['Azure Qatar', 'Kubernetes', 'PostgreSQL', 'Redis Cache'], Icon: Server, color: C.green }].map((s, i) => (
            <div key={i} style={{ padding: '14px', background: C.surface, borderRadius: 10, border: `1px solid ${C.border}`, boxShadow: C.shadow }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <s.Icon size={14} color={s.color} />
                <span style={{ fontSize: 11, fontWeight: 700, color: s.color, textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: font.mono }}>{s.label}</span>
              </div>
              {s.items.map((item, j) => (
                <div key={j} style={{ fontSize: 11, color: C.muted, padding: '3px 0', borderBottom: j < s.items.length - 1 ? `1px solid ${C.border}` : 'none' }}>{item}</div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: '28px 32px', background: `linear-gradient(135deg, ${C.primaryLight}, ${C.tealLight})`, border: `1px solid ${C.primaryBorder}`, borderRadius: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, boxShadow: C.shadowMd }}>
        <div>
          <div style={{ fontFamily: font.display, fontWeight: 800, fontSize: 18, color: C.navy, marginBottom: 4 }}>Ready to see it in action?</div>
          <div style={{ fontSize: 13, color: C.muted }}>Explore 4 real-life logistics scenarios — each with an interactive A-to-Z flow.</div>
        </div>
        <button onClick={onExplore} style={{ padding: '12px 28px', borderRadius: 10, border: 'none', cursor: 'pointer', background: `linear-gradient(135deg, ${C.primary}, ${C.navyMid})`, color: '#fff', fontWeight: 700, fontSize: 14, fontFamily: font.body, display: 'flex', alignItems: 'center', gap: 8, boxShadow: C.shadowMd }}>
          Explore Use Cases <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function LogisticsPortalDemo() {
  const [page, setPage] = useState('overview'); // 'overview' | 'select' | 'demo'
  const [selectedUC, setSelectedUC] = useState(null);
  const [step, setStep] = useState(0);
  const [completed, setCompleted] = useState([]);
  const [visible, setVisible] = useState(true);

  const uc = USE_CASES.find(u => u.id === selectedUC);

  const goTo = (target) => {
    setVisible(false);
    setTimeout(() => { setStep(target); setVisible(true); }, 200);
  };

  const nextStep = () => {
    if (!uc) return;
    setCompleted(p => p.includes(step) ? p : [...p, step]);
    if (step < uc.steps.length - 1) goTo(step + 1);
  };

  const startUC = (id) => { setSelectedUC(id); setStep(0); setCompleted([]); setPage('demo'); };
  const goSelect = () => { setPage('select'); setSelectedUC(null); };
  const allDone = uc && completed.length >= uc.steps.length;
  const stepIcons = selectedUC ? STEP_ICONS[selectedUC] : [];

  return (
    <div style={{ fontFamily: font.body, background: C.bg, color: C.text, minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Barlow+Condensed:wght@600;700;800&family=DM+Mono:wght@400;500&family=Noto+Kufi+Arabic:wght@400;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:${C.bg}}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:${C.surfaceAlt}}::-webkit-scrollbar-thumb{background:${C.borderMid};border-radius:4px}
        .uc-card{transition:transform 0.2s,box-shadow 0.2s;cursor:pointer;}
        .uc-card:hover{transform:translateY(-4px);box-shadow:${C.shadowLg};}
        .step-node{transition:all 0.15s;cursor:pointer;}
        .step-node:hover{background:${C.primaryLight} !important;}
        .btn{transition:all 0.15s;cursor:pointer;}
        .btn:hover:not(:disabled){opacity:0.88;transform:scale(0.98);}
        .fade{transition:opacity 0.2s ease;}
        .nav-link{transition:color 0.12s;cursor:pointer;}
        .nav-link:hover{color:${C.primary} !important;}
        .pulse{animation:pulse 2.5s infinite;}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        .hero-in{animation:fup 0.6s ease both;}
        .hero-in:nth-child(2){animation-delay:.1s}.hero-in:nth-child(3){animation-delay:.2s}.hero-in:nth-child(4){animation-delay:.3s}
        @keyframes fup{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .done-screen{animation:fup 0.4s ease both;}
      `}</style>

      {/* ── NAV ── */}
      <nav style={{ padding: '0 28px', height: 58, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${C.border}`, background: C.surface, boxShadow: C.shadow, position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', gap: 2 }}>
            <div style={{ width: 3, height: 20, background: C.primary, borderRadius: 2 }} />
            <div style={{ width: 3, height: 20, background: C.amberAccent, borderRadius: 2, marginLeft: 2 }} />
          </div>
          <div>
            <div style={{ fontFamily: font.display, fontWeight: 800, fontSize: 15, color: C.navy, letterSpacing: 0.5 }}>DIGITAL LOGISTICS PORTAL</div>
            <div style={{ fontSize: 9, color: C.muted, letterSpacing: 1.2, fontFamily: font.mono }}>ATMET AI · TASMU SMART QATAR · MCIT</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {[{ label: 'Overview', id: 'overview' }, { label: 'Use Cases', id: 'select' }].map(link => (
            <button key={link.id} className="nav-link" onClick={() => link.id === 'select' ? goSelect() : setPage('overview')} style={{ padding: '6px 14px', borderRadius: 7, border: 'none', cursor: 'pointer', background: page === link.id ? C.primaryLight : 'transparent', color: page === link.id ? C.primary : C.muted, fontSize: 12, fontWeight: page === link.id ? 700 : 500, fontFamily: font.body }}>
              {link.label}
            </button>
          ))}
          {selectedUC && page === 'demo' && (
            <button className="nav-link" style={{ padding: '6px 14px', borderRadius: 7, border: 'none', cursor: 'pointer', background: uc?.colorLight, color: uc?.color, fontSize: 12, fontWeight: 700, fontFamily: font.body }}>
              {uc?.title}
            </button>
          )}
          <div style={{ width: 1, height: 20, background: C.border, margin: '0 6px' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="pulse" style={{ width: 7, height: 7, borderRadius: '50%', background: C.green, display: 'block', boxShadow: `0 0 6px ${C.green}` }} />
            <span style={{ fontSize: 11, color: C.muted, fontFamily: font.mono }}>Live Demo</span>
          </div>
        </div>
      </nav>

      {/* ── OVERVIEW ── */}
      {page === 'overview' && <OverviewPage onExplore={goSelect} />}

      {/* ── USE CASE SELECTION ── */}
      {page === 'select' && (
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 22px 80px' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{ fontSize: 10, color: C.primary, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 12, fontWeight: 700, fontFamily: font.mono }}>Interactive Demo · Choose a Scenario</div>
            <h1 style={{ fontFamily: font.display, fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 800, color: C.navy, marginBottom: 10 }}>Real-Life Use Case Flows</h1>
            <p style={{ fontSize: 13, color: C.muted, maxWidth: 500, margin: '0 auto', lineHeight: 1.7 }}>Select a logistics scenario. The portal walks you through every step of the real-life process, powered by Atmet AI.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {USE_CASES.map(u => (
              <div key={u.id} className="uc-card" onClick={() => startUC(u.id)} style={{ padding: 22, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, boxShadow: C.shadow, borderTop: `3px solid ${u.color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 12, background: u.colorLight, border: `1px solid ${u.colorBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <u.Icon size={26} color={u.color} />
                  </div>
                  <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: `${u.tagColor}14`, color: u.tagColor, border: `1px solid ${u.tagColor}44`, fontFamily: font.mono }}>{u.tagLabel}</span>
                </div>
                <div style={{ fontFamily: font.display, fontWeight: 800, fontSize: 20, color: C.navy, marginBottom: 2 }}>{u.title}</div>
                <div style={{ fontSize: 12, color: u.color, fontWeight: 600, marginBottom: 8 }}>{u.subtitle}</div>
                <div style={{ fontSize: 12, color: C.muted, marginBottom: 14, lineHeight: 1.65 }}>{u.description}</div>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <MapPin size={12} color={C.muted} />
                  {u.route}
                </div>
                <div style={{ height: 1, background: C.border, marginBottom: 12 }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div style={{ fontSize: 11, color: C.muted, fontFamily: font.mono }}>{u.steps.length} steps · {u.totalTime}</div>
                  <div style={{ display: 'flex', gap: 3 }}>{u.steps.map((_, i) => <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: C.border }} />)}</div>
                </div>
                <div style={{ padding: '10px', background: u.colorLight, border: `1px solid ${u.colorBorder}`, borderRadius: 8, textAlign: 'center', fontSize: 12, fontWeight: 700, color: u.color, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  Start Demo <ChevronRight size={14} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── DEMO FLOW ── */}
      {page === 'demo' && selectedUC && uc && (
        <div style={{ maxWidth: 1040, margin: '0 auto', padding: '20px 20px 60px', display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Header */}
          <div style={{ padding: '14px 20px', background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, boxShadow: C.shadow, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: uc.colorLight, border: `1px solid ${uc.colorBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <uc.Icon size={22} color={uc.color} />
              </div>
              <div>
                <div style={{ fontFamily: font.display, fontWeight: 800, fontSize: 18, color: C.navy }}>{uc.title} — {uc.subtitle}</div>
                <div style={{ fontSize: 11, color: C.muted, display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                  <MapPin size={10} color={C.muted} />
                  {uc.route} · est. {uc.totalTime}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
              <div style={{ fontSize: 11, color: C.muted, fontFamily: font.mono }}>Step {step + 1} of {uc.steps.length}</div>
              <div style={{ width: 180, height: 6, background: C.surfaceAlt, borderRadius: 3, overflow: 'hidden', border: `1px solid ${C.border}` }}>
                <div style={{ height: '100%', width: `${((step + 1) / uc.steps.length) * 100}%`, background: `linear-gradient(90deg, ${uc.color}, ${C.amberAccent})`, borderRadius: 3, transition: 'width 0.4s ease' }} />
              </div>
            </div>
          </div>

          {/* Stepper + Panel */}
          <div style={{ display: 'grid', gridTemplateColumns: '216px 1fr', gap: 14 }}>

            {/* Left Stepper */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {uc.steps.map((s, i) => {
                const active = i === step, done = completed.includes(i);
                const StepIconComp = stepIcons[i] || CheckCircle;
                return (
                  <div key={i} className="step-node" onClick={() => goTo(i)} style={{ padding: '10px 12px', borderRadius: 10, border: `1px solid ${active ? uc.color : done ? C.greenBorder : C.border}`, background: active ? uc.colorLight : done ? C.greenLight : C.surface, boxShadow: active ? C.shadow : 'none', borderLeft: `3px solid ${active ? uc.color : done ? C.green : C.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: done ? C.green : active ? uc.color : C.surfaceAlt, border: `1px solid ${done ? C.green : active ? uc.color : C.borderMid}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {done ? <CheckCircle size={13} color="#fff" /> : <StepIconComp size={12} color={active ? '#fff' : C.muted} />}
                      </div>
                      <div style={{ fontSize: 11, fontWeight: active ? 700 : done ? 600 : 500, color: active ? C.text : done ? C.textMid : C.muted, lineHeight: 1.35 }}>{s.title}</div>
                    </div>
                    <div style={{ marginTop: 5, marginLeft: 32 }}>
                      <div style={{ fontSize: 9, color: C.mutedLight, fontFamily: font.mono }}>{s.dept}</div>
                      <div style={{ fontSize: 9, color: active ? uc.color : C.mutedLight, fontWeight: active ? 600 : 400, fontFamily: font.mono }}>{s.est}</div>
                    </div>
                  </div>
                );
              })}
              <div style={{ marginTop: 8, padding: '10px 12px', background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 10, textAlign: 'center' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: uc.color }}>{completed.length} / {uc.steps.length}</div>
                <div style={{ fontSize: 9, color: C.muted, marginTop: 2, fontFamily: font.mono }}>steps completed</div>
              </div>
            </div>

            {/* Right Panel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {!allDone && (
                <div style={{ padding: '13px 16px', background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, boxShadow: C.shadow, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: uc.colorLight, border: `1px solid ${uc.colorBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {stepIcons[step] ? (() => { const I = stepIcons[step]; return <I size={20} color={uc.color} />; })() : null}
                  </div>
                  <div>
                    <div style={{ fontFamily: font.display, fontWeight: 700, fontSize: 17, color: C.navy }}>{uc.steps[step].title}</div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 2, fontFamily: font.mono }}>{uc.steps[step].dept} · {uc.steps[step].est}</div>
                  </div>
                  <div style={{ marginLeft: 'auto', padding: '5px 12px', background: uc.colorLight, border: `1px solid ${uc.colorBorder}`, borderRadius: 8, textAlign: 'center', flexShrink: 0 }}>
                    <div style={{ fontSize: 9, color: C.muted, fontFamily: font.mono }}>STEP</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: uc.color, fontFamily: font.display }}>{step + 1}/{uc.steps.length}</div>
                  </div>
                </div>
              )}

              {allDone ? (
                <div className="done-screen" style={{ padding: 36, background: C.surface, borderRadius: 14, border: `2px solid ${C.greenBorder}`, textAlign: 'center', boxShadow: C.shadowMd }}>
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: C.greenLight, border: `2px solid ${C.greenBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <CheckCircle size={30} color={C.green} />
                  </div>
                  <div style={{ fontFamily: font.display, fontWeight: 800, fontSize: 26, color: C.green, marginBottom: 8 }}>Flow Completed</div>
                  <div style={{ fontSize: 13, color: C.muted, maxWidth: 380, margin: '0 auto 24px', lineHeight: 1.7 }}>You've walked through the complete <span style={{ color: uc.color, fontWeight: 700 }}>{uc.title}</span> flow on Qatar's Digital Logistics Portal.</div>
                  <SummaryKPIs items={[{ label: 'Steps Completed', val: uc.steps.length, Icon: CheckCircle, color: C.green }, { label: 'Flow Duration', val: uc.totalTime, Icon: Clock, color: C.teal }, { label: 'AI Automation', val: '60–80%', Icon: Bot, color: C.teal }, { label: 'Portal Queues', val: 'Zero', Icon: Zap, color: C.amber }]} />
                  <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button className="btn" onClick={goSelect} style={{ padding: '11px 22px', borderRadius: 9, border: `1px solid ${C.border}`, background: C.surface, color: C.text, cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: font.body, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <ChevronLeft size={15} /> Try Another Use Case
                    </button>
                    <button className="btn" onClick={() => { setStep(0); setCompleted([]); }} style={{ padding: '11px 22px', borderRadius: 9, border: 'none', background: `linear-gradient(135deg, ${C.green}, #0F6A30)`, color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: font.body, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <RotateCcw size={15} /> Replay Flow
                    </button>
                  </div>
                </div>
              ) : (
                <div className="fade" style={{ padding: 20, background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, boxShadow: C.shadow, overflowY: 'auto', maxHeight: 510, opacity: visible ? 1 : 0 }}>
                  {renderContent(selectedUC, step)}
                </div>
              )}

              {!allDone && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
                  <button className="btn" onClick={() => goTo(step - 1)} disabled={step === 0} style={{ padding: '10px 20px', borderRadius: 9, border: `1px solid ${C.border}`, background: C.surface, color: step === 0 ? C.mutedLight : C.textMid, cursor: step === 0 ? 'default' : 'pointer', fontSize: 13, fontWeight: 600, fontFamily: font.body, display: 'flex', alignItems: 'center', gap: 6, boxShadow: step === 0 ? 'none' : C.shadow }}>
                    <ChevronLeft size={15} /> Previous
                  </button>
                  <div style={{ fontSize: 11, color: C.muted, fontFamily: font.mono }}>{completed.includes(step) ? 'Step complete' : 'Complete step to advance'}</div>
                  {step < uc.steps.length - 1 ? (
                    <button className="btn" onClick={nextStep} style={{ padding: '10px 24px', borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, background: `linear-gradient(135deg, ${uc.color}, ${C.navyMid})`, color: '#fff', fontFamily: font.body, display: 'flex', alignItems: 'center', gap: 6, boxShadow: C.shadowMd }}>
                      Next Step <ChevronRight size={15} />
                    </button>
                  ) : (
                    <button className="btn" onClick={nextStep} style={{ padding: '10px 24px', borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, background: `linear-gradient(135deg, ${C.green}, #0F6A30)`, color: '#fff', fontFamily: font.body, display: 'flex', alignItems: 'center', gap: 6, boxShadow: C.shadowMd }}>
                      Complete Flow <CheckCircle size={15} />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
