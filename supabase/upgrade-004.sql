-- Upgrade 004: restricted group creation, approval-gated month changes,
-- and the payment-reminder infrastructure.
-- Run after upgrade-003 (fresh installs: schema.sql has everything).

-- ─── Only platform admins can create groups ───────────────────────────────────

drop policy if exists "groups_insert_own" on public.groups;
create policy "groups_insert_own" on public.groups
  for insert to authenticated
  with check (admin_id = auth.uid() and public.is_platform_admin());

-- ─── Month-change requests (changes after confirmation need admin approval) ──

create table if not exists public.month_change_requests (
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  month text not null check (month ~ '^\d{4}-\d{2}$'),
  share numeric not null default 1 check (share in (0.5, 1)),
  requested_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

alter table public.month_change_requests enable row level security;

drop policy if exists "mcr_select" on public.month_change_requests;
create policy "mcr_select" on public.month_change_requests
  for select to authenticated using (true);

-- A member may file a change request for their own membership in an
-- enabled group.
drop policy if exists "mcr_insert_own" on public.month_change_requests;
create policy "mcr_insert_own" on public.month_change_requests
  for insert to authenticated with check (
    user_id = auth.uid()
    and exists (select 1 from public.group_members gm
                where gm.group_id = month_change_requests.group_id
                  and gm.user_id = auth.uid())
    and not exists (select 1 from public.groups g
                    where g.id = group_id and g.disabled)
  );

drop policy if exists "mcr_delete" on public.month_change_requests;
create policy "mcr_delete" on public.month_change_requests
  for delete to authenticated using (
    user_id = auth.uid()
    or public.is_group_admin(group_id)
    or public.is_platform_admin()
  );

drop policy if exists "mfa_mcr" on public.month_change_requests;
create policy "mfa_mcr" on public.month_change_requests
  as restrictive for all to authenticated using (public.mfa_ok());

alter publication supabase_realtime add table public.month_change_requests;

-- ─── Notification log (in-app alert history + delivery audit) ─────────────────

create table if not exists public.notification_log (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('overdue_user', 'overdue_admin')),
  group_id uuid references public.groups(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  month text,
  channel text not null check (channel in ('inapp', 'email', 'sms')),
  status text not null default 'sent',
  detail text not null default '',
  sent_on date not null default current_date,
  created_at timestamptz not null default now()
);

alter table public.notification_log enable row level security;

-- Read: the affected user, their group admin, platform admins.
-- Writes happen only via the service role (edge function) — no client policy.
drop policy if exists "nlog_select" on public.notification_log;
create policy "nlog_select" on public.notification_log
  for select to authenticated using (
    user_id = auth.uid()
    or public.is_group_admin(group_id)
    or public.is_platform_admin()
  );

-- One reminder per person/channel/day
create unique index if not exists nlog_dedupe
  on public.notification_log (kind, channel, group_id, user_id, month, sent_on);

-- ─── Overdue payers (used by the daily reminder job) ──────────────────────────
-- A payer is overdue when: the group is enabled, the current calendar month is
-- one of the group's scheduled months, the member is not that month's
-- recipient, they have not confirmed payment for it, and today is the 2nd of
-- the month or later ("after the first day"). Paying early (before the month
-- starts) is always allowed and simply prevents ever appearing here.

create or replace function public.overdue_payers()
returns table (
  group_id uuid, group_name text, amount numeric, currency text,
  admin_id uuid, month text,
  user_id uuid, user_name text, email text, phone text, share numeric
)
language sql stable security definer set search_path = public
as $$
  with cur as (select to_char(current_date, 'YYYY-MM') as ym)
  select g.id, g.name, g.amount * gm.share, g.currency,
         g.admin_id, cur.ym,
         p.id, p.name, p.email, p.phone, gm.share
  from public.groups g
  cross join cur
  join public.group_members gm on gm.group_id = g.id
  join public.profiles p on p.id = gm.user_id
  where not g.disabled
    and extract(day from current_date) >= 2
    and cur.ym >= g.start_month
    and cur.ym < to_char((to_date(g.start_month || '-01', 'YYYY-MM-DD')
                          + make_interval(months => g.max_members)), 'YYYY-MM')
    and (gm.month is null or gm.month <> cur.ym)
    and not exists (
      select 1 from public.payments pay
      where pay.group_id = g.id and pay.month = cur.ym and pay.payer_id = gm.user_id
    );
$$;

revoke all on function public.overdue_payers() from public;
-- The service role bypasses RLS and can execute; clients compute their own
-- overdue view from data they can already read.
