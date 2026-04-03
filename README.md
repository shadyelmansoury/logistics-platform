# Qatar Digital Logistics Portal — Atmet AI POC

An interactive proof-of-concept demo for the TASMU Smart Qatar MCIT open tender.
Powered by Atmet AI — Arabic-first enterprise AI orchestration.

---

## Deploy in 2 Minutes (No Code Required)

### Option 1 — Netlify (Recommended — Easiest)

1. Go to **netlify.com** and create a free account
2. From the dashboard, click **"Add new site"** → **"Import an existing project"**
3. Click **"Deploy with GitHub"** — OR use the manual option below

**Manual drag-and-drop deploy:**
1. Open Terminal (Mac) or Command Prompt (Windows)
2. Run: `npm install` then `npm run build`
3. Go to **app.netlify.com/drop**
4. Drag the `dist/` folder onto the page
5. Your live URL is ready instantly (e.g. `https://amazing-demo-123.netlify.app`)

---

### Option 2 — Vercel (Also very easy)

1. Go to **vercel.com** and create a free account
2. Click **"Add New Project"** → **"Import Git Repository"**
   — OR install Vercel CLI and run `vercel` in this folder
3. Vercel auto-detects Vite and deploys instantly
4. You get a URL like `https://your-project.vercel.app`

---

### Option 3 — StackBlitz (Instant live URL, no account needed)

1. Go to **stackblitz.com/new/vite-react**
2. In the file explorer, replace `src/App.jsx` with the contents of `src/App.jsx` from this project
3. In `package.json`, ensure `"lucide-react": "^0.383.0"` is in dependencies
4. StackBlitz gives you a live shareable URL immediately

---

## Run Locally

```bash
npm install
npm run dev
```

Open http://localhost:5173

---

## Project Structure

```
logistics-portal/
├── index.html          # Entry HTML
├── src/
│   ├── main.jsx        # React entry point
│   └── App.jsx         # Full demo component
├── package.json        # Dependencies
├── vite.config.js      # Vite config
├── netlify.toml        # Netlify auto-deploy config
└── vercel.json         # Vercel auto-deploy config
```

---

## Tech Stack

- React 18 + Vite
- Lucide React (icons)
- DM Sans + Barlow Condensed + DM Mono (Google Fonts)
- No other dependencies

---

Built by Atmet AI — Arabic-first enterprise AI platform for the GCC.
