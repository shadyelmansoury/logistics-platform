-- upgrade-012: upcoming-payment reminders (3 days before a month starts)
-- Companion to overdue_payers(). Whereas overdue_payers() nags unpaid members
-- from the 2nd of the current month, upcoming_payers() gives every member who
-- will owe for the NEXT month a heads-up exactly three days before that month
-- begins, so they can have the transfer ready. The payment-reminders edge
-- function calls both daily; this one returns rows only on the single trigger
-- day (when today + 3 days lands on the 1st), so the "3 days ahead" timing is
-- enforced in SQL and the daily cron needs no special scheduling.
--
-- Timezone: America/Toronto, matching overdue_payers() and the app client, so
-- "the 1st" and "three days before" mean the same calendar day everywhere.

create or replace function public.upcoming_payers()
returns table (
  group_id uuid, group_name text, amount numeric, currency text,
  admin_id uuid, month text,
  user_id uuid, user_name text, email text, phone text, share numeric
)
language sql stable security definer set search_path = public
as $$
  with d as (
    select (now() at time zone 'America/Toronto')::date as today
  ),
  tgt as (
    select to_char(today + 3, 'YYYY-MM') as ym,
           (extract(day from (today + 3)) = 1) as fire
    from d
  )
  select g.id, g.name, sum(g.amount * gm.share) as amount, g.currency,
         g.admin_id, tgt.ym,
         p.id, p.name, p.email, p.phone, 1::numeric as share
  from public.groups g
  cross join tgt
  join public.group_members gm on gm.group_id = g.id
  join public.profiles p on p.id = gm.user_id
  where tgt.fire
    and not g.disabled
    and tgt.ym >= g.start_month
    and tgt.ym < to_char((to_date(g.start_month || '-01', 'YYYY-MM-DD')
                          + make_interval(months => g.max_members)), 'YYYY-MM')
    -- the member who receives the pot that month doesn't pay for that slot;
    -- any other slots they hold are still summed into their combined dues.
    and (gm.month is null or gm.month <> tgt.ym)
    -- don't remind anyone who has already prepaid this month.
    and not exists (
      select 1 from public.payments pay
      where pay.group_id = g.id and pay.month = tgt.ym and pay.payer_id = gm.user_id
    )
  group by g.id, g.name, g.currency, g.admin_id, tgt.ym, p.id, p.name, p.email, p.phone;
$$;

revoke all on function public.upcoming_payers() from public;
