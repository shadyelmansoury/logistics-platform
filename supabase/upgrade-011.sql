-- Upgrade 011: admin-created members.
-- A platform admin can create a member account (edge function admin-create-user)
-- for people who can't sign up themselves. Such accounts carry an
-- `admin_created` metadata flag and are pre-approved, so the "pending approval"
-- alert is skipped. Fill in YOUR-PROJECT-REF / YOUR-CRON-SECRET before running.

-- Profile is created approved when the signup metadata marks it admin-created.
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, first_name, last_name, email, phone, etransfer_email, approved)
  values (
    new.id,
    trim(coalesce(new.raw_user_meta_data->>'first_name', '') || ' ' ||
         coalesce(new.raw_user_meta_data->>'last_name', '')),
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    coalesce(new.raw_user_meta_data->>'etransfer_email', coalesce(new.email, '')),
    coalesce(new.raw_user_meta_data->>'admin_created', '') = 'true'
  );
  return new;
end;
$$;

-- Don't fire the "pending approval" alert for pre-approved (admin-created)
-- members; approval alerts still fire on the false → true transition.
create or replace function public.notify_account_event()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if tg_argv[0] = 'account_approved'
     and (old.approved = true or new.approved = false) then
    return new;
  end if;
  if tg_argv[0] = 'account_pending' and new.approved then
    return new; -- admin-created member: already approved, no pending alert
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
