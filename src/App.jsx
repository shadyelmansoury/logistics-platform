import { useState } from "react";
import {
  Anchor, Plane, Truck, RefreshCw, Ship,
  CheckCircle, AlertTriangle, XCircle, Clock, Info,
  FileText, CreditCard, Package, Building2, Cpu,
  Shield, ShieldCheck, Thermometer, MapPin, Radio, Activity,
  Server, Database, Cloud, Globe, Lock, Code, Layers, Zap,
  ArrowRight, RotateCcw, Upload, Bell,
  Warehouse, Users, TrendingUp,
  ClipboardCheck, Boxes, FileCheck, Network,
  ChevronRight, ChevronLeft, Bot, BarChart3,
  Map, ScanLine, Flag, Languages,
} from "lucide-react";

// ─── Design System ────────────────────────────────────────────────────────────
const C = {
  bg:'#F4F7FB', surface:'#FFFFFF', surfaceAlt:'#EEF3FA',
  navy:'#0C1E3D', navyMid:'#1A3460',
  primary:'#1B52C9', primaryLight:'#EBF1FF', primaryBorder:'#C0D2F7',
  teal:'#0A8C80', tealLight:'#E7F8F6', tealBorder:'#9FE0D8',
  amber:'#D97706', amberLight:'#FFFBEB', amberBorder:'#FCD34D', amberAccent:'#F59E0B',
  purple:'#6D28D9', purpleLight:'#F3F0FF', purpleBorder:'#C4B5FD',
  green:'#15803D', greenLight:'#F0FDF4', greenBorder:'#86EFAC',
  red:'#B91C1C', redLight:'#FEF2F2', redBorder:'#FCA5A5',
  orange:'#C2410C', orangeLight:'#FFF7ED',
  text:'#0C1E3D', textMid:'#334155', muted:'#64748B', mutedLight:'#94A3B8',
  border:'#DDE5EF', borderMid:'#C3CFDF',
  shadow:'0 1px 4px rgba(12,30,61,0.08)',
  shadowMd:'0 4px 20px rgba(12,30,61,0.10)',
  shadowLg:'0 10px 40px rgba(12,30,61,0.12)',
};
const font = { display:"'Barlow Condensed',sans-serif", body:"'DM Sans',sans-serif", mono:"'DM Mono',monospace" };

// ─── Translations ──────────────────────────────────────────────────────────────
const S = {
  en: {
    nav: { title:'DIGITAL LOGISTICS PORTAL', sub:'ATMET AI · TASMU SMART QATAR · MCIT', overview:'Overview', useCases:'Use Cases', liveDemo:'Live Demo' },
    overview: {
      badge:'MCIT · TASMU Smart Qatar · Open Tender Response',
      title:'Qatar Digital Logistics Portal', titleAccent:'Proof of Concept',
      desc:"An AI-powered, Arabic-first platform centralising logistics services across sea, air, and land — providing a single digital entry point for all Qatar logistics stakeholders.",
      exploreBtn:'Explore Use Cases', poweredBy:'Powered by', arabicFirst:'Arabic-First Platform',
      aboutTitle:'About This POC', capTitle:'Platform Capabilities', archTitle:'Technical Architecture',
      readyTitle:"Ready to see it in action?", readyDesc:'Explore 4 real-life logistics scenarios — each with an interactive A-to-Z flow.',
      stats: ['Gov. Agencies Connected','Faster Clearance','Steps Automated by AI','Logistics Modalities'],
      aboutCards: [
        { title:'What This Demonstrates', content:"This POC showcases how Atmet AI's Arabic-first enterprise platform can serve as the intelligence layer for Qatar's Digital Logistics Portal — enabling single-window access, AI-automated approvals, and real-time visibility across sea, air and land." },
        { title:'Target Stakeholders', content:"Freight forwarders, shipping agents, importers and exporters, government agencies, logistics companies, and port and airport operators across Qatar's logistics ecosystem." },
        { title:'Core Value Proposition', content:'Reduce average clearance time from 18–24 hours to under 7 hours. Eliminate physical office visits. Provide a single portal replacing 14 separate agency interactions. Full Arabic + English bilingual support.' },
        { title:'Scope of Tender Response', content:'This demo maps directly to the TASMU MCIT tender brief: centralising logistics services, providing a single digital entry point, streamlining approvals, and enhancing efficiency for logistics stakeholders.' },
      ],
    },
    select: { badge:'Interactive Demo · Choose a Scenario', title:'Real-Life Use Case Flows', desc:'Select a logistics scenario. The portal walks you through every step powered by Atmet AI.', startDemo:'Start Demo' },
    demo: { prev:'Previous', nextStep:'Next Step', completeFlow:'Complete Flow', stepComplete:'Step complete', clickNext:'Complete step to advance', stepsCompleted:'steps completed', allUseCases:'All Use Cases', replayFlow:'Replay Flow', tryAnother:'Try Another Use Case', flowCompleted:'Flow Completed', flowCompletedDesc:'walked through the complete', flowCompletedDesc2:'flow on Qatar\'s Digital Logistics Portal.', step:'STEP', of:'of' },
    aiPanel: { title:'Atmet AI Engine', active:'ACTIVE', timeSaved:'Time Saved', confidence:'Confidence', vs:'vs Manual' },
    status: { Approved:'Approved', Pending:'Pending', 'In Review':'In Review', Cleared:'Cleared' },
    ucTitles: { sea:'Sea Import', air:'Air Cargo Fast-Track', land:'Land Border Crossing', multimodal:'Multi-Modal Supply Chain' },
    ucSubtitles: { sea:'Commercial Cargo', air:'Pharmaceutical Shipment', land:'Oversize Heavy Equipment', multimodal:'Sea + Land Distribution' },
    ucTags: { sea:'Most Common', air:'Time-Critical', land:'Complex Permit', multimodal:'Advanced Flow' },
    ucDescs: {
      sea:'Full import lifecycle for 32 containers — vessel pre-arrival notification through to gate release at Hamad Port.',
      air:'Temp-sensitive pharmaceutical cargo requiring health ministry pre-clearance — cleared in under 4 hours.',
      land:'96-tonne crane requiring oversize permit, AI route analysis, joint authority approval and police escort.',
      multimodal:'Sea freight, port clearance, container unstuffing and 4-point last-mile truck distribution across Qatar.',
    },
    ucTimes: { sea:'6–9 hrs', air:'< 4 hrs', land:'5–7 hrs', multimodal:'12–18 hrs' },
    steps: {
      sea:['Vessel Pre-Arrival Notification','Import Declaration Submission','AI Document Verification','Multi-Agency Approvals','Duty Assessment & Payment','Gate Release & Collection'],
      air:['AWB & Cargo Manifest Upload','AI Pharma Compliance Screen','MOPH Health Ministry Pre-Clearance','HIA Terminal Arrival & Handling','Express Clearance & Cold Chain Dispatch'],
      land:['Oversize Transport Permit Application','AI Route & Bridge Clearance Analysis','Ashghal & MOI Police Approval','Abu Samra Border Processing','Escorted Delivery to Site'],
      multimodal:['Booking & Documentation Package','Sea Leg — Live Vessel Tracking','Port Arrival & Customs Clearance','Unstuffing & Warehouse Intake','Truck Fleet Dispatch','Multi-Drop Delivery & ePOD'],
    },
    depts: {
      sea:['Portal Auto-Alert','Freight Forwarder','Atmet AI Engine','Customs + Port Auth','Qatar Customs','Hamad Port'],
      air:['Freight Forwarder','Atmet AI Engine','Ministry of Health','HIA Cargo Terminal','Customs + Logistics'],
      land:['Applicant / Agent','Atmet AI Engine','Ashghal + Police','Border Authority','Logistics + Escort'],
      multimodal:['Shipper / Forwarder','Auto-Monitored Portal','Customs + Port Auth','Port Warehouse','Logistics Coordinator','Field + Portal'],
    },
    ests: {
      sea:['5 min','10 min','~2 min auto','2–4 hrs','30 min','1 hr'],
      air:['5 min','~3 min auto','45–90 min','30 min','< 1 hr'],
      land:['10 min','~5 min auto','2–3 hrs','1–2 hrs','2 hrs'],
      multimodal:['15 min','Continuous','3–5 hrs','2 hrs','1 hr','4–8 hrs'],
    },
    kpiLabels: ['Steps Completed','Flow Duration','AI Automation','Portal Queues'],
    techLayers: [
      { label:'Presentation Layer', items:['React 18 SPA','Mobile-Responsive','Arabic / English UI','Role-Based Dashboards'] },
      { label:'Atmet AI Intelligence Layer', items:['Arabic-First NLP Engine','Document OCR & Extraction','Risk Scoring Engine','Auto-Approval Rules'] },
      { label:'Integration Hub — Agency APIs', items:['Qatar Customs (QCA)','Hamad Port Authority','MOPH Qatar','Ashghal · MOI · MOCI · +8'] },
      { label:'Data & Security Layer', items:['PostgreSQL + Redis Cache','AIS Vessel Tracking Feed','IoT Cold Chain Monitoring','PDPPL Compliant · TLS 1.3'] },
    ],
    capCards: [
      { title:'Sea, Air & Land', desc:'Single portal entry point across all modalities — Hamad Port, HIA Cargo, and Abu Samra border.' },
      { title:'AI-Powered Approvals', desc:'60–80% of approval steps automated. Smart routing to the right agency with instant AI recommendations.' },
      { title:'Arabic-First Design', desc:'Full bilingual Arabic/English portal with RTL support and Qatar dialect-aware NLP engine.' },
      { title:'14 Agencies Connected', desc:'Customs, Port Authority, MOPH, Ashghal, MOI, MOCI and 8 additional government bodies.' },
      { title:'5× Faster Clearance', desc:'Average clearance time reduced from 18–24 hours to 3–7 hours across all modalities.' },
      { title:'PDPPL Compliant', desc:"Fully compliant with Qatar's Personal Data Protection Law. TLS 1.3 encryption end-to-end." },
    ],
    stackLabels: ['Frontend','AI Engine','Integrations','Infrastructure'],
  },
  ar: {
    nav: { title:'بوابة الخدمات اللوجستية الرقمية', sub:'أتمت للذكاء الاصطناعي · تسمو قطر · وزارة الاتصالات', overview:'نظرة عامة', useCases:'حالات الاستخدام', liveDemo:'عرض حي' },
    overview: {
      badge:'وزارة الاتصالات · تسمو قطر · الطرح المفتوح للمناقصة',
      title:'بوابة قطر الرقمية للخدمات اللوجستية', titleAccent:'دليل على المفهوم',
      desc:'منصة مدعومة بالذكاء الاصطناعي وتدعم العربية أولاً، تجمع خدمات الشحن البحري والجوي والبري في نقطة دخول رقمية موحدة لجميع أصحاب المصلحة اللوجستية في قطر.',
      exploreBtn:'استكشف حالات الاستخدام', poweredBy:'مدعوم من', arabicFirst:'منصة عربية أولاً',
      aboutTitle:'حول هذا النموذج', capTitle:'قدرات المنصة', archTitle:'البنية التقنية',
      readyTitle:'هل أنت مستعد لمشاهدته؟', readyDesc:'استكشف 4 سيناريوهات لوجستية واقعية — كل منها بتدفق تفاعلي من الألف إلى الياء.',
      stats: ['جهة حكومية متصلة','أسرع في التخليص','من الخطوات مؤتمتة بالذكاء','أنماط لوجستية'],
      aboutCards: [
        { title:'ما الذي يُظهره هذا النموذج', content:'يُوضّح هذا النموذج كيف يمكن لمنصة أتمت العربية الأولى للذكاء الاصطناعي أن تكون طبقة الذكاء في بوابة قطر الرقمية للخدمات اللوجستية — مما يتيح نافذة موحدة وموافقات مؤتمتة وتتبعاً فورياً.' },
        { title:'الجهات المستهدفة', content:'وكلاء الشحن والمستوردون والمصدرون والجهات الحكومية وشركات الشحن ومشغلو الموانئ والمطارات في قطر.' },
        { title:'القيمة الجوهرية المقدمة', content:'تقليل متوسط وقت التخليص من 18–24 ساعة إلى أقل من 7 ساعات، وإلغاء زيارات المكاتب الحكومية، وتوحيد 14 جهة حكومية في بوابة واحدة.' },
        { title:'نطاق الاستجابة للمناقصة', content:'يتوافق هذا العرض مباشرة مع مناقصة تسمو القطرية: مركزة الخدمات اللوجستية وتوفير نقطة دخول رقمية موحدة وتبسيط الموافقات وتعزيز الكفاءة.' },
      ],
    },
    select: { badge:'عرض تفاعلي · اختر سيناريو', title:'تدفقات حالات الاستخدام الواقعية', desc:'اختر سيناريو لوجستياً. تقودك البوابة عبر كل خطوة من بداية العملية حتى نهايتها بدعم من أتمت للذكاء الاصطناعي.', startDemo:'ابدأ العرض' },
    demo: { prev:'السابق', nextStep:'الخطوة التالية', completeFlow:'إتمام المسار', stepComplete:'اكتملت الخطوة', clickNext:'أكمل الخطوة للمتابعة', stepsCompleted:'خطوات مكتملة', allUseCases:'جميع حالات الاستخدام', replayFlow:'إعادة المسار', tryAnother:'جرّب حالة استخدام أخرى', flowCompleted:'اكتمل المسار', flowCompletedDesc:'عبرت المسار الكامل لـ', flowCompletedDesc2:'على بوابة قطر الرقمية للخدمات اللوجستية.', step:'خطوة', of:'من' },
    aiPanel: { title:'محرك أتمت للذكاء الاصطناعي', active:'نشط', timeSaved:'الوقت المُوفَّر', confidence:'الدقة', vs:'مقارنةً بالعملية اليدوية' },
    status: { Approved:'موافق عليه', Pending:'قيد الانتظار', 'In Review':'قيد المراجعة', Cleared:'تم التخليص' },
    ucTitles: { sea:'الاستيراد البحري', air:'الشحن الجوي السريع', land:'عبور الحدود البرية', multimodal:'سلسلة التوريد متعددة الوسائط' },
    ucSubtitles: { sea:'بضائع تجارية', air:'شحنة أدوية', land:'معدات ثقيلة كبيرة الحجم', multimodal:'بحري + توزيع بري' },
    ucTags: { sea:'الأكثر شيوعاً', air:'حرج بالوقت', land:'تصاريح معقدة', multimodal:'مسار متقدم' },
    ucDescs: {
      sea:'دورة استيراد كاملة لـ 32 حاوية — من إشعار ما قبل الوصول إلى إذن البوابة في ميناء حمد.',
      air:'شحنة أدوية حساسة للحرارة تتطلب موافقة مسبقة من وزارة الصحة — تُخلَّص في أقل من 4 ساعات.',
      land:'رافعة بوزن 96 طناً تتطلب تصريح نقل ثقيل وتحليل مسار بالذكاء الاصطناعي وموافقة متعددة الجهات ومرافقة شرطية.',
      multimodal:'شحن بحري وتخليص جمركي وتفريغ حاويات وتوزيع بالشاحنات على 4 نقاط في قطر.',
    },
    ucTimes: { sea:'6–9 ساعات', air:'أقل من 4 ساعات', land:'5–7 ساعات', multimodal:'12–18 ساعة' },
    steps: {
      sea:['إشعار ما قبل وصول السفينة','تقديم إقرار الاستيراد','التحقق من المستندات بالذكاء الاصطناعي','موافقات متعددة الجهات','تقييم الرسوم الجمركية والدفع','إذن البوابة والاستلام'],
      air:['رفع بوليصة الشحن والبيان الجمركي','فحص امتثال الأدوية بالذكاء الاصطناعي','الموافقة المسبقة من وزارة الصحة','وصول ومناولة محطة هيا','الإفراج السريع وإرسال سلسلة التبريد'],
      land:['طلب تصريح نقل كبير الحجم','تحليل المسار والجسور بالذكاء الاصطناعي','موافقة أشغال وشرطة الموارد','معالجة معبر أبو سمرة الحدودي','التسليم بمرافقة إلى الموقع'],
      multimodal:['حزمة الحجز والوثائق','الساق البحرية — تتبع السفينة حياً','وصول الميناء والتخليص الجمركي','تفريغ الحاويات وتسجيل المستودع','إرسال أسطول الشاحنات','التوصيل متعدد النقاط وإيصال التسليم الإلكتروني'],
    },
    depts: {
      sea:['تنبيه تلقائي','وكيل الشحن','محرك أتمت للذكاء الاصطناعي','الجمارك + هيئة الميناء','جمارك قطر','ميناء حمد'],
      air:['وكيل الشحن','محرك أتمت للذكاء الاصطناعي','وزارة الصحة العامة','محطة شحن هيا','الجمارك + اللوجستيات'],
      land:['مقدم الطلب / الوكيل','محرك أتمت للذكاء الاصطناعي','أشغال + الشرطة','هيئة الحدود','الخدمات اللوجستية + المرافقة'],
      multimodal:['الشاحن / الوكيل','بوابة المراقبة التلقائية','الجمارك + هيئة الميناء','مستودع الميناء','منسق اللوجستيات','الميدان + البوابة'],
    },
    ests: {
      sea:['5 دقائق','10 دقائق','~دقيقتان تلقائياً','2–4 ساعات','30 دقيقة','ساعة واحدة'],
      air:['5 دقائق','~3 دقائق تلقائياً','45–90 دقيقة','30 دقيقة','أقل من ساعة'],
      land:['10 دقائق','~5 دقائق تلقائياً','2–3 ساعات','1–2 ساعة','ساعتان'],
      multimodal:['15 دقيقة','متواصل','3–5 ساعات','ساعتان','ساعة واحدة','4–8 ساعات'],
    },
    kpiLabels: ['الخطوات المكتملة','مدة المسار','أتمتة الذكاء الاصطناعي','طوابير البوابة'],
    techLayers: [
      { label:'طبقة العرض', items:['تطبيق React أحادي الصفحة','متوافق مع الأجهزة المحمولة','واجهة عربية وإنجليزية','لوحات تحكم بالأدوار'] },
      { label:'طبقة ذكاء أتمت للذكاء الاصطناعي', items:['محرك معالجة اللغة الطبيعية بالعربية','استخراج المستندات OCR','محرك تقييم المخاطر','قواعد الموافقة التلقائية'] },
      { label:'مركز التكامل — واجهات برمجة الجهات الحكومية', items:['جمارك قطر (QCA)','هيئة ميناء حمد','وزارة الصحة العامة','أشغال · الداخلية · التجارة · +8'] },
      { label:'طبقة البيانات والأمن', items:['PostgreSQL + Redis Cache','خلاصة تتبع السفن AIS','مراقبة سلسلة التبريد IoT','متوافق مع نظام PDPPL · TLS 1.3'] },
    ],
    capCards: [
      { title:'بحري · جوي · بري', desc:'نقطة دخول موحدة لجميع الأنماط — ميناء حمد ومطار هيا للشحن ومعبر أبو سمرة.' },
      { title:'موافقات مدعومة بالذكاء الاصطناعي', desc:'أتمتة 60–80% من خطوات الموافقة. توجيه ذكي للجهة الصحيحة مع توصيات فورية.' },
      { title:'تصميم عربي أولاً', desc:'بوابة ثنائية اللغة كاملة مع دعم RTL ومحرك معالجة اللغة الطبيعية بالعربية.' },
      { title:'14 جهة حكومية متصلة', desc:'الجمارك وهيئة الميناء والصحة وأشغال والداخلية والتجارة و8 جهات إضافية.' },
      { title:'5 أضعاف سرعة التخليص', desc:'تقليل متوسط وقت التخليص من 18–24 ساعة إلى 3–7 ساعات.' },
      { title:'متوافق مع PDPPL', desc:'متوافق تماماً مع قانون حماية البيانات الشخصية في قطر. تشفير TLS 1.3.' },
    ],
    stackLabels: ['الواجهة الأمامية','محرك الذكاء','التكاملات','البنية التحتية'],
  },
};

