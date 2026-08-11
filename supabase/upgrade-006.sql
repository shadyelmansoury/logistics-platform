-- Upgrade 006: admin notifications for join events + expanded notification kinds.
-- Deploy the supabase/functions/group-events edge function first, then run
-- this with YOUR-PROJECT-REF and YOUR-CRON-SECRET filled in.

alter table public.notification_log drop constraint if exists notification_log_kind_check;
alter table public.notification_log add constraint notification_log_kind_check
  check (kind in ('overdue_user', 'overdue_admin', 'join_request', 'member_joined'));

-- Fire the group-events function on join requests and new memberships.
-- (pg_net is already enabled for the daily reminder cron.)
create or replace function public.notify_group_event()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  admin uuid;
begin
  select admin_id into admin from public.groups where id = new.group_id;
  -- Skip when the actor is the admin themselves (e.g. creating the group)
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
        'user_id', new.user_id
      )
    );
  end if;
  return new;
end;
$$;

drop trigger if exists join_request_notify on public.join_requests;
create trigger join_request_notify
  after insert on public.join_requests
  for each row execute function public.notify_group_event('join_request');

drop trigger if exists member_joined_notify on public.group_members;
create trigger member_joined_notify
  after insert on public.group_members
  for each row execute function public.notify_group_event('member_joined');
