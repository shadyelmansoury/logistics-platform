-- Upgrade for projects that already ran the original schema.sql
-- (fresh installs only need schema.sql — skip this file).
-- Adds: first/last name + e-transfer email on profiles, and database-level
-- two-factor authentication enforcement.

alter table public.profiles
  add column if not exists first_name text not null default '',
  add column if not exists last_name text not null default '',
  add column if not exists etransfer_email text not null default '';

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

drop policy if exists "mfa_profiles" on public.profiles;
drop policy if exists "mfa_groups" on public.groups;
drop policy if exists "mfa_group_members" on public.group_members;
drop policy if exists "mfa_join_requests" on public.join_requests;
drop policy if exists "mfa_payments" on public.payments;

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
