-- FortifySec V7.11 — flagship price + profile persistence compatibility
-- Safe to run after the legacy compatibility patches and migrations 002-004.

-- 1) Official Academy price requested for the flagship course: R$ 99,90.
update public.courses
set price_cents = 9990,
    updated_at = now()
where slug = 'formacao-fortifysec';

-- 2) Allow authenticated users to update only their own non-privileged profile fields.
alter table public.profiles enable row level security;

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
for update to authenticated
using (
  id = auth.uid()
  and coalesce(blocked,false) = false
)
with check (
  id = auth.uid()
  and coalesce(blocked,false) = false
);

grant select on public.profiles to authenticated;
grant update(name,headline,github_url,linkedin_url,profile_public,open_to_work) on public.profiles to authenticated;

notify pgrst, 'reload schema';

-- Verification result.
select
  (select price_cents from public.courses where slug='formacao-fortifysec' limit 1) as academy_price_cents,
  exists(
    select 1 from pg_policies
    where schemaname='public' and tablename='profiles' and policyname='profiles_update_self'
  ) as profile_update_policy_ok;
