-- Upgrade 008: month-change request notifications + month payload.
-- Admin gets SMS + in-app when a member requests a month change; the member
-- gets SMS + in-app when the change is applied. Fill in YOUR-PROJECT-REF /
-- YOUR-CRON-SECRET before running.

alter table public.notification_log drop constraint if exists notification_log_kind_check;
alter table public.notification_log add constraint notification_log_kind_check
  check (kind in ('overdue_user', 'overdue_admin', 'join_request', 'member_joined',
                  'join_approved', 'account_pending', 'account_approved',
                  'month_change_request', 'month_change_approved'));

-- Include the month (when the row has one) in the event payload.
create or replace function public.notify_group_event()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  admin uuid;
begin
  select admin_id into admin from public.groups where id = new.group_id;
  if admin is not null and admin <> new.user_id then
    perform net.http_post(
      url := 'https://YOUR-PROJECT-REF.supabase.co/functions/v1/group-events',
      headers := jsonb_build_object(
        'x-cron-secret', 'YOUR-CRON-SECRET',
        'Content-Type', 'application/json'
      ),
      body := jsonb_build_object(
        'type', tg_argv[0],
        'group_id', new.group_id,
        'user_id', new.user_id,
        'month', to_jsonb(new)->>'month'
      )
    );
  end if;
  return new;
end;
$$;

-- A filed month-change request alerts the group admin
drop trigger if exists month_change_request_notify on public.month_change_requests;
create trigger month_change_request_notify
  after insert on public.month_change_requests
  for each row execute function public.notify_group_event('month_change_request');

-- An applied month change (old month → different month) notifies the member.
-- First-time picks (old month null) stay silent.
drop trigger if exists month_change_applied_notify on public.group_members;
create trigger month_change_applied_notify
  after update of month on public.group_members
  for each row
  when (old.month is not null and new.month is distinct from old.month)
  execute function public.notify_group_event('month_change_approved');
