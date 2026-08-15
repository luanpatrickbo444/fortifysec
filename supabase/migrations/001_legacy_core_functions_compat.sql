-- FortifySec legacy core-functions compatibility patch
-- Execute AFTER 000_legacy_profiles_compat.sql and BEFORE 002_labs_challenges_ctf.sql.
-- Safe to run more than once.

begin;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and coalesce(p.role, 'student') = 'admin'
      and coalesce(p.blocked, false) = false
  );
$$;

-- Do not leave broad EXECUTE permission through the PUBLIC pseudo-role.
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_admin() to service_role;

commit;

NOTIFY pgrst, 'reload schema';

-- Diagnostic: should return true.
select to_regprocedure('public.is_admin()') is not null as is_admin_ok;
