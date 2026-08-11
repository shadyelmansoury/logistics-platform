-- Upgrade 007: admin approval of new registrations + tightened visibility.
-- New accounts must be approved by a platform admin before they can see any
-- groups; profile details are only visible to people who share a group (or
-- to the admins who need them); new notification kinds cover the approval
-- flow. Fill in YOUR-PROJECT-REF / YOUR-CRON-SECRET before running.

-- ─── Registration approval flag ───────────────────────────────────────────────

alter table public.profiles
  add column if not exists approved boolean not null default false;

-- Grandfather everyone who registered before this upgrade
update public.profiles set approved = true;

-- ─── Helper functions (security definer: no RLS recursion) ────────────────────

create or replace function public.is_account_approved()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and (approved or role = 'admin')
  );
$$;

create or replace function public.is_group_member(gid uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.group_members
    where group_id = gid and user_id = auth.uid()
  );
$$;

create or replace function public.shares_group_with(target uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1
    from public.group_members mine
    join public.group_members theirs on theirs.group_id = mine.group_id
    where mine.user_id = auth.uid() and theirs.user_id = target
  );
$$;

-- ─── Profile visibility: need-to-know only ────────────────────────────────────
-- Own profile always; platform admins see all; approved users see people they
-- share a group with, admins of any group (discovery cards), and the group
-- admin sees profiles of people requesting to join their groups.

drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles
  for select to authenticated using (
    id = auth.uid()
    or public.is_platform_admin()
    or (
      public.is_account_approved()
      and (
        public.shares_group_with(id)
        or exists (select 1 from public.groups g where g.admin_id = profiles.id)
        or exists (select 1 from public.join_requests jr
                   join public.groups g on g.id = jr.group_id
                   where jr.user_id = profiles.id and g.admin_id = auth.uid())
        or exists (select 1 from public.group_members gm
                   join public.groups g on g.id = gm.group_id
                   where gm.user_id = profiles.id and g.admin_id = auth.uid())
      )
    )
  );

-- Platform admins can update any profile (needed to approve registrations)
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using (id = auth.uid() or public.is_platform_admin());

-- ─── Approval gate on all group data ──────────────────────────────────────────

drop policy if exists "approved_groups" on public.groups;
create policy "approved_groups" on public.groups
  as restrictive for all to authenticated using (public.is_account_approved());
drop policy if exists "approved_members" on public.group_members;
create policy "approved_members" on public.group_members
  as restrictive for all to authenticated using (public.is_account_approved());
drop policy if exists "approved_requests" on public.join_requests;
create policy "approved_requests" on public.join_requests
  as restrictive for all to authenticated using (public.is_account_approved());
drop policy if exists "approved_payments" on public.payments;
create policy "approved_payments" on public.payments
  as restrictive for all to authenticated using (public.is_account_approved());
drop policy if exists "approved_mcr" on public.month_change_requests;
create policy "approved_mcr" on public.month_change_requests
  as restrictive for all to authenticated using (public.is_account_approved());

-- Requests and payments are visible only to the people involved
drop policy if exists "requests_select" on public.join_requests;
create policy "requests_select" on public.join_requests
  for select to authenticated using (
    user_id = auth.uid()
    or public.is_group_admin(group_id)
    or public.is_platform_admin()
  );
drop policy if exists "mcr_select" on public.month_change_requests;
create policy "mcr_select" on public.month_change_requests
  for select to authenticated using (
    user_id = auth.uid()
    or public.is_group_admin(group_id)
    or public.is_platform_admin()
  );
drop policy if exists "payments_select" on public.payments;
create policy "payments_select" on public.payments
  for select to authenticated using (
    public.is_group_member(group_id)
    or public.is_group_admin(group_id)
    or public.is_platform_admin()
  );

-- ─── Notification kinds for the approval flow ─────────────────────────────────

alter table public.notification_log drop constraint if exists notification_log_kind_check;
alter table public.notification_log add constraint notification_log_kind_check
  check (kind in ('overdue_user', 'overdue_admin', 'join_request', 'member_joined',
                  'join_approved', 'account_pending', 'account_approved'));

-- ─── Account event triggers → group-events function ───────────────────────────

create or replace function public.notify_account_event()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if tg_argv[0] = 'account_approved'
     and (old.approved = true or new.approved = false) then
    return new; -- only fire on the false → true transition
  end if;
  perform net.http_post(
    url := 'https://YOUR-PROJECT-REF.supabase.co/functions/v1/group-events',
    headers := jsonb_build_object(
      'x-cron-secret', 'YOUR-CRON-SECRET',
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object('type', tg_argv[0], 'user_id', new.id)
  );
  return new;
end;
$$;

drop trigger if exists account_pending_notify on public.profiles;
create trigger account_pending_notify
  after insert on public.profiles
  for each row execute function public.notify_account_event('account_pending');

drop trigger if exists account_approved_notify on public.profiles;
create trigger account_approved_notify
  after update of approved on public.profiles
  for each row execute function public.notify_account_event('account_approved');
