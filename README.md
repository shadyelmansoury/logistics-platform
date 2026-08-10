# Gameea — جمعية

A bilingual (Arabic-first, RTL + English) web app for organizing a **Gameea** — the
Egyptian rotating savings circle. A group of people who trust each other agree on a
fixed monthly amount; every month all members pay that amount to one member, taking
turns until every member has had their payout month.

The app has two backends behind the same code:

- **Supabase mode (real backend)** — accounts, groups, and payments live in a
  Postgres database with authentication, so members on different devices share
  the same groups, with live updates. Active when Supabase keys are configured
  (setup below).
- **Demo mode (fallback)** — no keys configured: everything stays in the
  browser's `localStorage`, single-browser only. The app shows a "demo mode"
  note in the footer.

## Features

- **Accounts** — register with name, email, and phone; log in / log out.
- **Create a group** — whoever creates a group becomes its **admin** and defines:
  - the fixed monthly amount and currency (EGP, USD, EUR, SAR, AED)
  - the **max number of members** (which equals the number of months the Gameea runs)
  - the first payout month
- **Join with admin approval** — members ask to join; the group admin gives the
  final OK (approve / reject) for every request. Full groups can't be joined.
- **Pick your month** — each member selects an available payout month that no one
  else has taken. That's the month they receive the pot from everyone — and they
  don't pay that month. Months can be changed while the group is still forming.
- **Schedule** — a month-by-month timeline showing who receives when, the pot per
  turn (monthly amount × (members − 1)), and the current month.
- **Payments tracking** — per month, every payer can mark their payment as paid;
  the admin can mark anyone's. Progress is shown per turn.
- **Admin panel** — approve/reject join requests, edit group details, change max
  members (never below current members or taken months), remove members, delete
  the group.
- **Arabic / English toggle** — full RTL support, Egyptian Arabic wording.

## Set up the real backend (Supabase — ~10 minutes, free tier)

1. **Create a project** at [supabase.com](https://supabase.com) (free account →
   "New project"; pick any name, database password, and region near you).
2. **Create the database schema**: in the dashboard open **SQL Editor → New
   query**, paste the entire contents of [`supabase/schema.sql`](supabase/schema.sql),
   and click **Run**. This creates the tables, security rules (row-level
   security so only admins can approve members, only payers can mark their own
   payments, etc.), and live-update wiring.
3. **Get your keys**: **Settings → API** — copy the *Project URL* and the
   *anon public* key.
4. **Configure the app**: copy `.env.example` to `.env.local` and paste the two
   values. For deployed sites, add the same two variables in
   Netlify/Vercel → Site settings → Environment variables, then redeploy.
5. *(Recommended for quick testing)* In **Authentication → Sign In / Providers → Email**,
   turn **off** "Confirm email" so testers can register and log in instantly.
   Leave it on in production — the app handles the "check your email" flow too.

That's it — the same build now runs multi-user: people register on their own
phones, ask to join, and the admin approves from theirs, with changes appearing
live on all devices.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Deploy

Standard Vite build — works out of the box on Netlify (`netlify.toml`) and
Vercel (`vercel.json`). Remember to set the two `VITE_SUPABASE_*` environment
variables in the host's settings, otherwise the deployed site runs in demo mode.

```bash
npm run build   # output in dist/
```

## Project structure

```
├── index.html                    # Entry HTML (RTL, Arabic + Latin fonts)
├── supabase/
│   └── schema.sql                # Database schema + security rules (run once in Supabase)
├── src/
│   ├── main.jsx                  # React entry point
│   ├── App.jsx                   # Shell: navbar, language toggle, routing
│   ├── store.js                  # Data layer facade — picks Supabase or demo mode
│   ├── backend/
│   │   ├── helpers.js            # Gameea rules shared by both backends
│   │   ├── supabaseStore.js      # Real backend: Supabase auth + Postgres + realtime
│   │   └── localStore.js         # Demo backend: localStorage
│   ├── i18n.js                   # English + Egyptian Arabic translations
│   ├── theme.js                  # Design tokens
│   └── components/
│       ├── Auth.jsx              # Register / login
│       ├── Dashboard.jsx         # My groups + discoverable groups
│       ├── CreateGroup.jsx       # New group form (admin setup)
│       ├── GroupDetail.jsx       # Schedule, month picker, payments, members, admin panel
│       └── ui.jsx                # Shared UI primitives
├── package.json
└── vite.config.js
```

## How the backend enforces the rules

Security lives in the database (`supabase/schema.sql`), not just the UI:

- Row-level security: only the group admin can add members (the approval step),
  edit or delete the group; members can only update their own month or leave;
  payers can only mark their own payments (admin can mark anyone's).
- A unique index guarantees two members can never take the same payout month,
  even if they tap at the same instant on different phones.
- A database trigger blocks joining beyond the admin's max-members limit.
- Passwords and sessions are handled by Supabase Auth (email + password, with
  optional email confirmation).

## Tech stack

- React 18 + Vite
- Supabase (auth, Postgres, realtime) — optional, falls back to localStorage
- Lucide React (icons)
- DM Sans + Barlow Condensed + DM Mono + Noto Kufi Arabic (Google Fonts)
