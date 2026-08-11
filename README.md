# Gam3ya — جمعية

A bilingual (Arabic-first, RTL + English) web app for organizing a **Gam3ya
(جمعية)** — the Egyptian rotating savings circle. A group of people who trust
each other agree on a fixed monthly amount; every month all members pay that
amount to one member, taking turns until every member has had their payout month.

The app has two backends behind the same code:

- **Supabase mode (real backend)** — accounts, groups, and payments live in a
  Postgres database with authentication, so members on different devices share
  the same groups, with live updates. Active when Supabase keys are configured
  (setup below).
- **Demo mode (fallback)** — no keys configured: everything stays in the
  browser's `localStorage`, single-browser only. The app shows a "demo mode"
  note in the footer.

## Features

- **Accounts** — register with first and last name, phone number, email, and a
  dedicated **e-Transfer email** (the address linked to the member's bank
  account — shown to payers so they know where to send each month's transfer;
  defaults to the login email).
- **Two-factor authentication (2FA)** — any user can enable TOTP 2FA
  (Google Authenticator / Authy) from their profile's Security section; login
  then requires the 6-digit code, and database policies block all data access
  until the second factor is verified. Recommended for group admins. (Live
  backend only.)
- **Profile page** — members edit their names, phone, and e-transfer email;
  admins reviewing join requests see the applicant's contact details.
- **Month splitting** — two members (max) can share one month: each pays half
  the monthly dues and receives half that month's pot. The database enforces
  the two-half limit.
- **Group creation is admin-only** — only platform admins can create groups
  (enforced by database policy); members join existing groups by request.
- **Approval-gated month changes** — a member's first month pick is direct, but
  changing an already-confirmed month files a request that the group admin must
  approve before it takes effect.
- **Admin attention alerts** — group admins see a "Needs your attention" card
  on their dashboard aggregating pending join requests, month-change requests,
  and members who haven't paid the current month.
- **Payment confirmation & overdue tracking** — every member gets a
  "This month's payments" card to confirm their dues (early confirmation
  before the month starts is allowed). From the 2nd of the month, unpaid
  members are flagged overdue in red for them and their admin; the admin
  console shows paid counts per group.
- **Daily reminders (email + SMS)** — a scheduled job runs every morning and
  notifies unpaid members from the 2nd of the month until they mark their
  payment, plus a summary to the group admin. See "Payment reminders" below.
- **Platform admin** — accounts with `role = 'admin'` get a moderation console:
  hide any group from discovery, disable (freeze) any group, edit any group's
  settings, and delete any group or user platform-wide. All of it enforced by
  database policies, not just the UI. Promote an admin with:
  `update public.profiles set role = 'admin' where email = 'you@example.com';`
- **Create a group** — whoever creates a group becomes its **admin** and defines:
  - the fixed monthly amount and currency (EGP, USD, EUR, SAR, AED)
  - the **max number of members** (which equals the number of months the Gam3ya runs)
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
- **Arabic / English toggle** — full RTL support, Egyptian Arabic wording, and a
  single type family (IBM Plex Sans Arabic) that treats both scripts as equals.
- **Light & dark mode** — follows the device preference by default, with a manual
  toggle that's remembered per browser.
- **Mobile-first** — responsive layout, 44px touch targets, sticky nav, and
  numeric keyboards on amount fields.
- **Share-ready** — Open Graph / Twitter metadata with a branded preview image,
  so links shared on WhatsApp show the app name, description, and card image.
  (`og:image` uses a relative URL that WhatsApp's crawler resolves against your
  deployed domain — no configuration needed.)

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

## Payment reminders (email + SMS)

The daily reminder pipeline is: `pg_cron` (schedule) → `payment-reminders`
edge function (`supabase/functions/payment-reminders/`) → `overdue_payers()`
SQL → Resend (email) / Twilio (SMS) → `notification_log` (audit + in-app).
Every send is deduplicated per person/channel/day and stops automatically
once the payment is marked in the app.

Delivery is activated by setting these edge-function secrets
(Dashboard → Edge Functions → payment-reminders → Secrets, or
`supabase secrets set`):

| Secret | Purpose |
| --- | --- |
| `CRON_SECRET` | Shared secret the cron job authenticates with (required) |
| `APP_URL` | Link included in messages |
| `RESEND_API_KEY` | [resend.com](https://resend.com) API key — activates email |
| `EMAIL_FROM` | Verified sender, e.g. `Gam3ya <alerts@yourdomain.com>` |
| `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` / `TWILIO_FROM` | [twilio.com](https://twilio.com) credentials + sending number — activates SMS |

Without provider keys the job still runs: in-app alerts work and the log
records email/SMS as "skipped", so nothing is silently lost. Schedule (once,
in the SQL editor — replace the secret):

```sql
create extension if not exists pg_cron;
create extension if not exists pg_net;
select cron.schedule('gam3ya-payment-reminders', '0 7 * * *',
  $$select net.http_post(
      url := 'https://YOUR-REF.supabase.co/functions/v1/payment-reminders',
      headers := jsonb_build_object('x-cron-secret', 'YOUR-CRON-SECRET',
                                    'Content-Type', 'application/json'),
      body := '{}'::jsonb)$$);
```

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
├── index.html                    # Entry HTML: share metadata, icons, fonts
├── public/
│   ├── favicon.svg               # Brand mark (rotation circle around a shared pot)
│   ├── og-image.png              # WhatsApp / social share preview card
│   └── apple-touch-icon.png      # iOS home-screen icon
├── supabase/
│   └── schema.sql                # Database schema + security rules (run once in Supabase)
├── src/
│   ├── main.jsx                  # React entry point
│   ├── App.jsx                   # Shell: navbar, language toggle, routing
│   ├── store.js                  # Data layer facade — picks Supabase or demo mode
│   ├── backend/
│   │   ├── helpers.js            # Gam3ya rules shared by both backends
│   │   ├── supabaseStore.js      # Real backend: Supabase auth + Postgres + realtime
│   │   └── localStore.js         # Demo backend: localStorage
│   ├── i18n.js                   # English + Egyptian Arabic translations
│   ├── styles.css                # Design system: tokens, light/dark themes, components
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
- 2FA is enforced in the database: a restrictive policy (`mfa_ok()`) denies all
  reads and writes to a session that hasn't completed the TOTP challenge, for
  any account with an enrolled factor.

Existing installs upgrade with the numbered files in `supabase/`
(`upgrade-002.sql`, then `upgrade-003.sql`) — fresh installs only need
`schema.sql`, which always contains the full current schema.

## Tech stack

- React 18 + Vite
- Supabase (auth, Postgres, realtime) — optional, falls back to localStorage
- Lucide React (icons)
- IBM Plex Sans Arabic + IBM Plex Mono (Google Fonts) — one family for Arabic and Latin