// ─── Atmet AI Capabilities per use case & step ───────────────────────────────
const AI_CAPS = {
  sea: [
    { capability:'Vessel Intelligence Screening', ar:'فحص استخبارات السفينة', desc:'Real-time cross-match against port authority, Qatar Customs, and international sanctions databases.', descAr:'مطابقة فورية مع قواعد بيانات هيئة الميناء وجمارك قطر وقوائم العقوبات الدولية.', metrics:['8 databases', '< 3 seconds', '99.2% accuracy'], metricsAr:['8 قواعد بيانات','أقل من 3 ثوانٍ','دقة 99.2%'], timeSaved:'45 min', manual:'Manual vessel vetting by port officer', manualAr:'التحقق اليدوي من السفينة بمعرفة موظف الميناء' },
    { capability:'Smart Declaration Pre-fill', ar:'ملء الإقرار الذكي تلقائياً', desc:'AI reads vessel manifest and pre-populates 94% of import declaration fields eliminating manual data entry.', descAr:'يقرأ الذكاء الاصطناعي بيان السفينة ويملأ 94% من حقول إقرار الاستيراد تلقائياً.', metrics:['94% auto-filled', '847 fields', '< 60 seconds'], metricsAr:['94% مملوء تلقائياً','847 حقلاً','أقل من 60 ثانية'], timeSaved:'35 min', manual:'Manual form completion by freight forwarder', manualAr:'ملء النماذج يدوياً بمعرفة وكيل الشحن' },
    { capability:'Document OCR & Cross-Validation', ar:'استخراج المستندات ومطابقتها', desc:'AI extracts 847 fields from 5 documents using OCR + Arabic NLP, then cross-validates all values against the vessel manifest.', descAr:'يستخرج الذكاء الاصطناعي 847 حقلاً من 5 مستندات باستخدام OCR ومعالجة اللغة الطبيعية ثم يتحقق من صحة القيم.', metrics:['847 fields extracted', '96.4% match rate', '1m 42s'], metricsAr:['847 حقلاً مستخرجاً','معدل مطابقة 96.4%','1 دقيقة 42 ثانية'], timeSaved:'2 hrs', manual:'Manual document review by customs clerk', manualAr:'مراجعة المستندات يدوياً بمعرفة موظف الجمارك' },
    { capability:'Multi-Agency Routing & Green Lane AI', ar:'التوجيه متعدد الجهات وخط السير الأخضر', desc:'AI simultaneously submits to 4 agencies, recommends Green Lane based on risk score 2/10, and tracks parallel approvals in real time.', descAr:'يُرسل الذكاء الاصطناعي في آنٍ واحد إلى 4 جهات ويوصي بخط السير الأخضر بناءً على درجة مخاطر 2/10.', metrics:['4 agencies parallel', 'Risk score: 2/10', 'Green Lane assigned'], metricsAr:['4 جهات بالتوازي','درجة المخاطر: 2/10','تعيين خط السير الأخضر'], timeSaved:'3.5 hrs', manual:'Sequential manual submissions to each agency', manualAr:'إرسال يدوي متسلسل لكل جهة على حدة' },
    { capability:'Automated Duty Calculation Engine', ar:'محرك حساب الرسوم الجمركية التلقائي', desc:'AI maps HS code 7610.10.00 to the correct duty rate, applies current VAT, calculates port fees, and generates the payment record.', descAr:'يربط الذكاء الاصطناعي الرمز الجمركي 7610.10.00 بمعدل الرسوم الصحيح ويحسب ضريبة القيمة المضافة وينشئ سجل الدفع.', metrics:['Auto HS mapping', 'Instant calculation', 'Zero manual input'], metricsAr:['ربط HS تلقائي','حساب فوري','صفر إدخال يدوي'], timeSaved:'25 min', manual:'Manual tariff lookup + calculator by customs officer', manualAr:'البحث اليدوي في التعريفة الجمركية بمعرفة الموظف' },
    { capability:'Release Orchestration Engine', ar:'محرك تنسيق الإفراج', desc:'AI matches payment receipt to Customs system, auto-triggers the gate release order, and sends PIN code to consignee via SMS — no human touchpoint.', descAr:'يطابق الذكاء الاصطناعي إيصال الدفع مع نظام الجمارك ويُصدر أمر الإفراج تلقائياً ويُرسل رمز البوابة عبر الرسائل القصيرة.', metrics:['0 human touchpoints', 'Auto-triggered', 'SMS dispatch'], metricsAr:['0 تدخل بشري','إطلاق تلقائي','إرسال الرمز برسالة SMS'], timeSaved:'1.5 hrs', manual:'Manual processing by port release officer', manualAr:'معالجة يدوية بمعرفة موظف الإفراج في الميناء' },
  ],
  air: [
    { capability:'AWB Intelligence & IATA Validation', ar:'ذكاء بوليصة الشحن والتحقق من IATA', desc:'AI validates AWB 157-88492100 against IATA e-freight database, cross-checks with airline manifest, flags pharmaceutical category for fast-track routing.', descAr:'يتحقق الذكاء الاصطناعي من بوليصة الشحن مع قاعدة بيانات IATA ويُصنّف الشحنة كأدوية للتوجيه إلى المسار السريع.', metrics:['IATA validated', 'Pharma detected', '< 10 seconds'], metricsAr:['تحقق IATA','اكتُشفت الأدوية','أقل من 10 ثوانٍ'], timeSaved:'30 min', manual:'Manual AWB inspection by cargo agent', manualAr:'فحص بوليصة الشحن يدوياً بمعرفة وكيل الشحن' },
    { capability:'Pharmaceutical Regulatory AI', ar:'ذكاء اصطناعي لتنظيم الأدوية', desc:'AI simultaneously scans 14 regulatory databases — Qatar SFDA, WHO GMP, IATA DGR, CEIV — and assembles a full compliance dossier in under 3 minutes.', descAr:'يفحص الذكاء الاصطناعي في آنٍ واحد 14 قاعدة بيانات تنظيمية ويُجمّع ملف الامتثال الكامل في أقل من 3 دقائق.', metrics:['14 databases', '3 min scan', '5/6 auto-pass'], metricsAr:['14 قاعدة بيانات','3 دقائق مسح','5/6 اجتازت تلقائياً'], timeSaved:'4.5 days', manual:'Manual regulatory research + document prep (3–5 days)', manualAr:'بحث تنظيمي يدوي وإعداد مستندات (3–5 أيام)' },
    { capability:'MOPH API Auto-Application', ar:'تقديم طلب تلقائي لوزارة الصحة', desc:'AI assembles the complete MOPH pre-clearance dossier and submits it via direct API integration — no manual forms, no portal logins.', descAr:'يجمّع الذكاء الاصطناعي ملف الموافقة المسبقة الكامل لوزارة الصحة ويُرسله عبر تكامل API مباشر دون نماذج أو تسجيل دخول يدوي.', metrics:['Direct API submit', '52-min clearance', 'vs 3–5 days standard'], metricsAr:['إرسال API مباشر','تخليص بـ52 دقيقة','مقابل 3–5 أيام عادية'], timeSaved:'4 days', manual:'Manual application to MOPH, 3–5 business days', manualAr:'تقديم يدوي لوزارة الصحة، 3–5 أيام عمل' },
    { capability:'IoT Cold Chain Intelligence', ar:'ذكاء سلسلة التبريد عبر إنترنت الأشياء', desc:'Atmet AI ingests live IoT temperature sensor data from the aircraft ULD, verifies CEIV pharma compliance, and auto-triggers inspection waiver.', descAr:'يستوعب الذكاء الاصطناعي بيانات مستشعرات الحرارة الحية من حاوية الطائرة ويتحقق من الامتثال ويُلغي الفحص الجسدي تلقائياً.', metrics:['Live IoT feed', '+4.2°C verified', 'Inspection waived'], metricsAr:['بيانات IoT حية','تم التحقق من +4.2°C','تم إلغاء الفحص الجسدي'], timeSaved:'1 hr', manual:'Physical temperature log review by QCDD inspector', manualAr:'مراجعة يدوية لسجل الحرارة بمعرفة مفتش الجودة' },
    { capability:'Multi-Party Release Coordinator', ar:'منسق الإفراج متعدد الأطراف', desc:'AI coordinates between Qatar Customs, HIA Cargo, cold chain dispatcher, and consignee simultaneously — issuing release, dispatch order, and ePOD confirmation.', descAr:'ينسّق الذكاء الاصطناعي في آنٍ واحد بين الجمارك ومحطة هيا ومشغل سلسلة التبريد والمستلم — مُصدِراً الإفراج وأوامر الإرسال وتأكيد التسليم.', metrics:['4 parties synced', '< 30 min release', 'IoT delivery track'], metricsAr:['4 أطراف في آنٍ واحد','إفراج أقل من 30 دقيقة','تتبع التسليم IoT'], timeSaved:'2 hrs', manual:'Sequential calls/emails between 4 parties (2–4 hrs)', manualAr:'مكالمات وبريد إلكتروني متسلسل بين 4 أطراف' },
  ],
  land: [
    { capability:'Permit Classification Engine', ar:'محرك تصنيف التصاريح', desc:'AI reads vehicle specification sheet and instantly identifies all 3 required permit types (oversize, overweight, over-height) — eliminating guesswork by applicants.', descAr:'يقرأ الذكاء الاصطناعي كشف مواصفات المركبة ويحدد فوراً جميع أنواع التصاريح المطلوبة الـ3 دون الحاجة لمعرفة مسبقة من مقدم الطلب.', metrics:['3 permits identified', 'Instant', 'No guesswork'], metricsAr:['3 تصاريح محددة','فوري','دون تخمين'], timeSaved:'1 day', manual:'Applicant manually researches permit requirements', manualAr:'يبحث مقدم الطلب يدوياً في متطلبات التصاريح' },
    { capability:'Road Infrastructure Intelligence', ar:'ذكاء البنية التحتية للطرق', desc:'AI analyzes 847km of Qatar road network, scans 214 bridge clearances and 38 overhead utilities, and generates the optimal compliant route in under 5 minutes.', descAr:'يحلل الذكاء الاصطناعي 847 كم من شبكة الطرق ويفحص 214 جسراً و38 خدمة علوية ويُنشئ المسار الأمثل في أقل من 5 دقائق.', metrics:['847 km analyzed', '214 bridges', '< 5 min route'], metricsAr:['847 كم محللة','214 جسراً','مسار أقل من 5 دقائق'], timeSaved:'2 days', manual:'Manual site survey by Ashghal engineer (2–3 days)', manualAr:'معاينة ميدانية يدوية بمعرفة مهندس أشغال (2–3 أيام)' },
    { capability:'Multi-Authority Dossier Assembly', ar:'تجميع ملف متعدد الجهات', desc:"AI pre-populates all 3 authority application forms (Ashghal, MOI Traffic, MOCI) from a single data entry, attaches route map and infrastructure report — submitted in parallel.", descAr:'يملأ الذكاء الاصطناعي جميع نماذج الطلبات للـ3 جهات من إدخال واحد للبيانات ويرفق خريطة المسار وتقرير البنية التحتية ويُرسلها بالتوازي.', metrics:['3 forms auto-filled', 'Parallel submission', 'Zero revisions'], metricsAr:['3 نماذج مكتملة تلقائياً','إرسال متوازٍ','صفر تعديلات'], timeSaved:'1.5 days', manual:'3 separate manual applications over 2–3 days', manualAr:'3 طلبات يدوية منفصلة على مدى 2–3 أيام' },
    { capability:'Border Pre-Clearance API', ar:'واجهة برمجة التخليص المسبق للحدود', desc:'Atmet AI notifies Abu Samra border crossing 6 hours in advance via government API, transmitting permit details, vehicle specs, and escort plan — cutting border time to 38 min.', descAr:'يُخطر الذكاء الاصطناعي معبر أبو سمرة قبل 6 ساعات عبر واجهة حكومية مُرسِلاً بيانات التصريح والمركبة وخطة المرافقة.', metrics:['6hr advance notice', 'Gov API direct', '38-min crossing'], metricsAr:['إشعار مسبق بـ6 ساعات','API حكومي مباشر','عبور خلال 38 دقيقة'], timeSaved:'1.5 hrs', manual:'Physical documents presented at border (2–4 hrs)', manualAr:'تقديم مستندات ورقية عند الحدود (2–4 ساعات)' },
    { capability:'Bilingual GPS Coordination', ar:'تنسيق GPS ثنائي اللغة', desc:'AI sends Arabic and English real-time route alerts to driver, coordinates with police escort on radio frequency, and notifies site manager of ETA — all automated.', descAr:'يُرسل الذكاء الاصطناعي تنبيهات مسار فورية بالعربية والإنجليزية للسائق وينسق مع مرافقة الشرطة ويُخطر مدير الموقع بوقت الوصول تلقائياً.', metrics:['Bilingual AR+EN', 'Live GPS sync', 'Auto stakeholder alerts'], metricsAr:['ثنائي اللغة عربي+إنجليزي','تزامن GPS حي','تنبيهات تلقائية للأطراف'], timeSaved:'45 min', manual:'Manual phone coordination between driver, escort, site', manualAr:'تنسيق هاتفي يدوي بين السائق والمرافقة والموقع' },
  ],
  multimodal: [
    { capability:'Multi-Party Doc Splitter', ar:'مُجزّئ المستندات متعدد الأطراف', desc:'AI reads master B/L and automatically generates 4 house B/Ls, 4 separate commercial invoices, and consignee-specific packing lists — eliminating manual splitting.', descAr:'يقرأ الذكاء الاصطناعي بوليصة الشحن الرئيسية وينشئ تلقائياً 4 بوالص منزلية و4 فواتير تجارية منفصلة وقوائم تعبئة خاصة بكل مستلم.', metrics:['4 B/Ls generated', '4 invoices split', '< 2 min'], metricsAr:['4 بوالص منشأة','4 فواتير مقسّمة','أقل من دقيقتين'], timeSaved:'3 hrs', manual:'Manual document splitting by freight forwarder (3–4 hrs)', manualAr:'تقسيم يدوي للمستندات بمعرفة وكيل الشحن (3–4 ساعات)' },
    { capability:'AIS Vessel Intelligence & ETA Prediction', ar:'ذكاء تتبع السفن وتوقع وقت الوصول', desc:'Atmet AI ingests live AIS satellite feed, predicts ETA with ±2hr accuracy, and auto-triggers 4 pre-arrival workflows (berth, customs, consignees, trucks) simultaneously.', descAr:'يستوعب الذكاء الاصطناعي بث AIS الفضائي الحي ويتوقع وقت الوصول بدقة ±ساعتين ويُطلق 4 مسارات عمل للوصول المسبق في آنٍ واحد.', metrics:['Live AIS feed', '±2hr ETA accuracy', '4 workflows triggered'], metricsAr:['بث AIS حي','دقة وقت الوصول ±ساعتين','4 مسارات عمل مُطلَقة'], timeSaved:'6 hrs', manual:'Manual vessel tracking + separate notifications to each party', manualAr:'تتبع يدوي للسفينة وإشعارات منفصلة لكل طرف' },
    { capability:'Pre-Declaration Filing Engine', ar:'محرك تقديم التصريح المسبق', desc:'AI files advance customs declaration 10 days before arrival across all 18 containers and 4 consignees — reducing port clearance from 4–6 hrs to 32 minutes.', descAr:'يُقدّم الذكاء الاصطناعي إقرارًا جمركيًا مسبقًا قبل 10 أيام من الوصول لجميع الـ18 حاوية والـ4 مستلمين — مختصِرًا التخليص من 4–6 ساعات إلى 32 دقيقة.', metrics:['10-day advance filing', '18 containers', '32-min clearance'], metricsAr:['تقديم مسبق قبل 10 أيام','18 حاوية','تخليص في 32 دقيقة'], timeSaved:'5 hrs', manual:'Same-day customs declaration at port (4–6 hrs)', manualAr:'تصريح جمركي في يوم الوصول بالميناء (4–6 ساعات)' },
    { capability:'Warehouse Allocation & WR Engine', ar:'محرك تخصيص المستودع وإيصال الاستلام', desc:'AI allocates optimal warehouse bays per consignee, issues digital warehouse receipts for 186 pallets across 3 consignees, and triggers truck pre-positioning.', descAr:'يُخصّص الذكاء الاصطناعي أقسام المستودع المثلى لكل مستلم ويُصدر إيصالات استلام رقمية لـ186 طبلية ويُهيّئ الشاحنات للانتشار.', metrics:['Optimal bay assignment', '186 pallets allocated', 'Auto WR issued'], metricsAr:['تخصيص أمثل للأقسام','186 طبلية مخصصة','إيصالات صادرة تلقائياً'], timeSaved:'1 hr', manual:'Manual warehouse allocation by port supervisor', manualAr:'تخصيص يدوي للمستودع بمعرفة مشرف الميناء' },
    { capability:'Fleet Dispatch Optimizer', ar:'محسّن إرسال الأسطول', desc:'AI assigns optimal trucks per consignee load, calculates best dispatch sequence, and auto-notifies all 4 consignee warehouses with ETA and driver details.', descAr:'يُعيّن الذكاء الاصطناعي الشاحنات الأمثل لكل حمولة ويحسب أفضل ترتيب للإرسال ويُخطر جميع مستودعات المستلمين الأربعة تلقائياً.', metrics:['Optimal truck match', 'Route optimized', '4 consignees notified'], metricsAr:['مطابقة شاحنات مثلى','مسار محسّن','4 مستلمين مُخطَرون'], timeSaved:'1 hr', manual:'Manual truck assignment + individual consignee calls', manualAr:'تعيين شاحنات يدوي ومكالمات فردية مع المستلمين' },
    { capability:'ePOD Aggregation & Exception Engine', ar:'محرك تجميع إيصالات التسليم الإلكترونية', desc:'AI collects digital signatures from all 4 drop points, archives ePODs in real time, flags the ACE Hardware exception, and triggers follow-up workflow automatically.', descAr:'يجمع الذكاء الاصطناعي التوقيعات الرقمية من جميع نقاط التسليم الأربع ويُؤرشف الإيصالات فورياً ويُعلّم استثناء ACE ويُطلق مسار المتابعة تلقائياً.', metrics:['4 ePODs collected', 'Real-time archive', 'Exception flagged'], metricsAr:['4 إيصالات إلكترونية','أرشفة فورية','استثناء مُعلَّم'], timeSaved:'2 hrs', manual:'Paper POD collection + manual filing (half day)', manualAr:'جمع إيصالات ورقية وأرشفة يدوية (نصف يوم)' },
  ],
};

