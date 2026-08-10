import { useState, useSyncExternalStore } from 'react';
import { Languages, LogOut, HandCoins } from 'lucide-react';
import { C, font } from './theme.js';
import { S } from './i18n.js';
import * as store from './store.js';
import Auth from './components/Auth.jsx';
import Dashboard from './components/Dashboard.jsx';
import CreateGroup from './components/CreateGroup.jsx';
import GroupDetail from './components/GroupDetail.jsx';
import { Btn, Avatar } from './components/ui.jsx';

export default function App() {
  const db = useSyncExternalStore(store.subscribe, store.getDB);
  const [lang, setLang] = useState('ar');
  const [view, setView] = useState({ name: 'dashboard' });
  const s = S[lang];
  const user = store.currentUser(db);

  const goHome = () => setView({ name: 'dashboard' });
  const openGroup = (id) => setView({ name: 'group', id });

  return (
    <div dir={s.dir} style={{ minHeight: '100vh', background: C.bg, fontFamily: font.body, color: C.ink }}>
      {/* Navbar */}
      <nav style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, boxShadow: C.shadow,
        position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '12px 20px',
          display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={goHome} style={{ display: 'flex', alignItems: 'center', gap: 9, background: 'none',
            border: 'none', cursor: 'pointer', padding: 0 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: C.primary,
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <HandCoins size={18} color="#fff" />
            </div>
            <span style={{ fontSize: 20, fontWeight: 800, color: C.ink, fontFamily: font.display }}>
              {s.appName}
            </span>
          </button>
          <div style={{ flex: 1 }} />
          <Btn variant="ghost" size="sm" onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
            style={{ color: C.primary, fontWeight: 700 }}>
            <Languages size={14} style={{ verticalAlign: -2 }} /> {lang === 'en' ? 'العربية' : 'English'}
          </Btn>
          {user && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Avatar name={user.name} size={30} />
                <span style={{ fontSize: 13, fontWeight: 700, color: C.inkMid }}>{user.name}</span>
              </div>
              <Btn variant="ghost" size="sm" onClick={() => { store.logout(); goHome(); }}>
                <LogOut size={14} style={{ verticalAlign: -2 }} /> {s.nav.logout}
              </Btn>
            </>
          )}
        </div>
      </nav>

      {/* Content */}
      {!user ? (
        <Auth s={s} />
      ) : view.name === 'create' ? (
        <CreateGroup user={user} s={s} lang={lang} onDone={openGroup} onBack={goHome} />
      ) : view.name === 'group' ? (
        <GroupDetail db={db} groupId={view.id} user={user} s={s} lang={lang} onBack={goHome} />
      ) : (
        <Dashboard db={db} user={user} s={s} lang={lang}
          onOpen={openGroup} onCreate={() => setView({ name: 'create' })} />
      )}

      <footer style={{ textAlign: 'center', padding: '30px 20px', fontSize: 11, color: C.mutedLight }}>
        {s.appName} · {s.appNameAr} — {s.tagline}
      </footer>
    </div>
  );
}
