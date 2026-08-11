-- Upgrade 005: run all schedule math on Toronto time (America/Toronto).
-- The app client and the payment-reminders edge function use the same zone.

create or replace function public.overdue_payers()
returns table (
  group_id uuid, group_name text, amount numeric, currency text,
  admin_id uuid, month text,
  user_id uuid, user_name text, email text, phone text, share numeric
)
language sql stable security definer set search_path = public
as $$
  with cur as (
    select to_char((now() at time zone 'America/Toronto')::date, 'YYYY-MM') as ym,
           extract(day from (now() at time zone 'America/Toronto')::date) as dom
  )
  select g.id, g.name, g.amount * gm.share, g.currency,
         g.admin_id, cur.ym,
         p.id, p.name, p.email, p.phone, gm.share
  from public.groups g
  cross join cur
  join public.group_members gm on gm.group_id = g.id
  join public.profiles p on p.id = gm.user_id
  where not g.disabled
    and cur.dom >= 2
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

-- Reschedule the daily job to 13:00 UTC = 9:00 AM Toronto (EDT) / 8:00 AM (EST).
-- (Run the cron.schedule statement from the README with the new time.)
