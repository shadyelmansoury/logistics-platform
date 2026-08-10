# Gameea — جمعية

A bilingual (Arabic-first, RTL + English) web app for organizing a **Gameea** — the
Egyptian rotating savings circle. A group of people who trust each other agree on a
fixed monthly amount; every month all members pay that amount to one member, taking
turns until every member has had their payout month.

## Features

- **Accounts** — register with name, email, and phone; log in / log out.
  (Demo persistence: all data is stored in the browser's `localStorage`.)
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

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Deploy

Standard Vite build — works out of the box on Netlify (`netlify.toml`) and
Vercel (`vercel.json`):

```bash
npm run build   # output in dist/
```

## Project structure

```
├── index.html                    # Entry HTML (RTL, Arabic + Latin fonts)
├── src/
│   ├── main.jsx                  # React entry point
│   ├── App.jsx                   # Shell: navbar, language toggle, routing
│   ├── store.js                  # Data layer (localStorage) + Gameea rules
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

## Notes on the demo data layer

This is a frontend demo: accounts, groups, and payments live in `localStorage`
(per browser). Passwords are hashed with SHA-256 before storage, but there is no
server — to run a real multi-user Gameea, plug `src/store.js` into a backend
(e.g. Supabase/Firebase or a REST API); the rest of the app talks only to the
functions exported there.

## Tech stack

- React 18 + Vite
- Lucide React (icons)
- DM Sans + Barlow Condensed + DM Mono + Noto Kufi Arabic (Google Fonts)
- No other dependencies
