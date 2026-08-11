-- Upgrade 003: platform admin role + month splitting.
-- Run this once in the Supabase SQL Editor for projects already on 002.
-- (schema.sql is kept current for fresh installs.)
--
-- After running, promote your own account to platform admin:
--   update public.profiles set role = 'admin' where email = 'you@example.com';

-- ─── Platform admin role ──────────────────────────────────────────────────────

alter table public.profiles
  add column if not exists role text not null default 'member'
    check (role in ('member', 'admin'));

create or replace function public.is_platform_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- Delete a user account entirely (auth entry cascades to profile, their
-- groups, memberships, requests, and payments). Platform admins only.
create or replace function public.admin_delete_user(target uuid)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  if not public.is_platform_admin() then
    raise exception 'not authorized';
  end if;
  if target = auth.uid() then
    raise exception 'cannot delete your own account';
  end if;
  delete from auth.users where id = target;
end;
$$;

revoke all on function public.admin_delete_user(uuid) from public;
grant execute on function public.admin_delete_user(uuid) to authenticated;

-- ─── Group moderation flags ───────────────────────────────────────────────────

alter table public.groups
  add column if not exists hidden boolean not null default false,
  add column if not exists disabled boolean not null default false;

-- ─── Month splitting (max two half-share members per month) ───────────────────

alter table public.group_members
  add column if not exists share numeric not null default 1
    check (share in (0.5, 1));

drop index if exists group_members_unique_month;

create or replace function public.check_month_capacity()
returns trigger
language plpgsql
as $$
declare
  occ_count int;
  occ_total numeric;
begin
  if new.month is null then return new; end if;
  select count(*), coalesce(sum(share), 0) into occ_count, occ_total
    from public.group_members
    where group_id = new.group_id and month = new.month and user_id <> new.user_id;
  if occ_count >= 2 or occ_total >= 1 then
    raise exception 'month is fully taken';
  end if;
  if occ_count = 1 and new.share <> 0.5 then
    raise exception 'month can only be joined as a half share';
  end if;
  return new;
end;
$$;

drop trigger if exists month_capacity on public.group_members;
create trigger month_capacity
  before insert or update of month, share on public.group_members
  for each row execute function public.check_month_capacity();

-- With splitting, a group can hold up to two members per month.
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
  if cnt >= cap * 2 then
    raise exception 'group is full';
  end if;
  return new;
end;
$$;

-- ─── Policy updates ───────────────────────────────────────────────────────────

-- Hidden groups are visible only to their members, requesters, their admin,
-- and platform admins.
drop policy if exists "groups_select" on public.groups;
create policy "groups_select" on public.groups
  for select to authenticated using (
    not hidden
    or admin_id = auth.uid()
    or public.is_platform_admin()
    or exists (select 1 from public.group_members gm
               where gm.group_id = id and gm.user_id = auth.uid())
    or exists (select 1 from public.join_requests jr
               where jr.group_id = id and jr.user_id = auth.uid())
  );

drop policy if exists "groups_update_admin" on public.groups;
create policy "groups_update_admin" on public.groups
  for update to authenticated
  using (admin_id = auth.uid() or public.is_platform_admin());

drop policy if exists "groups_delete_admin" on public.groups;
create policy "groups_delete_admin" on public.groups
  for delete to authenticated
  using (admin_id = auth.uid() or public.is_platform_admin());

drop policy if exists "members_insert_admin" on public.group_members;
create policy "members_insert_admin" on public.group_members
  for insert to authenticated
  with check (public.is_group_admin(group_id) or public.is_platform_admin());

-- Members can update their own row (month picking) unless the group is
-- disabled; group and platform admins always can.
drop policy if exists "members_update" on public.group_members;
create policy "members_update" on public.group_members
  for update to authenticated using (
    (user_id = auth.uid()
      and not exists (select 1 from public.groups g where g.id = group_id and g.disabled))
    or public.is_group_admin(group_id)
    or public.is_platform_admin()
  );

drop policy if exists "members_delete" on public.group_members;
create policy "members_delete" on public.group_members
  for delete to authenticated using (
    user_id = auth.uid()
    or public.is_group_admin(group_id)
    or public.is_platform_admin()
  );

-- No new join requests for hidden or disabled groups.
drop policy if exists "requests_insert_own" on public.join_requests;
create policy "requests_insert_own" on public.join_requests
  for insert to authenticated with check (
    user_id = auth.uid()
    and not exists (select 1 from public.groups g
                    where g.id = group_id and (g.disabled or g.hidden))
  );

drop policy if exists "requests_delete" on public.join_requests;
create policy "requests_delete" on public.join_requests
  for delete to authenticated using (
    user_id = auth.uid()
    or public.is_group_admin(group_id)
    or public.is_platform_admin()
  );

-- No payment activity in disabled groups.
drop policy if exists "payments_insert" on public.payments;
create policy "payments_insert" on public.payments
  for insert to authenticated with check (
    (payer_id = auth.uid() or public.is_group_admin(group_id) or public.is_platform_admin())
    and not exists (select 1 from public.groups g where g.id = group_id and g.disabled)
  );

drop policy if exists "payments_delete" on public.payments;
create policy "payments_delete" on public.payments
  for delete to authenticated using (
    payer_id = auth.uid()
    or public.is_group_admin(group_id)
    or public.is_platform_admin()
  );
