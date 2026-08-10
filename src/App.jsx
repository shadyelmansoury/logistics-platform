import { useEffect, useState, useSyncExternalStore } from 'react';
import { Languages, LogOut, Sun, Moon } from 'lucide-react';
import { S } from './i18n.js';
import * as store from './store.js';
import Auth from './components/Auth.jsx';
import MfaGate from './components/MfaGate.jsx';
import Dashboard from './components/Dashboard.jsx';
import CreateGroup from './components/CreateGroup.jsx';
import GroupDetail from './components/GroupDetail.jsx';
import Account from './components/Account.jsx';
import { Avatar, Logo } from './components/ui.jsx';

const LANG_KEY = 'gam3ya_lang';
const THEME_KEY = 'gam3ya_theme';

const initialLang = () => {
  try { return localStorage.getItem(LANG_KEY) === 'en' ? 'en' : 'ar'; } catch { return 'ar'; }
};

const initialTheme = () => {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch { /* storage blocked */ }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export default function App() {
  const db = useSyncExternalStore(store.subscribe, store.getDB);
  const [lang, setLang] = useState(initialLang);
  const [theme, setTheme] = useState(initialTheme);
  const [view, setView] = useState({ name: 'dashboard' });
  const s = S[lang];
  const user = store.currentUser(db);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('lang', lang);
    root.setAttribute('dir', s.dir);
    try { localStorage.setItem(LANG_KEY, lang); } catch { /* storage blocked */ }
  }, [lang, s.dir]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch { /* storage blocked */ }
  }, [theme]);

  const goHome = () => setView({ name: 'dashboard' });
  const openGroup = (id) => setView({ name: 'group', id });

  return (
    <>
      <nav className="nav">
        <div className="nav-inner">
          <button className="nav-brand" onClick={goHome} aria-label={s.appName}>
            <Logo size={34} />
            <span className="nav-brand-name">{s.appName}</span>
          </button>
          <span className="nav-spacer" />
          <button
            className="icon-btn"
            onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
            aria-label={s.nav.language}
          >
            <Languages size={16} />
            <span className="icon-btn-label">{s.nav.language}</span>
          </button>
          <button
            className="icon-btn"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label={theme === 'dark' ? s.nav.lightMode : s.nav.darkMode}
            title={theme === 'dark' ? s.nav.lightMode : s.nav.darkMode}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          {user && (
            <>
              <button
                className="icon-btn nav-user"
                onClick={() => setView({ name: 'account' })}
                aria-label={s.nav.account}
                title={s.nav.account}
              >
                <Avatar name={user.name} size={30} />
                <span className="nav-user-name">{user.name}</span>
              </button>
              <button className="icon-btn" onClick={() => { store.logout(); goHome(); }} aria-label={s.nav.logout}>
                <LogOut size={16} />
                <span className="icon-btn-label">{s.nav.logout}</span>
              </button>
            </>
          )}
        </div>
      </nav>

      {db.loading ? (
        <div className="loading-screen">{s.common.loading}</div>
      ) : db.mfaPending ? (
        <MfaGate s={s} />
      ) : !user ? (
        <Auth s={s} />
      ) : view.name === 'account' ? (
        <Account user={user} s={s} onBack={goHome} />
      ) : view.name === 'create' ? (
        <CreateGroup user={user} s={s} lang={lang} onDone={openGroup} onBack={goHome} />
      ) : view.name === 'group' ? (
        <GroupDetail db={db} groupId={view.id} user={user} s={s} lang={lang} onBack={goHome} />
      ) : (
        <Dashboard db={db} user={user} s={s} lang={lang}
          onOpen={openGroup} onCreate={() => setView({ name: 'create' })} />
      )}

      <footer className="footer">
        {s.appName} · {s.appNameAr} — {s.tagline}
        {store.backend === 'local' && <div>{s.common.demoMode}</div>}
      </footer>
    </>
  );
}
