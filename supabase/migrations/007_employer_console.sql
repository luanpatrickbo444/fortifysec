-- FortifySec V8.1 — Employer Console / Talent Shortlist
-- Apply after migrations 000..006.
-- Additive and safe to run more than once.

create extension if not exists pgcrypto;

create table if not exists public.company_talent_shortlist (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  talent_user_id uuid not null references public.profiles(id) on delete cascade,
  added_by uuid not null references public.profiles(id) on delete restrict,
  status text not null default 'saved' check(status in ('saved','contacted','interview','archived')),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(company_id,talent_user_id)
);

create index if not exists company_talent_shortlist_company_idx
  on public.company_talent_shortlist(company_id,status,created_at desc);
create index if not exists company_talent_shortlist_talent_idx
  on public.company_talent_shortlist(talent_user_id,created_at desc);

alter table public.company_talent_shortlist enable row level security;

drop policy if exists company_talent_shortlist_member_read on public.company_talent_shortlist;
create policy company_talent_shortlist_member_read on public.company_talent_shortlist
for select to authenticated using (
  (select public.is_company_member(company_id)) or (select public.is_admin())
);

grant select on public.company_talent_shortlist to authenticated;
revoke insert,update,delete on public.company_talent_shortlist from anon,authenticated;
revoke all on public.company_talent_shortlist from anon;

-- Writes are executed by validated server actions using service_role.
drop trigger if exists company_talent_shortlist_touch on public.company_talent_shortlist;
create trigger company_talent_shortlist_touch
before update on public.company_talent_shortlist
for each row execute procedure public.touch_updated_at();

notify pgrst, 'reload schema';

select
  to_regclass('public.company_talent_shortlist') is not null as shortlist_table_ok,
  exists(
    select 1 from pg_policies
    where schemaname='public'
      and tablename='company_talent_shortlist'
      and policyname='company_talent_shortlist_member_read'
  ) as shortlist_policy_ok;
