-- Upgrade 009: pre-launch security hardening.
-- 1) Privilege guard: only platform admins may change `role` or `approved`
--    on any profile. Without this, the profiles update policy let a user
--    PATCH their own row to role='admin' via the REST API.
--    (auth.uid() is null in service-role / SQL contexts, which stay allowed.)
-- 2) Payment confirmations now require group membership, so no one can
--    record an "I paid" row in a group they don't belong to.

create or replace function public.guard_profile_privileges()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if (new.role is distinct from old.role
      or new.approved is distinct from old.approved)
     and auth.uid() is not null
     and not public.is_platform_admin() then
    raise exception 'only platform admins can change roles or approval';
  end if;
  return new;
end;
$$;

drop trigger if exists profile_privilege_guard on public.profiles;
create trigger profile_privilege_guard
  before update on public.profiles
  for each row execute function public.guard_profile_privileges();

drop policy if exists "payments_insert" on public.payments;
create policy "payments_insert" on public.payments
  for insert to authenticated with check (
    ((payer_id = auth.uid() and public.is_group_member(group_id))
      or public.is_group_admin(group_id)
      or public.is_platform_admin())
    and not exists (select 1 from public.groups g where g.id = group_id and g.disabled)
  );