// ─── Shared Components ─────────────────────────────────────────────────────────
const statusConfig = {
  ok:   { Icon: CheckCircle,  color: C.green,   bg: C.greenLight,   border: C.greenBorder  },
  warn: { Icon: AlertTriangle,color: C.amber,   bg: C.amberLight,   border: C.amberBorder  },
  error:{ Icon: XCircle,      color: C.red,     bg: C.redLight,     border: C.redBorder    },
  wait: { Icon: Clock,        color: C.muted,   bg: C.surfaceAlt,   border: C.border       },
  info: { Icon: Info,         color: C.primary, bg: C.primaryLight, border: C.primaryBorder},
};

const InfoGrid = ({ items, cols = 2 }) => (
  <div style={{ display:'grid', gridTemplateColumns:`repeat(${cols},1fr)`, gap:8 }}>
    {items.map((item, i) => (
      <div key={i} style={{ padding:'9px 12px', background:C.surfaceAlt, borderRadius:8, border:`1px solid ${C.border}` }}>
        <div style={{ fontSize:10, color:C.muted, marginBottom:3, textTransform:'uppercase', letterSpacing:0.3, fontFamily:font.mono }}>{item.label}</div>
        <div style={{ fontSize:13, fontWeight:600, color:item.color||C.text }}>{item.val}</div>
        {item.sub && <div style={{ fontSize:10, color:C.mutedLight, marginTop:2 }}>{item.sub}</div>}
      </div>
    ))}
  </div>
);

const CheckRow = ({ status, label, note, badge }) => {
  const s = statusConfig[status] || statusConfig.wait;
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 12px', background:C.surface, borderRadius:8, border:`1px solid ${C.border}`, marginBottom:6, boxShadow:C.shadow }}>
      <s.Icon size={15} color={s.color} style={{ flexShrink:0 }}/>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:12, fontWeight:600, color:C.text }}>{label}</div>
        {note && <div style={{ fontSize:10, color:C.muted, marginTop:1 }}>{note}</div>}
      </div>
      {badge && <span style={{ padding:'2px 8px', borderRadius:20, fontSize:10, fontWeight:700, background:s.bg, color:s.color, border:`1px solid ${s.border}`, whiteSpace:'nowrap' }}>{badge}</span>}
    </div>
  );
};

const AIBox = ({ items, lang }) => {
  const s = S[lang];
  return (
    <div style={{ padding:'12px 14px', background:C.tealLight, border:`1px solid ${C.tealBorder}`, borderRadius:10, borderLeft:`3px solid ${C.teal}` }}>
      <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8 }}>
        <Bot size={13} color={C.teal}/>
        <span style={{ fontSize:10, color:C.teal, fontWeight:700, letterSpacing:0.8, textTransform:'uppercase', fontFamily:font.mono }}>{s.aiPanel.title}</span>
      </div>
      {items.map((item, i) => <div key={i} style={{ fontSize:12, color:i===0?C.text:C.muted, lineHeight:1.65, marginBottom:2 }}>{item}</div>)}
    </div>
  );
};

const AppCard = ({ agency, status, time, rec, lang }) => {
  const s = { Approved:{c:C.green,bg:C.greenLight,b:C.greenBorder}, Pending:{c:C.amber,bg:C.amberLight,b:C.amberBorder}, 'In Review':{c:C.primary,bg:C.primaryLight,b:C.primaryBorder}, Cleared:{c:C.green,bg:C.greenLight,b:C.greenBorder} }[status]||{c:C.amber,bg:C.amberLight,b:C.amberBorder};
  const label = S[lang].status[status] || status;
  return (
    <div style={{ padding:'12px 14px', background:C.surface, borderRadius:10, border:`1px solid ${C.border}`, borderLeft:`3px solid ${s.c}`, boxShadow:C.shadow }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6, gap:8 }}>
        <div style={{ fontSize:13, fontWeight:700, color:C.text }}>{agency}</div>
        <span style={{ padding:'3px 9px', borderRadius:20, fontSize:10, fontWeight:700, background:s.bg, color:s.c, border:`1px solid ${s.b}`, whiteSpace:'nowrap' }}>{label}</span>
      </div>
      <div style={{ fontSize:11, color:C.muted, marginBottom:rec?8:0, fontFamily:font.mono }}>{time}</div>
      {rec && <div style={{ display:'flex', gap:6, alignItems:'flex-start', padding:'6px 10px', background:C.tealLight, borderRadius:6 }}>
        <Bot size={12} color={C.teal} style={{ marginTop:1, flexShrink:0 }}/>
        <div style={{ fontSize:11, color:C.teal, lineHeight:1.5 }}>{rec}</div>
      </div>}
    </div>
  );
};

const SummaryKPIs = ({ items }) => (
  <div style={{ display:'grid', gridTemplateColumns:`repeat(${items.length},1fr)`, gap:8 }}>
    {items.map((s, i) => (
      <div key={i} style={{ padding:'14px 10px', background:C.surface, borderRadius:10, border:`1px solid ${C.border}`, textAlign:'center', boxShadow:C.shadow }}>
        <div style={{ display:'flex', justifyContent:'center', marginBottom:6 }}>
          <div style={{ width:32, height:32, borderRadius:'50%', background:`${s.color}18`, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <s.Icon size={16} color={s.color}/>
          </div>
        </div>
        <div style={{ fontSize:20, fontWeight:800, color:s.color, fontFamily:font.display }}>{s.val}</div>
        <div style={{ fontSize:10, color:C.muted, marginTop:3 }}>{s.label}</div>
      </div>
    ))}
  </div>
);

// ─── Atmet AI Capability Panel ─────────────────────────────────────────────────
const AtmetAIPanel = ({ ucId, stepIdx, lang }) => {
  const caps = AI_CAPS[ucId];
  if (!caps || !caps[stepIdx]) return null;
  const cap = caps[stepIdx];
  const s = S[lang];
  const isAr = lang === 'ar';
  const capName = isAr ? cap.ar : cap.capability;
  const capDesc = isAr ? cap.descAr : cap.desc;
  const metrics = isAr ? cap.metricsAr : cap.metrics;
  const manualText = isAr ? cap.manualAr : cap.manual;

  return (
    <div style={{ marginBottom:14, borderRadius:12, overflow:'hidden', border:`1px solid ${C.tealBorder}`, boxShadow:C.shadowMd }}>
      {/* Header bar */}
      <div style={{ padding:'10px 16px', background:`linear-gradient(135deg, ${C.teal}, #0A7A6E)`, display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:32, height:32, borderRadius:8, background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <Bot size={17} color="#fff"/>
          </div>
          <div>
            <div style={{ fontSize:9, color:'rgba(255,255,255,0.7)', letterSpacing:1.5, textTransform:'uppercase', fontFamily:font.mono }}>{s.aiPanel.title}</div>
            <div style={{ fontSize:14, fontWeight:700, color:'#fff', fontFamily:font.display }}>{capName}</div>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:6, padding:'4px 10px', background:'rgba(255,255,255,0.15)', borderRadius:20 }}>
          <span style={{ width:6, height:6, borderRadius:'50%', background:'#4ADE80', display:'block', animation:'pulse 2s infinite' }}/>
          <span style={{ fontSize:10, color:'#fff', fontWeight:700, fontFamily:font.mono }}>{s.aiPanel.active}</span>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding:'14px 16px', background:C.tealLight }}>
        <div style={{ fontSize:12, color:C.textMid, lineHeight:1.7, marginBottom:14 }}>{capDesc}</div>

        {/* Metrics row */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:12 }}>
          {metrics.map((m, i) => (
            <div key={i} style={{ padding:'8px 10px', background:C.surface, borderRadius:8, border:`1px solid ${C.tealBorder}`, textAlign:'center' }}>
              <div style={{ fontSize:13, fontWeight:800, color:C.teal, fontFamily:font.display }}>{m}</div>
            </div>
          ))}
        </div>

        {/* vs Manual + Time saved */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:10, alignItems:'center' }}>
          <div style={{ padding:'8px 12px', background:C.surface, borderRadius:8, border:`1px solid ${C.border}` }}>
            <div style={{ fontSize:9, color:C.muted, textTransform:'uppercase', letterSpacing:0.5, marginBottom:3, fontFamily:font.mono }}>{s.aiPanel.vs}</div>
            <div style={{ fontSize:11, color:C.textMid }}>{manualText}</div>
          </div>
          <div style={{ padding:'10px 16px', background:`linear-gradient(135deg, ${C.green}, #0F6A30)`, borderRadius:8, textAlign:'center', flexShrink:0 }}>
            <div style={{ fontSize:9, color:'rgba(255,255,255,0.75)', textTransform:'uppercase', letterSpacing:0.5, fontFamily:font.mono }}>{s.aiPanel.timeSaved}</div>
            <div style={{ fontSize:18, fontWeight:800, color:'#fff', fontFamily:font.display }}>{cap.timeSaved}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Step Content (unchanged from v3, abbreviated references) ─────────────────
