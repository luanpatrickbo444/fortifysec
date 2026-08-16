-- FortifySec V8 — CTF scoring, challenge targets/VPN and company job board.
-- Apply AFTER migrations 000..005. This migration is additive and does not alter the visual layer.

create extension if not exists pgcrypto;

-- Challenge -> optional Cyber Lab target. When present, the challenge can provision
-- the same isolated provider session used by Cyber Labs.
alter table public.challenges
  add column if not exists lab_id uuid references public.labs(id) on delete set null;

alter table public.lab_sessions
  add column if not exists target_address text,
  add column if not exists vpn_download_url text;

create index if not exists challenges_lab_idx on public.challenges(lab_id);

-- Session connection details are visible only to the session owner through RLS.
grant select(id,user_id,lab_id,status,connection_url,started_at,stopped_at,expires_at,target_address,vpn_download_url) on public.lab_sessions to authenticated;

-- CTF participation and event-scoped scoring.
create table if not exists public.ctf_participants (
  event_id uuid not null references public.ctf_events(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key(event_id,user_id)
);
create index if not exists ctf_participants_user_idx on public.ctf_participants(user_id,joined_at desc);

create table if not exists public.ctf_solves (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.ctf_events(id) on delete cascade,
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  points integer not null default 0 check(points >= 0),
  solved_at timestamptz not null default now(),
  unique(event_id,challenge_id,user_id)
);
create index if not exists ctf_solves_event_idx on public.ctf_solves(event_id,solved_at);
create index if not exists ctf_solves_user_idx on public.ctf_solves(user_id,solved_at desc);

create or replace function public.submit_ctf_flag(event_uuid uuid, challenge_uuid uuid, candidate_flag text)
returns boolean
language plpgsql
security definer
set search_path=public
as $$
declare
  expected bytea;
  reward integer;
  event_points integer;
  inserted_event integer;
  inserted_global integer;
begin
  if auth.uid() is null or not public.has_platform_access() then return false; end if;

  if not exists(
    select 1 from public.ctf_events e
    where e.id=event_uuid
      and e.status='live'
      and now() between e.starts_at and e.ends_at
  ) then return false; end if;

  if not exists(
    select 1 from public.ctf_participants p
    where p.event_id=event_uuid and p.user_id=auth.uid()
  ) then return false; end if;

  select c.flag_hash,c.xp_reward,coalesce(ec.points_override,c.xp_reward)
    into expected,reward,event_points
  from public.ctf_event_challenges ec
  join public.challenges c on c.id=ec.challenge_id
  where ec.event_id=event_uuid
    and ec.challenge_id=challenge_uuid
    and c.published=true;

  if expected is null or digest(candidate_flag,'sha256') <> expected then return false; end if;

  insert into public.ctf_solves(event_id,challenge_id,user_id,points)
  values(event_uuid,challenge_uuid,auth.uid(),coalesce(event_points,0))
  on conflict(event_id,challenge_id,user_id) do nothing;
  get diagnostics inserted_event = row_count;

  if inserted_event=1 then
    -- Also register the normal challenge solve, but award XP only once globally.
    insert into public.challenge_solves(user_id,challenge_id)
    values(auth.uid(),challenge_uuid)
    on conflict(user_id,challenge_id) do nothing;
    get diagnostics inserted_global = row_count;
    if inserted_global=1 then
      update public.profiles set xp=xp+coalesce(reward,0) where id=auth.uid();
    end if;
  end if;

  return true;
end;
$$;
revoke all on function public.submit_ctf_flag(uuid,uuid,text) from public;
grant execute on function public.submit_ctf_flag(uuid,uuid,text) to authenticated;

create or replace function public.get_ctf_leaderboard(event_uuid uuid, limit_count integer default 100)
returns table(user_id uuid,name text,headline text,points bigint,solves bigint,last_solve timestamptz)
language sql
stable
security definer
set search_path=public
as $$
  select p.id,p.name,p.headline,
         coalesce(sum(s.points),0)::bigint as points,
         count(s.id)::bigint as solves,
         max(s.solved_at) as last_solve
  from public.ctf_participants cp
  join public.profiles p on p.id=cp.user_id and not p.blocked
  left join public.ctf_solves s on s.event_id=cp.event_id and s.user_id=cp.user_id
  where cp.event_id=event_uuid
  group by p.id,p.name,p.headline,cp.joined_at
  order by points desc, solves desc, last_solve asc nulls last, cp.joined_at asc
  limit least(greatest(limit_count,1),200);
$$;
revoke all on function public.get_ctf_leaderboard(uuid,integer) from public;
grant execute on function public.get_ctf_leaderboard(uuid,integer) to authenticated;

alter table public.ctf_participants enable row level security;
alter table public.ctf_solves enable row level security;

create policy ctf_participants_read on public.ctf_participants
for select to authenticated using (
  (select public.current_user_active()) and (user_id=(select auth.uid()) or (select public.is_admin()))
);
create policy ctf_solves_read on public.ctf_solves
for select to authenticated using (
  (select public.current_user_active()) and (user_id=(select auth.uid()) or (select public.is_admin()))
);

grant select on public.ctf_participants,public.ctf_solves to authenticated;
revoke all on public.ctf_participants,public.ctf_solves from anon;

-- Company / recruiter area.
create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null default '',
  website text,
  location text,
  verified boolean not null default false,
  active boolean not null default true,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.company_members (
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  member_role text not null default 'recruiter' check(member_role in ('owner','recruiter')),
  created_at timestamptz not null default now(),
  primary key(company_id,user_id)
);
create index if not exists company_members_user_idx on public.company_members(user_id,company_id);

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  created_by uuid not null references public.profiles(id) on delete restrict,
  title text not null,
  slug text not null unique,
  description text not null default '',
  requirements text not null default '',
  location text,
  work_mode text not null default 'remote' check(work_mode in ('remote','hybrid','onsite')),
  employment_type text not null default 'full_time' check(employment_type in ('full_time','part_time','contract','internship')),
  seniority text,
  salary_min integer,
  salary_max integer,
  status text not null default 'draft' check(status in ('draft','published','closed')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check(salary_min is null or salary_min >= 0),
  check(salary_max is null or salary_max >= 0),
  check(salary_min is null or salary_max is null or salary_max >= salary_min)
);
create index if not exists jobs_company_idx on public.jobs(company_id,status,created_at desc);
create index if not exists jobs_public_idx on public.jobs(status,published_at desc);

create table if not exists public.job_applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  cover_note text not null default '',
  status text not null default 'submitted' check(status in ('submitted','viewed','interview','rejected','hired')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(job_id,user_id)
);
create index if not exists job_applications_job_idx on public.job_applications(job_id,status,created_at desc);
create index if not exists job_applications_user_idx on public.job_applications(user_id,created_at desc);

create or replace function public.is_company_member(company_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path=public
as $$
  select exists(
    select 1 from public.company_members m
    join public.companies c on c.id=m.company_id
    where m.company_id=company_uuid
      and m.user_id=auth.uid()
      and c.active=true
  );
$$;
revoke all on function public.is_company_member(uuid) from public;
grant execute on function public.is_company_member(uuid) to authenticated;

alter table public.companies enable row level security;
alter table public.company_members enable row level security;
alter table public.jobs enable row level security;
alter table public.job_applications enable row level security;

create policy companies_public_read on public.companies
for select to anon,authenticated using (verified=true and active=true);
create policy companies_member_read on public.companies
for select to authenticated using ((select public.is_company_member(id)) or (select public.is_admin()));

create policy company_members_own_read on public.company_members
for select to authenticated using (user_id=(select auth.uid()) or (select public.is_admin()));

create policy jobs_public_read on public.jobs
for select to anon,authenticated using (
  status='published' and exists(select 1 from public.companies c where c.id=jobs.company_id and c.verified=true and c.active=true)
);
create policy jobs_company_read on public.jobs
for select to authenticated using ((select public.is_company_member(company_id)) or (select public.is_admin()));

create policy job_applications_own_read on public.job_applications
for select to authenticated using (user_id=(select auth.uid()) or (select public.is_admin()));

-- Company mutations and application inserts are performed by validated server actions with service_role.
grant select on public.companies,public.company_members,public.jobs,public.job_applications to authenticated;
grant select on public.companies,public.jobs to anon;
revoke insert,update,delete on public.companies,public.company_members,public.jobs,public.job_applications from anon,authenticated;

-- Keep timestamps current.
drop trigger if exists companies_touch on public.companies;
create trigger companies_touch before update on public.companies for each row execute procedure public.touch_updated_at();
drop trigger if exists jobs_touch on public.jobs;
create trigger jobs_touch before update on public.jobs for each row execute procedure public.touch_updated_at();
drop trigger if exists job_applications_touch on public.job_applications;
create trigger job_applications_touch before update on public.job_applications for each row execute procedure public.touch_updated_at();
