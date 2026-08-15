-- FortifySec unified platform: Labs, Challenges, CTF and Talent Network.
-- Apply AFTER 001_final_schema.sql.

create extension if not exists pgcrypto;

alter table public.profiles
  add column if not exists github_url text,
  add column if not exists linkedin_url text,
  add column if not exists profile_public boolean not null default false,
  add column if not exists open_to_work boolean not null default false;

grant update(name,headline,github_url,linkedin_url,profile_public,open_to_work) on public.profiles to authenticated;

create table if not exists public.labs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text not null default '',
  instructions text,
  difficulty text not null default 'Easy' check (difficulty in ('Easy','Medium','Hard','Insane')),
  estimated_minutes integer not null default 60 check (estimated_minutes between 15 and 720),
  tags text[] not null default '{}',
  connection_url text,
  provider_lab_id text,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lab_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  lab_id uuid not null references public.labs(id) on delete cascade,
  status text not null default 'running' check(status in ('running','stopped','expired','revoked')),
  connection_url text,
  provider_session_id text,
  started_at timestamptz not null default now(),
  stopped_at timestamptz,
  expires_at timestamptz
);
create unique index if not exists one_running_lab_session on public.lab_sessions(user_id,lab_id) where status='running';
create index if not exists lab_sessions_user_idx on public.lab_sessions(user_id,status);

create table if not exists public.challenges (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text not null default '',
  briefing text,
  category text not null default 'Web',
  difficulty text not null default 'Easy' check (difficulty in ('Easy','Medium','Hard','Insane')),
  xp_reward integer not null default 50 check(xp_reward between 0 and 10000),
  flag_hash bytea not null,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.challenge_solves (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  solved_at timestamptz not null default now(),
  unique(user_id,challenge_id)
);
create index if not exists challenge_solves_user_idx on public.challenge_solves(user_id,solved_at desc);

create table if not exists public.ctf_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  prize_text text,
  status text not null default 'scheduled' check(status in ('scheduled','live','finished')),
  created_at timestamptz not null default now(),
  check(ends_at > starts_at)
);

create or replace function public.has_platform_access()
returns boolean
language sql stable security definer set search_path=public
as $$
  select exists(
    select 1 from public.enrollments e
    join public.profiles p on p.id=e.user_id
    where e.user_id=auth.uid() and e.status='active' and not p.blocked
  );
$$;
revoke all on function public.has_platform_access() from public;
grant execute on function public.has_platform_access() to authenticated;

create or replace function public.current_user_active()
returns boolean
language sql stable security definer set search_path=public
as $$ select exists(select 1 from public.profiles p where p.id=auth.uid() and p.blocked=false); $$;
revoke all on function public.current_user_active() from public;
grant execute on function public.current_user_active() to authenticated;

-- Tighten policies from migration 001: blocking a user must also work on direct Supabase calls.
drop policy if exists lessons_select_enrolled on public.lessons;
create policy lessons_select_enrolled on public.lessons for select to authenticated using (
  public.current_user_active() and (public.is_admin() or exists(
    select 1 from public.enrollments e where e.user_id=auth.uid() and e.course_id=lessons.course_id and e.status='active'
  ))
);
drop policy if exists progress_select_own_or_admin on public.lesson_progress;
create policy progress_select_own_or_admin on public.lesson_progress for select to authenticated using (
  public.current_user_active() and (user_id=auth.uid() or public.is_admin())
);
drop policy if exists progress_insert_active_enrollment on public.lesson_progress;
create policy progress_insert_active_enrollment on public.lesson_progress for insert to authenticated with check (
  public.current_user_active() and user_id=auth.uid() and exists(
    select 1 from public.lessons l join public.enrollments e on e.course_id=l.course_id
    where l.id=lesson_progress.lesson_id and e.user_id=auth.uid() and e.status='active'
  )
);
drop policy if exists progress_update_active_enrollment on public.lesson_progress;
create policy progress_update_active_enrollment on public.lesson_progress for update to authenticated using (
  public.current_user_active() and user_id=auth.uid()
) with check (
  public.current_user_active() and user_id=auth.uid() and exists(
    select 1 from public.lessons l join public.enrollments e on e.course_id=l.course_id
    where l.id=lesson_progress.lesson_id and e.user_id=auth.uid() and e.status='active'
  )
);

-- Prevent XP farming by making lesson completion monotonic.
create or replace function public.guard_lesson_progress()
returns trigger language plpgsql security definer set search_path=public
as $$
begin
  if tg_op='UPDATE' and old.completed=true and new.completed=false then
    raise exception 'completed lesson cannot be reverted';
  end if;
  if new.completed=true and new.completed_at is null then new.completed_at=now(); end if;
  return new;
