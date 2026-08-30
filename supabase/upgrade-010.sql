-- Upgrade 010: multi-month membership.
-- A member may hold several slots (months) in one group. Each group_members
-- row is one slot, now identified by a surrogate `id`. The pot/dues math
-- already sums over slots; a member contributes once per slot each round
-- (the slot receiving that month excluded) and pays their combined dues once.

-- ── group_members: surrogate id + many slots per member ──
alter table public.group_members add column if not exists id uuid not null default gen_random_uuid();
alter table public.group_members drop constraint if exists group_members_pkey;
alter table public.group_members add constraint group_members_pkey primary key (id);

-- A member can't hold the same month twice, and keeps at most one empty
-- (unpicked) slot per group.
create unique index if not exists group_members_user_month_uniq
  on public.group_members (group_id, user_id, month) where month is not null;
create unique index if not exists group_members_one_empty_slot
  on public.group_members (group_id, user_id) where month is null;

-- Month capacity: at most one full share, or two halves, per month — counted
-- across OTHER slots (by id) so a member's own other months don't interfere.
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
    where group_id = new.group_id and month = new.month and id <> new.id;
  if occ_count >= 2 or occ_total >= 1 then
    raise exception 'month is fully taken';
  end if;
  if occ_count = 1 and new.share <> 0.5 then
    raise exception 'month can only be joined as a half share';
  end if;
  return new;
end;
$$;

-- Members may add their own extra slots to a group they already belong to
-- (the first join still goes through admin approval).
drop policy if exists "members_insert_admin" on public.group_members;
drop policy if exists "members_insert" on public.group_members;
create policy "members_insert" on public.group_members
  for insert to authenticated with check (
    public.is_group_admin(group_id)
    or public.is_platform_admin()
    or (
      user_id = auth.uid()
      and exists (select 1 from public.group_members gm
                  where gm.group_id = group_members.group_id and gm.user_id = auth.uid())
      and not exists (select 1 from public.groups g
                      where g.id = group_id and (g.disabled or g.hidden))
    )
  );

-- ── month_change_requests target a specific slot ──
alter table public.month_change_requests
  add column if not exists slot_id uuid references public.group_members(id) on delete cascade;
update public.month_change_requests mcr set slot_id = gm.id
  from public.group_members gm
  where mcr.slot_id is null and gm.group_id = mcr.group_id and gm.user_id = mcr.user_id;
delete from public.month_change_requests where slot_id is null;
alter table public.month_change_requests alter column slot_id set not null;
alter table public.month_change_requests drop constraint if exists month_change_requests_pkey;
alter table public.month_change_requests add constraint month_change_requests_pkey primary key (slot_id);

-- ── Overdue payers: aggregate a member's owing slots into one combined row ──
create or replace function public.overdue_payers()
returns table (
  group_id uuid, group_name text, amount numeric, currency text,
  admin_id uuid, month text,
  user_id uuid, user_name text, email text, phone text, share numeric
)
language sql stable security definer set search_path = public
as $$
  with cur as (select to_char(current_date, 'YYYY-MM') as ym)
  select g.id, g.name, sum(g.amount * gm.share) as amount, g.currency,
         g.admin_id, cur.ym,
         p.id, p.name, p.email, p.phone, 1::numeric as share
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
    )
  group by g.id, g.name, g.currency, g.admin_id, cur.ym, p.id, p.name, p.email, p.phone;
$$;

revoke all on function public.overdue_payers() from public;
