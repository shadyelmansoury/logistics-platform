-- Gameea database schema for Supabase
-- Run this once in the Supabase SQL Editor (Dashboard → SQL Editor → New query).

create extension if not exists pgcrypto;

-- ─── Tables ───────────────────────────────────────────────────────────────────

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  first_name text not null default '',
  last_name text not null default '',
  email text not null default '',
  phone text not null default '',
  -- The email linked to the member's bank account for e-transfers:
  -- payers send the monthly amount to this address.
  etransfer_email text not null default '',
  created_at timestamptz not null default now()
);

create table public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  amount numeric not null check (amount > 0),
  currency text not null default 'EGP',
  max_members int not null check (max_members between 2 and 36),
  start_month text not null check (start_month ~ '^\d{4}-\d{2}$'),
  admin_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.group_members (
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  month text check (month ~ '^\d{4}-\d{2}$'),
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

-- One payout month per group: two members can never hold the same month
create unique index group_members_unique_month
  on public.group_members (group_id, month) where month is not null;

create table public.join_requests (
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  requested_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

create table public.payments (
  group_id uuid not null references public.groups(id) on delete cascade,
  month text not null check (month ~ '^\d{4}-\d{2}$'),
  payer_id uuid not null references public.profiles(id) on delete cascade,
  paid_at timestamptz not null default now(),
  primary key (group_id, month, payer_id)
);

-- ─── Automatic profile creation on signup ─────────────────────────────────────

create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, first_name, last_name, email, phone, etransfer_email)
  values (
    new.id,
    trim(coalesce(new.raw_user_meta_data->>'first_name', '') || ' ' ||
         coalesce(new.raw_user_meta_data->>'last_name', '')),
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    coalesce(new.raw_user_meta_data->>'etransfer_email', coalesce(new.email, ''))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── Capacity guard: a group can never exceed max_members ─────────────────────

create or replace function public.check_group_capacity()
returns trigger
language plpgsql
as $$
declare
  cap int;
  cnt int;
begin
  select max_members into cap from public.groups where id = new.group_id;
  select count(*) into cnt from public.group_members where group_id = new.group_id;
  if cnt >= cap then
    raise exception 'group is full';
  end if;
  return new;
end;
$$;

create trigger group_capacity
  before insert on public.group_members
  for each row execute function public.check_group_capacity();

-- ─── Row Level Security ───────────────────────────────────────────────────────

create or replace function public.is_group_admin(gid uuid)
returns boolean
language sql security definer stable set search_path = public
as $$
  select exists (select 1 from public.groups where id = gid and admin_id = auth.uid());
$$;

alter table public.profiles      enable row level security;
alter table public.groups        enable row level security;
alter table public.group_members enable row level security;
alter table public.join_requests enable row level security;
alter table public.payments      enable row level security;

-- Profiles: any signed-in user can see names/contacts (needed for member lists
-- and for admins reviewing join requests); only the owner can edit their own.
create policy "profiles_select" on public.profiles
  for select to authenticated using (true);
create policy "profiles_update_own" on public.profiles
  for update to authenticated using (id = auth.uid());

-- Groups: visible to all signed-in users (discovery); only the creator can
-- create as admin, and only the admin can edit or delete.
create policy "groups_select" on public.groups
  for select to authenticated using (true);
create policy "groups_insert_own" on public.groups
  for insert to authenticated with check (admin_id = auth.uid());
create policy "groups_update_admin" on public.groups
  for update to authenticated using (admin_id = auth.uid());
create policy "groups_delete_admin" on public.groups
  for delete to authenticated using (admin_id = auth.uid());

-- Members: only the group admin adds members (that's the approval step —
-- including adding themselves when creating the group). A member can update
-- their own row (picking a month) and leave; the admin can do both for anyone.
create policy "members_select" on public.group_members
  for select to authenticated using (true);
create policy "members_insert_admin" on public.group_members
  for insert to authenticated with check (public.is_group_admin(group_id));
create policy "members_update" on public.group_members
  for update to authenticated using (user_id = auth.uid() or public.is_group_admin(group_id));
create policy "members_delete" on public.group_members
  for delete to authenticated using (user_id = auth.uid() or public.is_group_admin(group_id));

-- Join requests: users file their own; the requester can cancel, the admin
-- can reject (delete) or approve (insert into group_members + delete request).
create policy "requests_select" on public.join_requests
  for select to authenticated using (true);
create policy "requests_insert_own" on public.join_requests
  for insert to authenticated with check (user_id = auth.uid());
create policy "requests_delete" on public.join_requests
  for delete to authenticated using (user_id = auth.uid() or public.is_group_admin(group_id));

-- Payments: a payer marks/unmarks their own; the admin can mark anyone's.
create policy "payments_select" on public.payments
  for select to authenticated using (true);
create policy "payments_insert" on public.payments
  for insert to authenticated with check (payer_id = auth.uid() or public.is_group_admin(group_id));
create policy "payments_delete" on public.payments
  for delete to authenticated using (payer_id = auth.uid() or public.is_group_admin(group_id));

-- ─── Two-factor authentication enforcement ────────────────────────────────────
-- A user who has enrolled a verified TOTP factor must complete the 2FA
-- challenge (aal2) before any data is readable or writable — the second
-- factor protects the data itself, not just the login screen.

create or replace function public.mfa_ok()
returns boolean
language sql stable security definer set search_path = public
as $$
  select coalesce((select auth.jwt()->>'aal') = 'aal2', false)
      or not exists (
        select 1 from auth.mfa_factors
        where user_id = auth.uid() and status = 'verified'
      );
$$;

create policy "mfa_profiles" on public.profiles
  as restrictive for all to authenticated using (public.mfa_ok());
create policy "mfa_groups" on public.groups
  as restrictive for all to authenticated using (public.mfa_ok());
create policy "mfa_group_members" on public.group_members
  as restrictive for all to authenticated using (public.mfa_ok());
create policy "mfa_join_requests" on public.join_requests
  as restrictive for all to authenticated using (public.mfa_ok());
create policy "mfa_payments" on public.payments
  as restrictive for all to authenticated using (public.mfa_ok());

-- ─── Realtime: push table changes to connected clients ────────────────────────

alter publication supabase_realtime add table
  public.profiles, public.groups, public.group_members,
  public.join_requests, public.payments;