end;
$$;
drop trigger if exists lesson_progress_guard on public.lesson_progress;
create trigger lesson_progress_guard before insert or update on public.lesson_progress
for each row execute procedure public.guard_lesson_progress();

create or replace function public.award_lesson_xp()
returns trigger language plpgsql security definer set search_path=public
as $$
declare reward integer;
begin
  if new.completed=true and (tg_op='INSERT' or old.completed=false) then
    select xp_reward into reward from public.lessons where id=new.lesson_id;
    update public.profiles set xp=xp+coalesce(reward,0) where id=new.user_id;
  end if;
  return new;
end;
$$;

create or replace function public.submit_challenge_flag(challenge_uuid uuid,candidate_flag text)
returns boolean
language plpgsql security definer set search_path=public
as $$
declare expected bytea; reward integer; inserted_count integer;
begin
  if auth.uid() is null or not public.has_platform_access() then return false; end if;
  select flag_hash,xp_reward into expected,reward from public.challenges where id=challenge_uuid and published=true;
  if expected is null or digest(candidate_flag,'sha256') <> expected then return false; end if;
  insert into public.challenge_solves(user_id,challenge_id) values(auth.uid(),challenge_uuid)
    on conflict(user_id,challenge_id) do nothing;
  get diagnostics inserted_count = row_count;
  if inserted_count=1 then update public.profiles set xp=xp+coalesce(reward,0) where id=auth.uid(); end if;
  return true;
end;
$$;
revoke all on function public.submit_challenge_flag(uuid,text) from public;
grant execute on function public.submit_challenge_flag(uuid,text) to authenticated;

create or replace function public.admin_create_challenge(
 p_title text,p_slug text,p_description text,p_category text,p_difficulty text,p_xp_reward integer,p_briefing text,p_flag text
) returns uuid
language plpgsql security definer set search_path=public
as $$
declare new_id uuid;
begin
 insert into public.challenges(title,slug,description,category,difficulty,xp_reward,briefing,flag_hash,published)
 values(p_title,p_slug,p_description,p_category,p_difficulty,p_xp_reward,p_briefing,digest(p_flag,'sha256'),true)
 returning id into new_id;
 return new_id;
end;
$$;
revoke all on function public.admin_create_challenge(text,text,text,text,text,integer,text,text) from public;
grant execute on function public.admin_create_challenge(text,text,text,text,text,integer,text,text) to service_role;

create or replace function public.get_public_talent_board(limit_count integer default 60)
returns table(id uuid,name text,headline text,xp integer,open_to_work boolean,github_url text,linkedin_url text)
language sql stable security definer set search_path=public
as $$
 select p.id,p.name,p.headline,p.xp,p.open_to_work,p.github_url,p.linkedin_url
 from public.profiles p where p.profile_public=true and p.blocked=false
 order by p.xp desc,p.created_at asc limit least(greatest(limit_count,1),100);
$$;
revoke all on function public.get_public_talent_board(integer) from public;
grant execute on function public.get_public_talent_board(integer) to anon,authenticated;

alter table public.labs enable row level security;
alter table public.lab_sessions enable row level security;
alter table public.challenges enable row level security;
alter table public.challenge_solves enable row level security;
alter table public.ctf_events enable row level security;

create policy labs_read_catalog on public.labs for select to authenticated using (public.current_user_active() and (published or public.is_admin()));
create policy lab_sessions_read_own on public.lab_sessions for select to authenticated using (public.current_user_active() and (user_id=auth.uid() or public.is_admin()));
create policy challenges_read_catalog on public.challenges for select to authenticated using (public.current_user_active() and (published or public.is_admin()));
create policy challenge_solves_read_own on public.challenge_solves for select to authenticated using (public.current_user_active() and (user_id=auth.uid() or public.is_admin()));
create policy ctf_events_read on public.ctf_events for select to authenticated using (public.current_user_active());

grant select(id,title,slug,description,instructions,difficulty,estimated_minutes,tags,published,created_at,updated_at) on public.labs to authenticated;
grant select(id,user_id,lab_id,status,started_at,stopped_at,expires_at) on public.lab_sessions to authenticated;
grant select(id,title,slug,description,briefing,category,difficulty,xp_reward,published,created_at,updated_at) on public.challenges to authenticated;
grant select on public.challenge_solves to authenticated;
grant select on public.ctf_events to authenticated;

revoke all on public.labs,public.lab_sessions,public.challenges,public.challenge_solves,public.ctf_events from anon;
grant execute on function public.get_public_talent_board(integer) to anon;

-- Service role bypasses RLS and is used by server actions for admin writes and lab session endpoints.