const renderContent = (ucId, stepIdx, lang) => {
  const isAr = lang === 'ar';
  const s = S[lang];

  const AppC = (props) => <AppCard {...props} lang={lang}/>;
  const AIB = (props) => <AIBox {...props} lang={lang}/>;

  if (ucId === 'sea') {
    if (stepIdx === 0) return (<div style={{display:'flex',flexDirection:'column',gap:14}}>
      <div style={{padding:16,background:C.surface,borderRadius:12,border:`1px solid ${C.border}`,boxShadow:C.shadow}}>
        <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:14}}>
          <div style={{width:52,height:52,borderRadius:12,background:C.primaryLight,border:`1px solid ${C.primaryBorder}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><Ship size={26} color={C.primary}/></div>
          <div><div style={{fontWeight:800,fontSize:16,color:C.text,fontFamily:font.display}}>MV HAMBURG EXPRESS</div><div style={{fontSize:11,color:C.muted,marginTop:2}}>IMO 9450648 · Container Vessel · Flag: Germany</div></div>
          <div style={{marginLeft:'auto',padding:'6px 12px',background:C.tealLight,border:`1px solid ${C.tealBorder}`,borderRadius:8,textAlign:'center'}}><div style={{fontSize:9,color:C.muted,fontFamily:font.mono}}>STATUS</div><div style={{fontSize:12,fontWeight:700,color:C.teal}}>EN ROUTE</div></div>
        </div>
        <InfoGrid cols={3} items={[{label:'ETA — Hamad Port',val:'Apr 05, 2026 · 14:30',color:C.amber},{label:'Terminal',val:'CT2 — Berth 07'},{label:'Containers',val:'32 units · 850 TEU'},{label:'HS Code',val:'7610.10.00 – 9403.90'},{label:'Voyage',val:'HHE-DOH-2026-041'},{label:'Declared Value',val:'USD 2,340,000'}]}/>
      </div>
      <CheckRow status="ok" label="Pre-Arrival Notification submitted to Hamad Port Authority" badge="Auto-sent"/>
      <CheckRow status="ok" label="Qatar Customs notified — advance cargo information received" badge="Received"/>
      <CheckRow status="ok" label="Freight forwarder Al Mana Logistics assigned" badge="Confirmed"/>
      <CheckRow status="warn" label="3 reefer containers detected — cold storage berth requested" note="Temperature-sensitive cargo flagged automatically" badge="Note"/>
      <AIB items={['Vessel profile verified against Hamad Port Authority database — no flags.','HS code screening: Low risk. No restricted or controlled goods detected.','Recommendation: Proceed to import declaration. Auto-assign to Green Lane.']}/>
    </div>);

    if (stepIdx === 1) return (<div style={{display:'flex',flexDirection:'column',gap:14}}>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <div style={{padding:14,background:C.surface,borderRadius:10,border:`1px solid ${C.border}`,boxShadow:C.shadow}}><div style={{fontSize:10,color:C.muted,marginBottom:8,textTransform:'uppercase',letterSpacing:0.5,fontFamily:font.mono}}>Shipper</div><InfoGrid cols={2} items={[{label:'Company',val:'Schüco International KG'},{label:'Country',val:'Germany'},{label:'City',val:'Hamburg'},{label:'Tax ID',val:'DE112233445'}]}/></div>
        <div style={{padding:14,background:C.surface,borderRadius:10,border:`1px solid ${C.border}`,boxShadow:C.shadow}}><div style={{fontSize:10,color:C.muted,marginBottom:8,textTransform:'uppercase',letterSpacing:0.5,fontFamily:font.mono}}>Consignee</div><InfoGrid cols={2} items={[{label:'Company',val:'Al Mana Real Estate LLC'},{label:'Country',val:'Qatar'},{label:'City',val:'Doha'},{label:'CR No.',val:'90012334'}]}/></div>
      </div>
      <InfoGrid cols={3} items={[{label:'Description',val:'Aluminum Facade Systems'},{label:'HS Code',val:'7610.10.00',color:C.amber},{label:'Gross Weight',val:'480 MT'},{label:'Volume',val:'1,840 CBM'},{label:'Incoterms',val:'CIF Hamad Port'},{label:'Declared Value',val:'USD 2,340,000'}]}/>
      <CheckRow status="ok" label="Bill of Lading — BL/HHE-2026-18821" badge="Uploaded"/>
      <CheckRow status="ok" label="Commercial Invoice — INV-SCH-2026-441" badge="Uploaded"/>
      <CheckRow status="ok" label="Certificate of Origin — ICC Germany" badge="Uploaded"/>
      <CheckRow status="warn" label="Insurance Certificate — awaiting shipper upload" badge="Pending"/>
      <AIB items={['94% of declaration pre-filled from vessel manifest — minimal manual input.','Insurance Certificate missing. Portal auto-notified shipper via email + SMS.','Insurance can be appended within 24 hrs without delaying clearance.']}/>
    </div>);

    if (stepIdx === 2) return (<div style={{display:'flex',flexDirection:'column',gap:14}}>
      <div style={{padding:'12px 16px',background:C.tealLight,border:`1px solid ${C.tealBorder}`,borderRadius:10,display:'flex',alignItems:'center',gap:12}}>
        <div style={{width:44,height:44,borderRadius:10,background:C.teal,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><Bot size={22} color="#fff"/></div>
        <div style={{flex:1}}><div style={{fontWeight:700,fontSize:14,color:C.text}}>Atmet AI — Document Analysis Complete</div><div style={{fontSize:11,color:C.muted,marginTop:2}}>5 documents · 847 fields extracted · 1m 42s</div></div>
        <div style={{padding:'6px 14px',background:C.greenLight,border:`1px solid ${C.greenBorder}`,borderRadius:8,textAlign:'center'}}><div style={{fontSize:11,fontWeight:700,color:C.green}}>PASS</div><div style={{fontSize:10,color:C.muted,fontFamily:font.mono}}>96.4%</div></div>
      </div>
      {[{name:'Bill of Lading',fields:24,st:'ok',conf:'99.1%',note:'All fields verified against vessel manifest'},{name:'Commercial Invoice',fields:18,st:'ok',conf:'97.8%',note:'Value and HS code cross-checked'},{name:'Packing List',fields:32,st:'ok',conf:'98.4%',note:'Container numbers matched'},{name:'Certificate of Origin',fields:12,st:'warn',conf:'91.2%',note:'Stamp partially obscured — manual confirm requested'},{name:'Insurance Certificate',fields:0,st:'wait',conf:'Pending',note:'Awaiting upload from shipper'}].map((d,i)=>{const sc=statusConfig[d.st]||statusConfig.wait;return(<div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 14px',background:C.surface,borderRadius:8,border:`1px solid ${C.border}`,boxShadow:C.shadow}}><sc.Icon size={15} color={sc.color} style={{flexShrink:0}}/><div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:C.text}}>{d.name}</div><div style={{fontSize:10,color:C.muted}}>{d.note}</div></div><div style={{textAlign:'right'}}><div style={{fontSize:12,fontWeight:700,color:d.st==='ok'?C.green:d.st==='warn'?C.amber:C.muted}}>{d.conf}</div><div style={{fontSize:10,color:C.muted,fontFamily:font.mono}}>{d.fields>0?`${d.fields} fields`:'—'}</div></div></div>);})}
      <InfoGrid cols={2} items={[{label:'Value vs Manifest',val:'Match — Verified',color:C.green},{label:'HS Code Risk',val:'Low — 2 / 10',color:C.green},{label:'Restricted Goods',val:'None Detected',color:C.green},{label:'Customs Lane',val:'Green Lane — Auto-clear',color:C.teal}]}/>
      <AIB items={['4 of 5 documents verified. Certificate of Origin flagged for human review (low risk).','Assigned to Green Lane — no physical inspection required.','Forwarding to Qatar Customs and Port Authority for parallel approval.']}/>
    </div>);

    if (stepIdx === 3) return (<div style={{display:'flex',flexDirection:'column',gap:12}}>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        <AppC agency="Qatar Customs Authority" status="Approved" time="Auto-approved · 18 min" rec="Green Lane confirmed. No physical inspection required."/>
        <AppC agency="Hamad Port Authority" status="Approved" time="Berth CT2-07 confirmed · Apr 04 23:00" rec="Slot allocated. Crane gang assigned. Reefer berth for 3 containers."/>
        <AppC agency="Ministry of Commerce & Industry" status="Approved" time="Cleared · 34 min" rec="Conformity certificate accepted. No restrictions."/>
        <AppC agency="Qatar Standards Authority (QGOSM)" status="In Review" time="Pending · est. 2 hrs" rec="Random sample inspection for 1 container — non-blocking."/>
      </div>
      <div style={{padding:14,background:C.surface,borderRadius:10,border:`1px solid ${C.border}`,boxShadow:C.shadow}}>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}><div style={{fontSize:13,fontWeight:600,color:C.text}}>Overall Approval Progress</div><div style={{fontSize:12,color:C.amber,fontWeight:700}}>3 of 4 Approved</div></div>
        <div style={{height:8,background:C.surfaceAlt,borderRadius:4,overflow:'hidden',border:`1px solid ${C.border}`}}><div style={{height:'100%',width:'75%',background:`linear-gradient(90deg,${C.teal},${C.green})`,borderRadius:4}}/></div>
        <div style={{fontSize:11,color:C.muted,marginTop:8}}>QGOSM inspection is non-blocking — cargo can be released on bond.</div>
      </div>
      <AIB items={['3 of 4 agencies approved. QGOSM sample inspection pending — non-blocking.','Recommendation: Initiate duty calculation now. Release on provisional bond.','Estimated time to full clearance: approximately 1.5 hours.']}/>
    </div>);

    if (stepIdx === 4) return (<div style={{display:'flex',flexDirection:'column',gap:14}}>
      <div style={{padding:16,background:C.surface,borderRadius:10,border:`1px solid ${C.border}`,boxShadow:C.shadow}}>
        <div style={{fontSize:13,fontWeight:700,marginBottom:12,color:C.text}}>Duty & Tax Assessment — QCA-2026-18821</div>
        {[{desc:'CIF Declared Value',val:'USD 2,340,000',sub:'QAR 8,517,800',hl:false},{desc:'Customs Duty (5% — HS 7610.10.00)',val:'USD 117,000',sub:'QAR 425,890',hl:false},{desc:'VAT (10%)',val:'USD 234,000',sub:'QAR 851,780',hl:false},{desc:'Port Handling Fee',val:'USD 12,400',sub:'QAR 45,140',hl:false},{desc:'Total Payable',val:'USD 363,400',sub:'QAR 1,322,810',hl:true}].map((row,i)=>(
          <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'9px 12px',background:row.hl?C.amberLight:C.surfaceAlt,borderRadius:8,marginBottom:5,border:`1px solid ${row.hl?C.amberBorder:C.border}`}}>
            <div style={{fontSize:12,color:row.hl?C.amber:C.textMid,fontWeight:row.hl?700:400}}>{row.desc}</div>
            <div style={{textAlign:'right'}}><div style={{fontSize:13,fontWeight:700,color:row.hl?C.amber:C.text}}>{row.val}</div><div style={{fontSize:10,color:C.muted,fontFamily:font.mono}}>{row.sub}</div></div>
          </div>
        ))}
      </div>
      <div style={{padding:14,background:C.greenLight,border:`1px solid ${C.greenBorder}`,borderRadius:10}}>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}><CheckCircle size={20} color={C.green}/><div><div style={{fontWeight:700,fontSize:14,color:C.green}}>Payment Confirmed</div><div style={{fontSize:11,color:C.muted,fontFamily:font.mono}}>QCA-PAY-2026-18821 · Apr 04, 2026 · 16:42</div></div></div>
        <InfoGrid cols={2} items={[{label:'Method',val:'QPAY — Online Banking'},{label:'Receipt',val:'RCP-2026-88441'},{label:'Paid By',val:'Al Mana Logistics WLL'},{label:'Customs Release',val:'Triggered Automatically',color:C.green}]}/>
      </div>
      <AIB items={['Duty auto-calculated from HS code + CIF value. Zero manual input required.','Payment matched against Customs system — gate release order triggered.','Gate Release Order being generated for Hamad Port CT2.']}/>
    </div>);

    if (stepIdx === 5) return (<div style={{display:'flex',flexDirection:'column',gap:14}}>
      <div style={{padding:18,background:C.surface,border:`2px solid ${C.amberBorder}`,borderRadius:12,boxShadow:C.shadowMd}}>
        <div style={{fontSize:10,color:C.amber,letterSpacing:2,textTransform:'uppercase',marginBottom:8,fontFamily:font.mono}}>Official Gate Release Order</div>
        <div style={{display:'flex',justifyContent:'space-between',flexWrap:'wrap',gap:10,marginBottom:12}}><div><div style={{fontSize:22,fontWeight:800,color:C.text,fontFamily:font.display}}>GRO-QLP-2025-8821</div><div style={{fontSize:11,color:C.muted,fontFamily:font.mono}}>Issued: Apr 04, 2026 · 17:15 · Valid 72 hrs</div></div><span style={{padding:'6px 16px',background:C.greenLight,border:`1px solid ${C.greenBorder}`,borderRadius:8,fontWeight:700,fontSize:13,color:C.green}}>CLEARED</span></div>
        <InfoGrid cols={3} items={[{label:'Terminal',val:'Hamad Port CT2, Berth 07'},{label:'Release Type',val:'Full Container Release'},{label:'Containers',val:'32 × 20/40 ft'},{label:'Transport Co.',val:'Qatar Express Lines LLC'},{label:'Gate PIN',val:'8841-XXXX (SMS sent)',color:C.amber},{label:'Deadline',val:'Apr 07, 2026 · 17:15'}]}/>
      </div>
      <SummaryKPIs items={[{label:'Total Time',val:'7h 14m',Icon:Clock,color:C.teal},{label:'AI Automated',val:'74%',Icon:Bot,color:C.teal},{label:'Agencies',val:'4 cleared',Icon:Building2,color:C.amber},{label:'Outcome',val:'Full Release',Icon:CheckCircle,color:C.green}]}/>
      <AIB items={['Shipment QLP-2025-8821 fully cleared in 7 hours 14 minutes.','74% of steps automated by Atmet AI — zero manual customs touchpoints.','Manual baseline: 18–24 hrs. Portal efficiency gain: ~11 hours saved.']}/>
    </div>);
  }

  if (ucId === 'air') {
    if (stepIdx === 0) return (<div style={{display:'flex',flexDirection:'column',gap:14}}>
      <div style={{padding:16,background:C.surface,borderRadius:12,border:`1px solid ${C.border}`,boxShadow:C.shadow}}>
        <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:14}}><div style={{width:52,height:52,borderRadius:12,background:C.tealLight,border:`1px solid ${C.tealBorder}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><Plane size={26} color={C.teal}/></div><div><div style={{fontWeight:800,fontSize:16,color:C.text,fontFamily:font.display}}>QR CARGO 7742</div><div style={{fontSize:11,color:C.muted,marginTop:2}}>AWB 157-88492100 · Qatar Airways Cargo · LHR → DOH</div></div><div style={{marginLeft:'auto',padding:'6px 12px',background:C.orangeLight,border:`1px solid ${C.amberBorder}`,borderRadius:8,textAlign:'center'}}><div style={{fontSize:9,color:C.muted,fontFamily:font.mono}}>PRIORITY</div><div style={{fontSize:12,fontWeight:700,color:C.orange}}>URGENT</div></div></div>
        <InfoGrid cols={3} items={[{label:'Flight',val:'QR 3742 · Apr 04, 2026'},{label:'ETA — HIA',val:'Apr 05, 2026 · 04:15',color:C.amber},{label:'Commodity',val:'Pharmaceutical Products'},{label:'Weight / Pieces',val:'840 kg · 6 pallets'},{label:'Temperature',val:'+2°C to +8°C',color:C.teal},{label:'Shipper',val:'AstraZeneca UK Ltd'}]}/>
      </div>
      <CheckRow status="ok" label="Air Waybill (AWB) uploaded and validated" badge="AWB Verified"/>
      <CheckRow status="ok" label="IATA e-freight manifest received from origin" badge="Received"/>
      <CheckRow status="ok" label="Cold chain requirements flagged — +2°C to +8°C" badge="Cold Storage"/>
      <CheckRow status="warn" label="Pharmaceutical import — MOPH pre-clearance required" note="Auto-routing to pharma fast-track queue" badge="Required"/>
      <CheckRow status="ok" label="HIA Cargo cold storage slot pre-confirmed" badge="Confirmed"/>
      <AIB items={['AWB matched against IATA manifest — 100% field alignment.','Pharmaceutical category auto-detected. Routing to MOPH fast-track queue.','Parallel compliance screening initiated while flight is en route.']}/>
    </div>);

    if (stepIdx === 1) return (<div style={{display:'flex',flexDirection:'column',gap:12}}>
      <div style={{padding:'12px 16px',background:C.tealLight,border:`1px solid ${C.tealBorder}`,borderRadius:10}}><div style={{fontWeight:700,fontSize:14,color:C.text,marginBottom:2}}>AI Pharma Compliance Engine — Scanning 14 Databases</div><div style={{fontSize:11,color:C.muted}}>Qatar SFDA · WHO GMP · IATA DGR · Cold Chain CEIV · MOPH Registry</div></div>
      {[{check:'SFDA Registration',result:'Registered',st:'ok',detail:'AZ-VAX approved — Reg #QSF-2024-8812'},{check:'IATA DGR Classification',result:'Non-DG',st:'ok',detail:'Not classified as dangerous goods'},{check:'Cold Chain CEIV Compliance',result:'Compliant',st:'ok',detail:'Certified handler at origin and destination'},{check:'Shelf Life Check',result:'Pass',st:'ok',detail:'Expiry Dec 2027 — min 12 months maintained'},{check:'MOPH Import Permit',result:'Auto-Applied',st:'warn',detail:'Submitted via portal API — confirmation pending'},{check:'Narcotic / Controlled',result:'Negative',st:'ok',detail:'No controlled substance classification'}].map((c,i)=>{const sc=statusConfig[c.st];return(<div key={i} style={{display:'flex',gap:12,padding:'10px 14px',background:C.surface,borderRadius:8,border:`1px solid ${C.border}`,boxShadow:C.shadow}}><sc.Icon size={15} color={sc.color} style={{flexShrink:0,marginTop:1}}/><div style={{flex:1}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:2,gap:8}}><span style={{fontSize:12,fontWeight:600,color:C.text}}>{c.check}</span><span style={{fontSize:12,fontWeight:700,color:sc.color,whiteSpace:'nowrap'}}>{c.result}</span></div><div style={{fontSize:10,color:C.muted}}>{c.detail}</div></div></div>);})}
      <AIB items={['5 of 6 checks passed automatically. MOPH application auto-submitted via API.','No DGR restrictions — eligible for express clearance lane.','Full compliance dossier forwarded to MOPH for permit confirmation.']}/>
    </div>);

    if (stepIdx === 2) return (<div style={{display:'flex',flexDirection:'column',gap:14}}>
      <div style={{padding:14,background:C.surface,borderRadius:10,border:`1px solid ${C.border}`,borderLeft:`3px solid ${C.orange}`,boxShadow:C.shadow}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}><div style={{fontWeight:700,fontSize:14,color:C.text}}>Ministry of Public Health — Qatar</div><span style={{padding:'4px 12px',background:C.greenLight,border:`1px solid ${C.greenBorder}`,borderRadius:8,fontWeight:700,fontSize:12,color:C.green}}>PRE-CLEARED</span></div>
        <InfoGrid cols={2} items={[{label:'Permit No.',val:'MOPH-IMP-2026-00441'},{label:'Issued',val:'Apr 04, 2026 · 22:30'},{label:'Validity',val:'30 days from arrival'},{label:'Processing Time',val:'52 minutes (fast-track)',color:C.green}]}/>
      </div>
      <CheckRow status="ok" label="Cold chain maintained throughout — temp log required on delivery" badge="Mandatory"/>
      <CheckRow status="ok" label="Licensed pharmaceutical distributor collection only" badge="Mandatory"/>
      <CheckRow status="ok" label="SFDA post-import report within 30 days" badge="Required"/>
      <CheckRow status="info" label="Random sample testing — 5% probability (not triggered)" badge="Monitoring"/>
      <InfoGrid cols={2} items={[{label:'Standard MOPH Processing',val:'3–5 business days',color:C.red},{label:'Portal AI Fast-Track',val:'52 minutes',color:C.green},{label:'Time Saved',val:'Approx. 4.5 days',color:C.teal},{label:'Dossier Preparation',val:'100% automated by AI',color:C.teal}]}/>
      <AIB items={['MOPH pre-clearance in 52 minutes via AI-assisted fast-track.','Compliance dossier auto-assembled and submitted — zero manual preparation.','Permit forwarded to HIA Cargo for terminal handling.']}/>
    </div>);

    if (stepIdx === 3) return (<div style={{display:'flex',flexDirection:'column',gap:14}}>
      <div style={{padding:14,background:C.surface,borderRadius:10,border:`1px solid ${C.border}`,boxShadow:C.shadow}}>
        <div style={{display:'flex',gap:12,alignItems:'center',marginBottom:12}}><div style={{width:44,height:44,borderRadius:10,background:C.primaryLight,border:`1px solid ${C.primaryBorder}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><Warehouse size={22} color={C.primary}/></div><div><div style={{fontWeight:700,fontSize:14,color:C.text}}>HIA Cargo Terminal — Cold Zone 3</div><div style={{fontSize:11,color:C.muted}}>Apr 05, 2026 · 04:15 · QR 3742 has landed</div></div><span style={{marginLeft:'auto',padding:'4px 12px',background:C.greenLight,border:`1px solid ${C.greenBorder}`,borderRadius:8,fontWeight:700,fontSize:12,color:C.green}}>ARRIVED</span></div>
        <InfoGrid cols={2} items={[{label:'Temperature on Arrival',val:'+4.2°C — Within range',color:C.teal,sub:'+2°C to +8°C required'},{label:'Pallets Received',val:'6 of 6 — All accounted',color:C.green},{label:'Physical Inspection',val:'Waived (MOPH permit)',color:C.teal},{label:'Storage Assigned',val:'Cold Room C3-14 · 24/7 monitored'}]}/>
      </div>
      <CheckRow status="ok" label="All 6 pallets offloaded intact from aircraft ULD" badge="Confirmed"/>
      <CheckRow status="ok" label="Temperature data logger — compliant throughout flight" badge="Compliant"/>
      <CheckRow status="ok" label="MOPH permit accepted by HIA customs officer" badge="Accepted"/>
      <CheckRow status="ok" label="Cold storage confirmed — 4-hour buffer before pickup" badge="Ready"/>
      <CheckRow status="warn" label="Consignee Aster DM Healthcare notified — pickup 09:00 Apr 05" badge="Notified"/>
      <AIB items={['IoT sensors confirm cold chain integrity — 100% compliant.','Physical inspection waived — MOPH fast-track pre-clearance applied.','Generating Express Release Order. Clearance by 06:30.']}/>
    </div>);

    if (stepIdx === 4) return (<div style={{display:'flex',flexDirection:'column',gap:14}}>
      <div style={{padding:18,background:C.surface,border:`2px solid ${C.tealBorder}`,borderRadius:12,boxShadow:C.shadowMd}}>
        <div style={{fontSize:10,color:C.teal,letterSpacing:2,textTransform:'uppercase',marginBottom:8,fontFamily:font.mono}}>Express Release Order — Cold Chain Pharma</div>
        <div style={{display:'flex',justifyContent:'space-between',flexWrap:'wrap',gap:8,marginBottom:12}}><div><div style={{fontSize:22,fontWeight:800,color:C.text,fontFamily:font.display}}>ERO-QAC-2026-7742</div><div style={{fontSize:11,color:C.muted,fontFamily:font.mono}}>Apr 05, 2026 · 06:22 · HIA Cargo Authority</div></div><span style={{padding:'6px 14px',background:C.greenLight,border:`1px solid ${C.greenBorder}`,borderRadius:8,fontWeight:700,color:C.green}}>CLEARED</span></div>
        <InfoGrid cols={3} items={[{label:'Vehicle',val:'Reefer Truck MQ 48812'},{label:'Dispatcher',val:'Qatar Cold Chain WLL'},{label:'Destination',val:'Aster DM Hub, Al Wakra'},{label:'ETA',val:'Apr 05 · 09:45',color:C.amber},{label:'Temp Monitor',val:'Live IoT via Portal',color:C.teal},{label:'Consignee',val:'SMS + Email sent',color:C.green}]}/>
      </div>
      <SummaryKPIs items={[{label:'Total Time',val:'3h 52m',Icon:Clock,color:C.teal},{label:'vs. Standard',val:'4.8× faster',Icon:Zap,color:C.amber},{label:'AI Checks',val:'14 passed',Icon:Bot,color:C.teal},{label:'Cold Chain',val:'100% intact',Icon:Thermometer,color:C.primary}]}/>
      <AIB items={['Cleared in 3 hours 52 minutes — 4.8× faster than standard processing.','Cold chain integrity maintained end-to-end. IoT monitoring active through delivery.','London to Doha delivery hub: full regulatory compliance, zero exceptions.']}/>
    </div>);
  }

  if (ucId === 'land') {
    if (stepIdx === 0) return (<div style={{display:'flex',flexDirection:'column',gap:14}}>
      <div style={{padding:16,background:C.surface,borderRadius:12,border:`1px solid ${C.border}`,boxShadow:C.shadow}}>
        <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:14}}><div style={{width:52,height:52,borderRadius:12,background:C.amberLight,border:`1px solid ${C.amberBorder}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><Truck size={26} color={C.amber}/></div><div><div style={{fontWeight:800,fontSize:15,color:C.text,fontFamily:font.display}}>LIEBHERR LTM 1300-6.2 MOBILE CRANE</div><div style={{fontSize:11,color:C.muted,marginTop:2}}>RAKIA Free Zone, UAE → Doha Industrial Area</div></div></div>
        <InfoGrid cols={3} items={[{label:'Equipment Type',val:'All-Terrain Mobile Crane'},{label:'Total Length',val:'21.4 metres',color:C.orange},{label:'Width',val:'3.8 metres',color:C.orange},{label:'Height',val:'4.2 metres',color:C.orange},{label:'GVW',val:'96 tonnes',color:C.red},{label:'Consignee',val:'Arabian Contracting Co.'}]}/>
      </div>
      <CheckRow status="warn" label="Width > 3.5m — Special Transport Permit required" badge="Required"/>
      <CheckRow status="warn" label="Overweight > 48 tonnes — Ashghal road load assessment needed" badge="Required"/>
      <CheckRow status="warn" label="Height > 4.0m — bridge and overhead clearance analysis required" badge="Required"/>
      <CheckRow status="ok" label="Application submitted via portal — Ref: LND-2026-4102" badge="Submitted"/>
      <CheckRow status="ok" label="Equipment specs, insurance, transport plan — all uploaded" badge="Uploaded"/>
      <AIB items={['Equipment triggers 3 permit categories: oversize, overweight, over-height.','Initiating AI route analysis: Abu Samra to Doha Industrial Area.','Parallel permit application submitted to Ashghal and MOI Traffic Department.']}/>
    </div>);

    if (stepIdx === 1) return (<div style={{display:'flex',flexDirection:'column',gap:14}}>
      <div style={{padding:'12px 16px',background:C.tealLight,border:`1px solid ${C.tealBorder}`,borderRadius:10}}><div style={{fontWeight:700,fontSize:14,color:C.text,marginBottom:2}}>AI Route and Infrastructure Analysis</div><div style={{fontSize:11,color:C.muted}}>847 km road network · 214 bridges · 38 overhead utilities · 12 restricted zones</div></div>
      <div style={{padding:14,background:C.surface,borderRadius:10,border:`1px solid ${C.border}`,boxShadow:C.shadow}}>
        <div style={{fontSize:12,fontWeight:700,color:C.amber,marginBottom:12}}>Recommended Route: Route A — AI Optimized</div>
        {['Abu Samra Border → Salwa Road (E-45)','Salwa Road → South Industrial Road','South Industrial Road → Industrial Area Gate 3'].map((seg,i)=>(<div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'9px 12px',background:C.surfaceAlt,borderRadius:8,marginBottom:6}}><div style={{width:24,height:24,borderRadius:'50%',background:C.amber,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800,color:'#fff',flexShrink:0,fontFamily:font.display}}>{i+1}</div><span style={{fontSize:12,color:C.text}}>{seg}</span></div>))}
      </div>
      <CheckRow status="ok" label="Salwa Interchange bridge — clearance 5.8m (required 4.2m)" badge="Cleared"/>
      <CheckRow status="ok" label="Industrial Road overpass — clearance 4.9m" badge="Cleared"/>
      <CheckRow status="warn" label="Power line at km 18.4 — clearance 4.5m (tight)" note="Night travel recommended for safety" badge="Caution"/>
      <CheckRow status="ok" label="All road load ratings ≥ 100 tonnes on Route A" badge="Adequate"/>
      <AIB items={['Route A viable with one caution at km 18.4 — power line overhead clearance.','Recommending night travel: 00:00–05:00 for safety margin.','AI application pre-populated with route map + infrastructure report.']}/>
    </div>);

    if (stepIdx === 2) return (<div style={{display:'flex',flexDirection:'column',gap:12}}>
      <AppC agency="Ashghal — Public Works Authority" status="Approved" time="Approved · 2h 15m · Apr 04 · 12:30" rec="Route A approved. Night travel 00:00–05:00 mandatory."/>
      <AppC agency="MOI — Traffic & Patrol Department" status="Approved" time="Police escort assigned · Apr 05 · 00:00" rec="2-vehicle escort. Lead: MPQ-T 4412. Freq: 468.700 MHz."/>
      <AppC agency="Ministry of Commerce & Industry" status="Approved" time="Import permit cleared · 45 min" rec="Capital goods — duty-free under UAE-Qatar bilateral agreement."/>
      <div style={{padding:16,background:C.surface,border:`2px solid ${C.amberBorder}`,borderRadius:12,boxShadow:C.shadow}}>
        <div style={{fontSize:10,color:C.amber,letterSpacing:2,textTransform:'uppercase',marginBottom:8,fontFamily:font.mono}}>Special Transport Permit Issued</div>
        <div style={{fontSize:18,fontWeight:800,color:C.text,marginBottom:10,fontFamily:font.display}}>STP-QAT-2026-4102</div>
        <InfoGrid cols={2} items={[{label:'Valid',val:'Apr 05–06, 2026 (48 hrs)'},{label:'Travel Window',val:'00:00 – 05:00 only',color:C.amber},{label:'Max Speed',val:'40 km/h',color:C.orange},{label:'Police Escort',val:'Mandatory — 2 vehicles'}]}/>
      </div>
      <AIB items={['All 3 authorities approved. Permit STP-QAT-2026-4102 issued.','AI-prepared application accepted with zero revisions required.','Border crossing authorization forwarded to Abu Samra.']}/>
    </div>);

    if (stepIdx === 3) return (<div style={{display:'flex',flexDirection:'column',gap:14}}>
      <div style={{padding:14,background:C.surface,borderRadius:10,border:`1px solid ${C.border}`,boxShadow:C.shadow}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}><div><div style={{fontWeight:700,fontSize:14,color:C.text}}>Abu Samra Border Crossing</div><div style={{fontSize:11,color:C.muted}}>Apr 05, 2026 · 00:05 · Entry into Qatar</div></div><span style={{padding:'5px 12px',background:C.greenLight,border:`1px solid ${C.greenBorder}`,borderRadius:8,fontWeight:700,fontSize:12,color:C.green}}>CROSSED</span></div>
        <InfoGrid cols={3} items={[{label:'Permit Verified',val:'STP-QAT-2026-4102',color:C.green},{label:'Axle Check',val:'94.2 T — Pass',color:C.green},{label:'Time at Border',val:'38 minutes',color:C.teal},{label:'Police Escort',val:'Lead MPQ-T 4412 Active'},{label:'Entry Time',val:'00:43 — Night window',color:C.green},{label:'Live Tracking',val:'GPS Active on Portal',color:C.teal}]}/>
      </div>
      <CheckRow status="ok" label="Qatar Customs — duty-free import cleared under bilateral agreement" badge="Cleared"/>
      <CheckRow status="ok" label="Vehicle dimensions verified: 21.4 × 3.8 × 4.2m" badge="Verified"/>
      <CheckRow status="ok" label="Police escort active on radio 468.700 MHz" badge="Active"/>
      <CheckRow status="ok" label="Real-time GPS tracking live for all stakeholders" badge="Live"/>
      <div style={{padding:12,background:C.amberLight,border:`1px solid ${C.amberBorder}`,borderRadius:10}}><div style={{fontFamily:"'Noto Kufi Arabic',sans-serif",direction:'rtl',fontSize:13,color:C.amber,marginBottom:4}}>تنبيه: مسار مقيّد — سرعة قصوى 40 كم/ساعة — نافذة التنقل: 00:00 حتى 05:00</div><div style={{fontSize:10,color:C.muted}}>Arabic portal alert sent to driver — route restrictions confirmed.</div></div>
      <AIB items={['Border crossing in 38 minutes — AI permit pre-clearance enabled fast processing.','Live GPS tracking active. Real-time alerts to all stakeholders.','Estimated arrival at Industrial Area: 03:45 — within night travel window.']}/>
    </div>);

    if (stepIdx === 4) return (<div style={{display:'flex',flexDirection:'column',gap:14}}>
      <div style={{padding:18,background:C.surface,border:`2px solid ${C.amberBorder}`,borderRadius:12,boxShadow:C.shadowMd}}>
        <div style={{fontSize:10,color:C.amber,letterSpacing:2,textTransform:'uppercase',marginBottom:10,fontFamily:font.mono}}>Delivery Confirmation — Oversize Transport</div>
        <div style={{display:'flex',justifyContent:'space-between',flexWrap:'wrap',gap:8,marginBottom:12}}><div><div style={{fontSize:18,fontWeight:800,color:C.text,fontFamily:font.display}}>Arabian Contracting Co. — Zone 4</div><div style={{fontSize:11,color:C.muted,fontFamily:font.mono}}>Doha Industrial Area · Apr 05, 2026 · 03:38</div></div><span style={{padding:'6px 14px',background:C.greenLight,border:`1px solid ${C.greenBorder}`,borderRadius:8,fontWeight:700,color:C.green}}>DELIVERED</span></div>
      </div>
      <CheckRow status="ok" label="Crane offloaded and positioned at site — zero road incidents" badge="Safe"/>
      <CheckRow status="ok" label="Police escort dismissed at 03:44 — MPQ-T 4412" badge="Released"/>
      <CheckRow status="ok" label="Delivery receipt signed — Eng. Khalid Al-Mohannadi" badge="Signed"/>
      <CheckRow status="ok" label="Permit closed in portal — STP-QAT-2026-4102 archived" badge="Closed"/>
      <SummaryKPIs items={[{label:'Total Time',val:'5h 38m',Icon:Clock,color:C.teal},{label:'Authorities',val:'3 approved',Icon:Building2,color:C.amber},{label:'Incidents',val:'Zero',Icon:Shield,color:C.green},{label:'AI Automation',val:'68%',Icon:Bot,color:C.teal}]}/>
      <AIB items={['96-tonne crane delivered safely within the night travel window. Zero incidents.','All 3 permit authorities processed via portal — no physical office visits required.','Manual 3-day permit process reduced to 5.5 hours end-to-end.']}/>
    </div>);
  }

  if (ucId === 'multimodal') {
    if (stepIdx === 0) return (<div style={{display:'flex',flexDirection:'column',gap:14}}>
      <div style={{padding:16,background:C.surface,borderRadius:12,border:`1px solid ${C.border}`,boxShadow:C.shadow}}>
        <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:14}}><div style={{width:52,height:52,borderRadius:12,background:C.purpleLight,border:`1px solid ${C.purpleBorder}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><RefreshCw size={26} color={C.purple}/></div><div><div style={{fontWeight:800,fontSize:15,color:C.text,fontFamily:font.display}}>MULTI-MODAL BOOKING: MML-2026-5500</div><div style={{fontSize:11,color:C.muted,marginTop:2}}>Singapore PSA → Hamad Port → 4 Distribution Points, Qatar</div></div></div>
        <InfoGrid cols={3} items={[{label:'Commodity',val:'Consumer Electronics (FMCG)'},{label:'Sea Carrier',val:'MSC CONSTANZA — Voyage 126N'},{label:'Containers',val:'18 × 40ft — 2,160 CBM'},{label:'Shipper',val:'Samsung Electronics SG'},{label:'Consignees',val:'LuLu, IKEA, Carrefour, ACE',color:C.purple},{label:'Total Value',val:'USD 4,800,000'}]}/>
      </div>
      <CheckRow status="ok" label="Master B/L issued — MSC Singapore" badge="Issued"/>
      <CheckRow status="ok" label="4 House B/Ls generated — one per consignee" badge="Created"/>
      <CheckRow status="ok" label="4 Commercial invoices split by consignee allocation" badge="Ready"/>
      <CheckRow status="ok" label="Qatar Customs pre-declaration filed — 10 days in advance" badge="Pre-filed"/>
      <AIB items={['Multi-party documentation automatically split by consignee using AI.','Pre-declaration filed 10 days early — eligible for express customs lane.','Activating live AIS vessel tracking for MML-2026-5500.']}/>
    </div>);

    if (stepIdx === 1) return (<div style={{display:'flex',flexDirection:'column',gap:14}}>
      <div style={{padding:14,background:C.surface,borderRadius:10,border:`1px solid ${C.border}`,boxShadow:C.shadow}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}><div style={{fontWeight:700,fontSize:14,color:C.text}}>Live Vessel Tracker — MSC CONSTANZA</div><span style={{fontSize:10,color:C.teal,fontFamily:font.mono}}>AIS · 4-hr updates</span></div>
        <div style={{display:'flex',alignItems:'center',padding:'12px 0',marginBottom:14}}>
          {[{label:'Singapore PSA',sub:'Mar 28',done:true},{label:'Strait of Malacca',sub:'Mar 30',done:true},{label:'Arabian Sea',sub:'Current',done:false,active:true},{label:'Gulf of Oman',sub:'Apr 06',done:false},{label:'Hamad Port',sub:'ETA Apr 08',done:false}].map((pt,i)=>(<div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',position:'relative'}}>{i>0&&<div style={{position:'absolute',top:10,right:'50%',left:'-50%',height:2,background:pt.done?C.teal:C.border,zIndex:0}}/>}<div style={{width:22,height:22,borderRadius:'50%',background:pt.active?C.amber:pt.done?C.teal:C.surfaceAlt,border:`2px solid ${pt.active?C.amber:pt.done?C.teal:C.borderMid}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:800,color:(pt.active||pt.done)?'#fff':C.muted,zIndex:1,flexShrink:0}}>{pt.done?'✓':i+1}</div><div style={{fontSize:9,color:pt.active?C.amber:pt.done?C.teal:C.muted,textAlign:'center',marginTop:5,fontWeight:pt.active?700:400,lineHeight:1.3}}>{pt.label}</div><div style={{fontSize:8,color:C.mutedLight,textAlign:'center',fontFamily:font.mono}}>{pt.sub}</div></div>))}
        </div>
        <InfoGrid cols={2} items={[{label:'Current Position',val:'Arabian Sea (17.4°N, 63.2°E)'},{label:'Speed',val:'18.4 knots'},{label:'ETA — Hamad Port',val:'Apr 08, 2026 · 07:00',color:C.amber},{label:'Days Remaining',val:'3 days 14 hours'}]}/>
      </div>
      <CheckRow status="ok" label="Hamad Port berth pre-reserved — CT1, Berths 04–06" badge="Reserved"/>
      <CheckRow status="ok" label="4 consignees notified — ETA confirmation sent" badge="Notified"/>
      <CheckRow status="ok" label="Customs advance notice filed — 18 containers × 4 B/Ls" badge="Filed"/>
      <CheckRow status="ok" label="Truck fleet pre-allocated — 12 trucks on standby" badge="Pre-booked"/>
      <AIB items={['Live AIS tracking — auto-alerts on any ETA deviation.','4 pre-arrival workflows triggered simultaneously.','All clearance workflows ready the moment the vessel arrives.']}/>
    </div>);

    if (stepIdx === 2) return (<div style={{display:'flex',flexDirection:'column',gap:14}}>
      <div style={{padding:12,background:C.tealLight,border:`1px solid ${C.tealBorder}`,borderRadius:10,display:'flex',gap:12,alignItems:'center'}}><Anchor size={22} color={C.teal} style={{flexShrink:0}}/><div><div style={{fontWeight:700,color:C.text}}>MSC CONSTANZA — Hamad Port Arrival</div><div style={{fontSize:11,color:C.muted}}>Apr 08, 2026 · 06:45 · CT1, Berths 04–06</div></div><span style={{marginLeft:'auto',padding:'4px 12px',background:C.greenLight,border:`1px solid ${C.greenBorder}`,borderRadius:8,fontWeight:700,fontSize:12,color:C.green}}>BERTHED</span></div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        <AppC agency="Qatar Customs Authority" status="Cleared" time="Pre-declaration approved · 32 min" rec="All 18 containers: Green Lane. No physical inspection."/>
        <AppC agency="Hamad Port Authority" status="Approved" time="Container discharge started · 08:00" rec="18 containers allocated to CY Block D."/>
      </div>
      <div style={{padding:14,background:C.surface,borderRadius:10,border:`1px solid ${C.border}`,boxShadow:C.shadow}}>
        <div style={{fontSize:11,color:C.muted,marginBottom:10,textTransform:'uppercase',letterSpacing:0.5,fontFamily:font.mono}}>Consignee Clearance Split</div>
        {[{c:'LuLu Hypermarket',n:6,st:'Cleared',d:'USD 44,000'},{c:'IKEA Qatar',n:4,st:'Cleared',d:'USD 31,200'},{c:'Carrefour Qatar',n:5,st:'Cleared',d:'USD 38,800'},{c:'ACE Hardware',n:3,st:'In Review',d:'USD 22,400'}].map((row,i)=>(<div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 10px',background:C.surfaceAlt,borderRadius:7,marginBottom:5,border:`1px solid ${C.border}`}}><div style={{fontSize:12,fontWeight:600,color:C.text}}>{row.c}</div><div style={{display:'flex',gap:10,alignItems:'center'}}><span style={{fontSize:11,color:C.muted,fontFamily:font.mono}}>{row.n} ctrs</span><span style={{fontSize:11,color:C.amber,fontWeight:600}}>{row.d}</span><span style={{padding:'2px 8px',borderRadius:10,fontSize:10,fontWeight:700,background:row.st==='Cleared'?C.greenLight:C.amberLight,color:row.st==='Cleared'?C.green:C.amber,border:`1px solid ${row.st==='Cleared'?C.greenBorder:C.amberBorder}`}}>{row.st}</span></div></div>))}
      </div>
      <AIB items={['Pre-declaration: customs cleared in 32 min vs. avg 4–6 hrs.','ACE Hardware — 1 container in conformity check. Non-blocking for others.','15 of 18 containers released. Unstuffing and truck dispatch initiated.']}/>
    </div>);

    if (stepIdx === 3) return (<div style={{display:'flex',flexDirection:'column',gap:14}}>
      <InfoGrid cols={2} items={[{label:'Containers Unstuffing',val:'15 of 18 (3 on hold)'},{label:'Warehouse',val:'Block D, Sheds 7–9'},{label:'Started',val:'Apr 08 · 10:30'},{label:'Est. Completion',val:'Apr 08 · 14:00',color:C.amber}]}/>
      <CheckRow status="ok" label="LuLu Hypermarket — 6 containers unstuffed, palletized, ready" badge="Ready"/>
      <CheckRow status="ok" label="IKEA Qatar — 4 containers unstuffed, quality check passed" badge="Ready"/>
      <CheckRow status="warn" label="Carrefour Qatar — 5 containers in progress, est. 13:30" badge="In Progress"/>
      <CheckRow status="wait" label="ACE Hardware — 3 containers on customs conformity hold" badge="On Hold"/>
      <InfoGrid cols={2} items={[{label:'WR Number',val:'WHR-2026-5500-HMD'},{label:'Total SKUs',val:'14,280 units'},{label:'Pallets',val:'186 pallets'},{label:'Issued to',val:'LuLu, IKEA, Carrefour',color:C.purple}]}/>
      <AIB items={['15 containers unstuffed. LuLu and IKEA loads ready for dispatch.','Carrefour completing — 30 min. ACE on customs hold.','Initiating truck dispatch for LuLu and IKEA consignments now.']}/>
    </div>);

    if (stepIdx === 4) return (<div style={{display:'flex',flexDirection:'column',gap:14}}>
      <div style={{padding:14,background:C.surface,borderRadius:10,border:`1px solid ${C.border}`,boxShadow:C.shadow}}>
        <div style={{fontWeight:700,fontSize:14,color:C.text,marginBottom:12}}>Truck Fleet Dispatch — Multi-Drop</div>
        {[{truck:'MQ 3312 (12T)',dest:'LuLu Hypermarket, Al Khor',pallets:42,st:'Dispatched · 13:15',col:C.green},{truck:'MQ 3318 (12T)',dest:'LuLu Hypermarket, Lusail',pallets:38,st:'Dispatched · 13:15',col:C.green},{truck:'MQ 4101 (10T)',dest:'IKEA Qatar, Doha Festival City',pallets:54,st:'Dispatched · 13:30',col:C.green},{truck:'MQ 4108 (10T)',dest:'IKEA Qatar, Doha Festival City',pallets:52,st:'Dispatched · 13:30',col:C.green},{truck:'MQ 5220 (15T)',dest:'Carrefour Qatar HQ',pallets:0,st:'Staged for 14:30',col:C.amber}].map((t,i)=>(<div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 12px',background:C.surfaceAlt,borderRadius:8,border:`1px solid ${C.border}`,marginBottom:6}}><div><div style={{fontSize:13,fontWeight:600,color:C.text}}>{t.truck}</div><div style={{fontSize:11,color:C.muted}}>{t.dest}</div></div><div style={{textAlign:'right'}}>{t.pallets>0&&<div style={{fontSize:11,color:C.muted,fontFamily:font.mono,marginBottom:2}}>{t.pallets} pallets</div>}<span style={{fontSize:11,fontWeight:700,color:t.col}}>{t.st}</span></div></div>))}
      </div>
      <AIB items={['4 trucks dispatched. LuLu and IKEA loads en route with live GPS tracking.','Carrefour truck staged for 14:30 once unstuffing completes.','AI auto-notified all consignee warehouses with ETA + driver details.']}/>
    </div>);

    if (stepIdx === 5) return (<div style={{display:'flex',flexDirection:'column',gap:14}}>
      <div style={{padding:16,background:C.surface,border:`2px solid ${C.purpleBorder}`,borderRadius:12,boxShadow:C.shadowMd}}>
        <div style={{fontSize:10,color:C.purple,letterSpacing:2,textTransform:'uppercase',marginBottom:12,fontFamily:font.mono}}>Electronic Proof of Delivery — Multi-Drop</div>
        {[{name:'LuLu — Al Khor',time:'16:22',sign:'Mgr. Mohd Al Rashid',done:true},{name:'LuLu — Lusail',time:'17:05',sign:'Mgr. Fatima Al Nasr',done:true},{name:'IKEA — Doha Festival City',time:'16:48',sign:'Mgr. Ahmed Thani',done:true},{name:'Carrefour — HQ',time:'19:30',sign:'Mgr. Samer Kanaan',done:true},{name:'ACE Hardware — Industrial Area',time:'Pending',sign:'Customs hold ongoing',done:false}].map((d,i)=>(<div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'9px 12px',background:C.surfaceAlt,borderRadius:8,border:`1px solid ${C.border}`,marginBottom:6}}><div><div style={{fontSize:12,fontWeight:600,color:C.text}}>{d.name}</div><div style={{fontSize:10,color:C.muted,fontFamily:font.mono}}>{d.sign} · {d.time}</div></div><span style={{padding:'3px 10px',borderRadius:8,fontSize:11,fontWeight:700,background:d.done?C.greenLight:C.amberLight,border:`1px solid ${d.done?C.greenBorder:C.amberBorder}`,color:d.done?C.green:C.amber,whiteSpace:'nowrap'}}>{d.done?'Delivered':'Pending'}</span></div>))}
      </div>
      <SummaryKPIs items={[{label:'Total Journey',val:'~15 hrs',Icon:Clock,color:C.teal},{label:'Drops Done',val:'4 of 5',Icon:MapPin,color:C.green},{label:'AI Automation',val:'81%',Icon:Bot,color:C.teal},{label:'On-Time',val:'4 of 4',Icon:CheckCircle,color:C.green}]}/>
      <AIB items={['4 of 5 consignees received. ePODs signed and archived in portal.','ACE Hardware hold to resolve within 24 hrs (conformity check).','4-consignee multi-modal supply chain executed in ~15 hours end-to-end.']}/>
    </div>);
  }
  return null;
};

// ─── Use Case & Step icon maps ────────────────────────────────────────────────
const UC_ICONS = { sea:Ship, air:Plane, land:Truck, multimodal:RefreshCw };
const STEP_ICONS = { sea:[Radio,FileText,Bot,Building2,CreditCard,CheckCircle], air:[Upload,Bot,Shield,Warehouse,Thermometer], land:[FileCheck,Bot,ShieldCheck,ScanLine,Truck], multimodal:[Package,Activity,Anchor,Boxes,Truck,ClipboardCheck] };
const UC_COLORS = { sea:{color:C.primary,light:C.primaryLight,border:C.primaryBorder}, air:{color:C.teal,light:C.tealLight,border:C.tealBorder}, land:{color:C.amber,light:C.amberLight,border:C.amberBorder}, multimodal:{color:C.purple,light:C.purpleLight,border:C.purpleBorder} };
const UC_TAG_COLORS = { sea:C.teal, air:C.orange, land:C.purple, multimodal:C.primary };

// ─── Overview Page ────────────────────────────────────────────────────────────
const OverviewPage = ({ onExplore, lang }) => {
  const s = S[lang];
  const isAr = lang === 'ar';
  const capIcons = [Anchor, Bot, Globe, Building2, Zap, Shield];
  const techIcons = [Cloud, Bot, Network, Lock];
  const techColors = [C.primary, C.teal, C.purple, C.green];
  const stackIcons = [Code, Bot, Network, Server];
  const stackItems = [['React 18','Lucide Icons','Recharts','DM Sans / Barlow'],['Arabic NLP','OCR Pipeline','Rules Engine','Risk Scoring'],['REST / SOAP','AIS Feed API','IoT MQTT','SMS Gateway'],['Azure Qatar','Kubernetes','PostgreSQL','Redis Cache']];

  return (<div style={{maxWidth:1020,margin:'0 auto',padding:'0 24px 80px'}}>
    {/* Hero */}
    <div style={{textAlign:'center',padding:'48px 20px 36px'}}>
      <div style={{display:'inline-flex',alignItems:'center',gap:8,padding:'5px 14px',background:C.amberLight,border:`1px solid ${C.amberBorder}`,borderRadius:20,marginBottom:20}}>
        <div style={{width:6,height:6,borderRadius:'50%',background:C.amberAccent}}/>
        <span style={{fontSize:11,fontWeight:700,color:C.amber,letterSpacing:1,textTransform:'uppercase',fontFamily:font.mono}}>{s.overview.badge}</span>
      </div>
      <h1 style={{fontFamily:font.display,fontSize:'clamp(26px,5vw,50px)',fontWeight:800,color:C.navy,lineHeight:1.05,marginBottom:14,letterSpacing:0.3}}>{s.overview.title}<br/><span style={{color:C.primary}}>{s.overview.titleAccent}</span></h1>
      <p style={{fontSize:14,color:C.muted,maxWidth:560,margin:'0 auto 26px',lineHeight:1.75}}>{s.overview.desc}</p>
      <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
        <button onClick={onExplore} style={{padding:'12px 28px',borderRadius:10,border:'none',cursor:'pointer',background:`linear-gradient(135deg,${C.primary},${C.navyMid})`,color:'#fff',fontWeight:700,fontSize:14,fontFamily:font.body,display:'flex',alignItems:'center',gap:8,boxShadow:C.shadowMd}}>
          {s.overview.exploreBtn} {isAr?null:<ArrowRight size={16}/>}
        </button>
        <div style={{padding:'12px 20px',borderRadius:10,border:`1px solid ${C.border}`,background:C.surface,fontSize:13,color:C.muted,display:'flex',alignItems:'center',gap:8}}>
          <span style={{fontWeight:600,color:C.text}}>{s.overview.poweredBy}</span>
          <span style={{fontWeight:800,color:C.primary}}>Atmet AI</span>
          <span style={{color:C.border}}>|</span>
          <span>{s.overview.arabicFirst}</span>
        </div>
      </div>
    </div>

    {/* Stats */}
    <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:36}}>
      {[{val:'14',Icon:Building2,color:C.primary},{val:'5×',Icon:Zap,color:C.teal},{val:'80%',Icon:Bot,color:C.purple},{val:'3',Icon:RefreshCw,color:C.amber}].map((stat,i)=>(<div key={i} style={{padding:'16px',background:C.surface,borderRadius:12,border:`1px solid ${C.border}`,boxShadow:C.shadow,textAlign:'center'}}>
        <div style={{display:'flex',justifyContent:'center',marginBottom:8}}><div style={{width:36,height:36,borderRadius:8,background:`${stat.color}14`,display:'flex',alignItems:'center',justifyContent:'center'}}><stat.Icon size={18} color={stat.color}/></div></div>
        <div style={{fontSize:26,fontWeight:800,color:stat.color,fontFamily:font.display}}>{stat.val}</div>
        <div style={{fontSize:11,color:C.muted,marginTop:3,lineHeight:1.4}}>{s.overview.stats[i]}</div>
      </div>))}
    </div>

    {/* About POC */}
    <div style={{marginBottom:36}}>
      <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:16}}><div style={{width:3,height:20,background:C.primary,borderRadius:2}}/><h2 style={{fontFamily:font.display,fontSize:22,fontWeight:800,color:C.navy}}>{s.overview.aboutTitle}</h2></div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
        {s.overview.aboutCards.map((card,i)=>{const icons=[Flag,Users,TrendingUp,FileText];const colors=[C.primary,C.teal,C.purple,C.amber];const Icon=icons[i];return(<div key={i} style={{padding:'18px',background:C.surface,borderRadius:12,border:`1px solid ${C.border}`,boxShadow:C.shadow}}>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}><div style={{width:32,height:32,borderRadius:8,background:`${colors[i]}14`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><Icon size={16} color={colors[i]}/></div><div style={{fontSize:13,fontWeight:700,color:C.text}}>{card.title}</div></div>
          <div style={{fontSize:12,color:C.muted,lineHeight:1.7}}>{card.content}</div>
        </div>);})}
      </div>
    </div>

    {/* Capabilities */}
    <div style={{marginBottom:36}}>
      <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:16}}><div style={{width:3,height:20,background:C.teal,borderRadius:2}}/><h2 style={{fontFamily:font.display,fontSize:22,fontWeight:800,color:C.navy}}>{s.overview.capTitle}</h2></div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>
        {s.capCards.map((cap,i)=>{const Icon=capIcons[i];const colors=[C.primary,C.teal,C.purple,C.amber,C.green,C.red];return(<div key={i} style={{padding:'16px',background:C.surface,borderRadius:12,border:`1px solid ${C.border}`,boxShadow:C.shadow,borderTop:`2px solid ${colors[i]}`}}>
          <div style={{width:36,height:36,borderRadius:8,background:`${colors[i]}14`,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:10}}><Icon size={18} color={colors[i]}/></div>
          <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:5}}>{cap.title}</div>
          <div style={{fontSize:11,color:C.muted,lineHeight:1.65}}>{cap.desc}</div>
        </div>);})}
      </div>
    </div>

    {/* Tech Architecture */}
    <div style={{marginBottom:36}}>
      <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:16}}><div style={{width:3,height:20,background:C.purple,borderRadius:2}}/><h2 style={{fontFamily:font.display,fontSize:22,fontWeight:800,color:C.navy}}>{s.overview.archTitle}</h2></div>
      <div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,overflow:'hidden',boxShadow:C.shadowMd,marginBottom:14}}>
        {s.techLayers.map((layer,i)=>{const Icon=techIcons[i];const col=techColors[i];return(<div key={i}>
          <div style={{padding:'14px 20px',borderBottom:i<3?`1px solid ${C.border}`:'none'}}>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}><div style={{width:30,height:30,borderRadius:7,background:`${col}14`,border:`1px solid ${col}30`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><Icon size={15} color={col}/></div><div style={{fontSize:11,fontWeight:700,color:col,textTransform:'uppercase',letterSpacing:0.5,fontFamily:font.mono}}>{layer.label}</div></div>
            <div style={{display:'flex',flexWrap:'wrap',gap:6,marginLeft:40}}>{layer.items.map((item,j)=>(<span key={j} style={{padding:'4px 10px',background:`${col}10`,border:`1px solid ${col}25`,borderRadius:6,fontSize:11,color:col,fontWeight:600,fontFamily:font.mono}}>{item}</span>))}</div>
          </div>
          {i<3&&<div style={{display:'flex',justifyContent:'center',padding:'3px 0',background:C.surfaceAlt,borderBottom:`1px solid ${C.border}`}}><ChevronRight size={14} color={C.muted} style={{transform:'rotate(90deg)'}}/></div>}
        </div>);})}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10}}>
        {s.stackLabels.map((label,i)=>{const Icon=stackIcons[i];const col=techColors[i];return(<div key={i} style={{padding:'14px',background:C.surface,borderRadius:10,border:`1px solid ${C.border}`,boxShadow:C.shadow}}>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}><Icon size={14} color={col}/><span style={{fontSize:11,fontWeight:700,color:col,textTransform:'uppercase',letterSpacing:0.5,fontFamily:font.mono}}>{label}</span></div>
          {stackItems[i].map((item,j)=>(<div key={j} style={{fontSize:11,color:C.muted,padding:'3px 0',borderBottom:j<stackItems[i].length-1?`1px solid ${C.border}`:'none'}}>{item}</div>))}
        </div>);})}
      </div>
    </div>

    {/* CTA */}
    <div style={{padding:'26px 30px',background:`linear-gradient(135deg,${C.primaryLight},${C.tealLight})`,border:`1px solid ${C.primaryBorder}`,borderRadius:14,display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:14,boxShadow:C.shadowMd}}>
      <div><div style={{fontFamily:font.display,fontWeight:800,fontSize:18,color:C.navy,marginBottom:4}}>{s.overview.readyTitle}</div><div style={{fontSize:13,color:C.muted}}>{s.overview.readyDesc}</div></div>
      <button onClick={onExplore} style={{padding:'12px 28px',borderRadius:10,border:'none',cursor:'pointer',background:`linear-gradient(135deg,${C.primary},${C.navyMid})`,color:'#fff',fontWeight:700,fontSize:14,fontFamily:font.body,display:'flex',alignItems:'center',gap:8,boxShadow:C.shadowMd}}>
        {s.overview.exploreBtn} <ArrowRight size={16}/>
      </button>
    </div>
  </div>);
};

// ─── Main App ──────────────────────────────────────────────────────────────────
export default function LogisticsPortalDemo() {
  const [page, setPage] = useState('overview');
  const [selectedUC, setSelectedUC] = useState(null);
  const [step, setStep] = useState(0);
  const [completed, setCompleted] = useState([]);
  const [visible, setVisible] = useState(true);
  const [lang, setLang] = useState('en');

  const s = S[lang];
  const isAr = lang === 'ar';
  const dir = isAr ? 'rtl' : 'ltr';

  const uc = selectedUC ? { id:selectedUC, ...UC_COLORS[selectedUC] } : null;
  const ucSteps = selectedUC ? s.steps[selectedUC] : [];
  const ucDepts = selectedUC ? s.depts[selectedUC] : [];
  const ucEsts = selectedUC ? s.ests[selectedUC] : [];
  const stepIcons = selectedUC ? STEP_ICONS[selectedUC] : [];
  const allDone = uc && completed.length >= ucSteps.length;

  const goTo = (target) => { setVisible(false); setTimeout(()=>{setStep(target);setVisible(true);},200); };
  const nextStep = () => { if(!uc) return; setCompleted(p=>p.includes(step)?p:[...p,step]); if(step<ucSteps.length-1) goTo(step+1); };
  const startUC = (id) => { setSelectedUC(id); setStep(0); setCompleted([]); setPage('demo'); };
  const goSelect = () => { setPage('select'); setSelectedUC(null); };

  const UcIcon = selectedUC ? UC_ICONS[selectedUC] : null;

  return (
    <div dir={dir} style={{fontFamily:font.body,background:C.bg,color:C.text,minHeight:'100vh'}}>
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
        .nav-link{transition:all 0.12s;cursor:pointer;}
        .nav-link:hover{background:${C.surfaceAlt} !important;}
        .pulse{animation:pulse 2.5s infinite;}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        .ar{font-family:'Noto Kufi Arabic',sans-serif !important;}
        @keyframes fup{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .done-anim{animation:fup 0.4s ease both;}
      `}</style>

      {/* ── NAV ── */}
      <nav style={{padding:'0 24px',height:56,display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:`1px solid ${C.border}`,background:C.surface,boxShadow:C.shadow,position:'sticky',top:0,zIndex:100}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div style={{display:'flex',gap:2}}><div style={{width:3,height:20,background:C.primary,borderRadius:2}}/><div style={{width:3,height:20,background:C.amberAccent,borderRadius:2,marginLeft:2}}/></div>
          <div>
            <div className={isAr?'ar':''} style={{fontFamily:isAr?"'Noto Kufi Arabic',sans-serif":font.display,fontWeight:800,fontSize:isAr?13:15,color:C.navy,letterSpacing:isAr?0:0.5}}>{s.nav.title}</div>
            <div style={{fontSize:9,color:C.muted,letterSpacing:1,fontFamily:font.mono}}>{s.nav.sub}</div>
          </div>
        </div>
        <div style={{display:'flex',gap:4,alignItems:'center'}}>
          {[{label:s.nav.overview,id:'overview'},{label:s.nav.useCases,id:'select'}].map(link=>(<button key={link.id} className="nav-link" onClick={()=>link.id==='select'?goSelect():setPage('overview')} style={{padding:'6px 12px',borderRadius:7,border:'none',cursor:'pointer',background:page===link.id?C.primaryLight:'transparent',color:page===link.id?C.primary:C.muted,fontSize:12,fontWeight:page===link.id?700:500,fontFamily:isAr?"'Noto Kufi Arabic',sans-serif":font.body}}>{link.label}</button>))}
          <div style={{width:1,height:20,background:C.border,margin:'0 4px'}}/>
          {/* Language Toggle */}
          <button className="btn" onClick={()=>setLang(l=>l==='en'?'ar':'en')} style={{display:'flex',alignItems:'center',gap:6,padding:'6px 12px',borderRadius:8,border:`1px solid ${C.border}`,background:C.surface,cursor:'pointer',fontSize:12,fontWeight:700,color:C.primary,fontFamily:font.mono}}>
            <Languages size={14} color={C.primary}/>
            {lang==='en'?'عربي':'English'}
          </button>
          <div style={{display:'flex',alignItems:'center',gap:5,marginLeft:4}}>
            <span className="pulse" style={{width:7,height:7,borderRadius:'50%',background:C.green,display:'block',boxShadow:`0 0 6px ${C.green}`}}/>
            <span style={{fontSize:11,color:C.muted,fontFamily:font.mono}}>{s.nav.liveDemo}</span>
          </div>
        </div>
      </nav>

      {/* ── OVERVIEW ── */}
      {page==='overview' && <OverviewPage onExplore={goSelect} lang={lang}/>}

      {/* ── USE CASE SELECTION ── */}
      {page==='select' && (
        <div style={{maxWidth:1000,margin:'0 auto',padding:'40px 22px 80px'}}>
          <div style={{textAlign:'center',marginBottom:34}}>
            <div style={{fontSize:10,color:C.primary,letterSpacing:4,textTransform:'uppercase',marginBottom:12,fontWeight:700,fontFamily:font.mono}}>{s.select.badge}</div>
            <h1 className={isAr?'ar':''} style={{fontFamily:isAr?"'Noto Kufi Arabic',sans-serif":font.display,fontSize:'clamp(22px,4vw,38px)',fontWeight:800,color:C.navy,marginBottom:10}}>{s.select.title}</h1>
            <p className={isAr?'ar':''} style={{fontSize:13,color:C.muted,maxWidth:480,margin:'0 auto',lineHeight:1.7}}>{s.select.desc}</p>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:16}}>
            {Object.keys(UC_ICONS).map(id=>{const Icon=UC_ICONS[id];const col=UC_COLORS[id];const tagCol=UC_TAG_COLORS[id];return(
              <div key={id} className="uc-card" onClick={()=>startUC(id)} style={{padding:22,background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,boxShadow:C.shadow,borderTop:`3px solid ${col.color}`}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:14}}>
                  <div style={{width:52,height:52,borderRadius:12,background:col.light,border:`1px solid ${col.border}`,display:'flex',alignItems:'center',justifyContent:'center'}}><Icon size={26} color={col.color}/></div>
                  <span style={{padding:'4px 10px',borderRadius:20,fontSize:10,fontWeight:700,background:`${tagCol}14`,color:tagCol,border:`1px solid ${tagCol}44`,fontFamily:font.mono}}>{s.ucTags[id]}</span>
                </div>
                <div className={isAr?'ar':''} style={{fontFamily:isAr?"'Noto Kufi Arabic',sans-serif":font.display,fontWeight:800,fontSize:19,color:C.navy,marginBottom:2}}>{s.ucTitles[id]}</div>
                <div className={isAr?'ar':''} style={{fontSize:12,color:col.color,fontWeight:600,marginBottom:8}}>{s.ucSubtitles[id]}</div>
                <div className={isAr?'ar':''} style={{fontSize:12,color:C.muted,marginBottom:12,lineHeight:1.65}}>{s.ucDescs[id]}</div>
                <div style={{display:'flex',alignItems:'center',gap:4,fontSize:11,color:C.muted,marginBottom:10}}><MapPin size={11} color={C.muted}/>{id==='sea'?'Hamburg Port → Hamad Port':id==='air'?'London Heathrow → HIA Doha':id==='land'?'RAKIA UAE → Abu Samra → Doha':'Singapore PSA → Hamad Port → 4 Points'}</div>
                <div style={{height:1,background:C.border,marginBottom:12}}/>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
                  <div style={{fontSize:11,color:C.muted,fontFamily:font.mono}}>{s.steps[id].length} steps · {s.ucTimes[id]}</div>
                  <div style={{display:'flex',gap:3}}>{s.steps[id].map((_,i)=>(<div key={i} style={{width:6,height:6,borderRadius:'50%',background:C.border}}/>))}</div>
                </div>
                <div style={{padding:'10px',background:col.light,border:`1px solid ${col.border}`,borderRadius:8,textAlign:'center',fontSize:12,fontWeight:700,color:col.color,display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
                  {s.select.startDemo} <ChevronRight size={14}/>
                </div>
              </div>
            );})}
          </div>
        </div>
      )}

      {/* ── DEMO FLOW ── */}
      {page==='demo' && selectedUC && uc && (
        <div style={{maxWidth:1060,margin:'0 auto',padding:'18px 20px 60px',display:'flex',flexDirection:'column',gap:14}}>
          {/* Header */}
          <div style={{padding:'12px 18px',background:C.surface,borderRadius:12,border:`1px solid ${C.border}`,boxShadow:C.shadow,display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}>
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <div style={{width:42,height:42,borderRadius:10,background:uc.light,border:`1px solid ${uc.border}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{UcIcon && <UcIcon size={22} color={uc.color}/>}</div>
              <div>
                <div className={isAr?'ar':''} style={{fontFamily:isAr?"'Noto Kufi Arabic',sans-serif":font.display,fontWeight:800,fontSize:17,color:C.navy}}>{s.ucTitles[selectedUC]} — {s.ucSubtitles[selectedUC]}</div>
                <div style={{fontSize:11,color:C.muted,display:'flex',alignItems:'center',gap:4,marginTop:2}}><MapPin size={10} color={C.muted}/><span style={{fontFamily:font.mono}}>est. {s.ucTimes[selectedUC]}</span></div>
              </div>
            </div>
            <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:5}}>
              <div style={{fontSize:11,color:C.muted,fontFamily:font.mono}}>{s.demo.step} {step+1} {s.demo.of} {ucSteps.length}</div>
              <div style={{width:180,height:6,background:C.surfaceAlt,borderRadius:3,overflow:'hidden',border:`1px solid ${C.border}`}}><div style={{height:'100%',width:`${((step+1)/ucSteps.length)*100}%`,background:`linear-gradient(90deg,${uc.color},${C.amberAccent})`,borderRadius:3,transition:'width 0.4s ease'}}/></div>
            </div>
          </div>

          {/* Stepper + Panel */}
          <div style={{display:'grid',gridTemplateColumns:'210px 1fr',gap:14}}>
            {/* Stepper */}
            <div style={{display:'flex',flexDirection:'column',gap:4}}>
              {ucSteps.map((stepTitle,i)=>{const active=i===step,done=completed.includes(i);const SI=stepIcons[i]||CheckCircle;return(
                <div key={i} className="step-node" onClick={()=>goTo(i)} style={{padding:'10px 12px',borderRadius:10,border:`1px solid ${active?uc.color:done?C.greenBorder:C.border}`,background:active?uc.light:done?C.greenLight:C.surface,boxShadow:active?C.shadow:'none',borderLeft:`3px solid ${active?uc.color:done?C.green:C.border}`}}>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <div style={{width:24,height:24,borderRadius:'50%',background:done?C.green:active?uc.color:C.surfaceAlt,border:`1px solid ${done?C.green:active?uc.color:C.borderMid}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                      {done?<CheckCircle size={13} color="#fff"/>:<SI size={12} color={active?'#fff':C.muted}/>}
                    </div>
                    <div className={isAr?'ar':''} style={{fontSize:11,fontWeight:active?700:done?600:500,color:active?C.text:done?C.textMid:C.muted,lineHeight:1.35}}>{stepTitle}</div>
                  </div>
                  <div style={{marginTop:5,marginLeft:32}}>
                    <div style={{fontSize:9,color:C.mutedLight,fontFamily:font.mono}}>{ucDepts[i]}</div>
                    <div style={{fontSize:9,color:active?uc.color:C.mutedLight,fontWeight:active?600:400,fontFamily:font.mono}}>{ucEsts[i]}</div>
                  </div>
                </div>
              );})}
              <div style={{marginTop:8,padding:'10px 12px',background:C.surfaceAlt,border:`1px solid ${C.border}`,borderRadius:10,textAlign:'center'}}>
                <div style={{fontSize:12,fontWeight:700,color:uc.color}}>{completed.length} / {ucSteps.length}</div>
                <div className={isAr?'ar':''} style={{fontSize:9,color:C.muted,marginTop:2}}>{s.demo.stepsCompleted}</div>
              </div>
            </div>

            {/* Content Panel */}
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              {!allDone && (
                <div style={{padding:'12px 16px',background:C.surface,borderRadius:12,border:`1px solid ${C.border}`,boxShadow:C.shadow,display:'flex',alignItems:'center',gap:12}}>
                  <div style={{width:40,height:40,borderRadius:10,background:uc.light,border:`1px solid ${uc.border}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    {stepIcons[step] && (()=>{const I=stepIcons[step];return <I size={20} color={uc.color}/>;})()}
                  </div>
                  <div style={{flex:1}}>
                    <div className={isAr?'ar':''} style={{fontFamily:isAr?"'Noto Kufi Arabic',sans-serif":font.display,fontWeight:700,fontSize:17,color:C.navy}}>{ucSteps[step]}</div>
                    <div style={{fontSize:11,color:C.muted,marginTop:2,fontFamily:font.mono}}>{ucDepts[step]} · {ucEsts[step]}</div>
                  </div>
                  <div style={{padding:'5px 12px',background:uc.light,border:`1px solid ${uc.border}`,borderRadius:8,textAlign:'center',flexShrink:0}}>
                    <div style={{fontSize:9,color:C.muted,fontFamily:font.mono}}>{s.demo.step}</div>
                    <div style={{fontSize:14,fontWeight:800,color:uc.color,fontFamily:font.display}}>{step+1}/{ucSteps.length}</div>
                  </div>
                </div>
              )}

              {allDone ? (
                <div className="done-anim" style={{padding:36,background:C.surface,borderRadius:14,border:`2px solid ${C.greenBorder}`,textAlign:'center',boxShadow:C.shadowMd}}>
                  <div style={{width:64,height:64,borderRadius:'50%',background:C.greenLight,border:`2px solid ${C.greenBorder}`,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px'}}><CheckCircle size={30} color={C.green}/></div>
                  <div className={isAr?'ar':''} style={{fontFamily:isAr?"'Noto Kufi Arabic',sans-serif":font.display,fontWeight:800,fontSize:26,color:C.green,marginBottom:8}}>{s.demo.flowCompleted}</div>
                  <div className={isAr?'ar':''} style={{fontSize:13,color:C.muted,maxWidth:380,margin:'0 auto 24px',lineHeight:1.7}}>{s.demo.flowCompletedDesc} <span style={{color:uc.color,fontWeight:700}}>{s.ucTitles[selectedUC]}</span> {s.demo.flowCompletedDesc2}</div>
                  <SummaryKPIs items={[{label:s.kpiLabels[0],val:ucSteps.length,Icon:CheckCircle,color:C.green},{label:s.kpiLabels[1],val:s.ucTimes[selectedUC],Icon:Clock,color:C.teal},{label:s.kpiLabels[2],val:'60–80%',Icon:Bot,color:C.teal},{label:s.kpiLabels[3],val:isAr?'صفر':'Zero',Icon:Zap,color:C.amber}]}/>
                  <div style={{display:'flex',gap:10,marginTop:20,justifyContent:'center',flexWrap:'wrap'}}>
                    <button className="btn" onClick={goSelect} style={{padding:'11px 22px',borderRadius:9,border:`1px solid ${C.border}`,background:C.surface,color:C.text,cursor:'pointer',fontSize:13,fontWeight:600,fontFamily:isAr?"'Noto Kufi Arabic',sans-serif":font.body,display:'flex',alignItems:'center',gap:6}}>
                      <ChevronLeft size={15}/> {s.demo.tryAnother}
                    </button>
                    <button className="btn" onClick={()=>{setStep(0);setCompleted([]);}} style={{padding:'11px 22px',borderRadius:9,border:'none',background:`linear-gradient(135deg,${C.green},#0F6A30)`,color:'#fff',cursor:'pointer',fontSize:13,fontWeight:700,fontFamily:isAr?"'Noto Kufi Arabic',sans-serif":font.body,display:'flex',alignItems:'center',gap:6}}>
                      <RotateCcw size={15}/> {s.demo.replayFlow}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="fade" style={{overflowY:'auto',maxHeight:600,opacity:visible?1:0}}>
                  {/* Atmet AI Capability Panel */}
                  <AtmetAIPanel ucId={selectedUC} stepIdx={step} lang={lang}/>
                  {/* Step Content */}
                  <div style={{padding:18,background:C.surface,borderRadius:12,border:`1px solid ${C.border}`,boxShadow:C.shadow}}>
                    {renderContent(selectedUC, step, lang)}
                  </div>
                </div>
              )}

              {!allDone && (
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0'}}>
                  <button className="btn" onClick={()=>goTo(step-1)} disabled={step===0} style={{padding:'10px 20px',borderRadius:9,border:`1px solid ${C.border}`,background:C.surface,color:step===0?C.mutedLight:C.textMid,cursor:step===0?'default':'pointer',fontSize:13,fontWeight:600,fontFamily:isAr?"'Noto Kufi Arabic',sans-serif":font.body,display:'flex',alignItems:'center',gap:6,boxShadow:step===0?'none':C.shadow}}>
                    <ChevronLeft size={15}/> {s.demo.prev}
                  </button>
                  <div className={isAr?'ar':''} style={{fontSize:11,color:C.muted}}>{completed.includes(step)?s.demo.stepComplete:s.demo.clickNext}</div>
                  {step<ucSteps.length-1?(
                    <button className="btn" onClick={nextStep} style={{padding:'10px 24px',borderRadius:9,border:'none',cursor:'pointer',fontSize:13,fontWeight:700,background:`linear-gradient(135deg,${uc.color},${C.navyMid})`,color:'#fff',fontFamily:isAr?"'Noto Kufi Arabic',sans-serif":font.body,display:'flex',alignItems:'center',gap:6,boxShadow:C.shadowMd}}>
                      {s.demo.nextStep} <ChevronRight size={15}/>
                    </button>
                  ):(
                    <button className="btn" onClick={nextStep} style={{padding:'10px 24px',borderRadius:9,border:'none',cursor:'pointer',fontSize:13,fontWeight:700,background:`linear-gradient(135deg,${C.green},#0F6A30)`,color:'#fff',fontFamily:isAr?"'Noto Kufi Arabic',sans-serif":font.body,display:'flex',alignItems:'center',gap:6,boxShadow:C.shadowMd}}>
                      {s.demo.completeFlow} <CheckCircle size={15}/>
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
