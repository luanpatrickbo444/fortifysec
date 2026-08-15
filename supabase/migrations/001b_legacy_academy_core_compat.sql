-- FortifySec V7 — Legacy Academy Core Compatibility Bridge
-- Execute AFTER:
--   000_legacy_profiles_compat.sql
--   001_legacy_core_functions_compat.sql
-- and BEFORE:
--   002_labs_challenges_ctf.sql
--
-- Purpose: adapt legacy courses/lessons/enrollments/progress/payments tables
-- to the schema expected by the V7 application WITHOUT deleting existing rows.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- COURSES
-- ---------------------------------------------------------------------------
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null default 'Curso',
  slug text,
  description text not null default '',
  price_cents integer not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.courses
  add column if not exists title text,
  add column if not exists slug text,
  add column if not exists description text,
  add column if not exists price_cents integer,
  add column if not exists published boolean,
  add column if not exists created_at timestamptz,
  add column if not exists updated_at timestamptz;

update public.courses
set
  title = coalesce(nullif(title,''), 'Curso ' || left(id::text,8)),
  slug = coalesce(nullif(slug,''), 'curso-' || replace(id::text,'-','')),
  description = coalesce(description,''),
  price_cents = greatest(coalesce(price_cents,0),0),
  published = coalesce(published,false),
  created_at = coalesce(created_at,now()),
  updated_at = coalesce(updated_at,now());

alter table public.courses alter column title set default 'Curso';
alter table public.courses alter column title set not null;
alter table public.courses alter column description set default '';
alter table public.courses alter column description set not null;
alter table public.courses alter column price_cents set default 0;
alter table public.courses alter column price_cents set not null;
alter table public.courses alter column published set default false;
alter table public.courses alter column published set not null;
alter table public.courses alter column created_at set default now();
alter table public.courses alter column created_at set not null;
alter table public.courses alter column updated_at set default now();
alter table public.courses alter column updated_at set not null;

create index if not exists courses_slug_idx on public.courses(slug);

-- ---------------------------------------------------------------------------
-- LESSONS
-- Existing legacy lessons are preserved. course_id is intentionally nullable
-- because old rows may not yet be associated with a V7 course.
-- ---------------------------------------------------------------------------
create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid,
  title text not null default 'Aula',
  content text,
  video_url text,
  position integer not null default 1,
  xp_reward integer not null default 10,
  created_at timestamptz not null default now()
);

alter table public.lessons
  add column if not exists course_id uuid,
  add column if not exists title text,
  add column if not exists content text,
  add column if not exists video_url text,
  add column if not exists position integer,
  add column if not exists xp_reward integer,
  add column if not exists created_at timestamptz;

update public.lessons
set
  title = coalesce(nullif(title,''), 'Aula ' || left(id::text,8)),
  position = greatest(coalesce(position,1),1),
  xp_reward = greatest(coalesce(xp_reward,10),0),
  created_at = coalesce(created_at,now());

alter table public.lessons alter column title set default 'Aula';
alter table public.lessons alter column title set not null;
alter table public.lessons alter column position set default 1;
alter table public.lessons alter column position set not null;
alter table public.lessons alter column xp_reward set default 10;
alter table public.lessons alter column xp_reward set not null;
alter table public.lessons alter column created_at set default now();
alter table public.lessons alter column created_at set not null;

create index if not exists lessons_course_idx on public.lessons(course_id,position);

-- Add FK only when both ids are UUID and the FK is not already present.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='courses' and column_name='id' and data_type='uuid'
  ) and exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='lessons' and column_name='course_id' and data_type='uuid'
  ) and not exists (
    select 1 from pg_constraint where conrelid='public.lessons'::regclass and contype='f'
      and conname='lessons_course_id_fkey'
  ) then
    alter table public.lessons
      add constraint lessons_course_id_fkey foreign key(course_id)
      references public.courses(id) on delete cascade not valid;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- ENROLLMENTS
-- ---------------------------------------------------------------------------
create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  status text not null default 'pending',
  source text not null default 'admin',
  activated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.enrollments
  add column if not exists user_id uuid,
  add column if not exists course_id uuid,
  add column if not exists status text,
  add column if not exists source text,
  add column if not exists activated_at timestamptz,
  add column if not exists created_at timestamptz,
  add column if not exists updated_at timestamptz;

update public.enrollments
set
  status = coalesce(status,'pending'),
  source = coalesce(nullif(source,''),'admin'),
  created_at = coalesce(created_at,now()),
  updated_at = coalesce(updated_at,now());

alter table public.enrollments alter column status set default 'pending';
alter table public.enrollments alter column source set default 'admin';
alter table public.enrollments alter column created_at set default now();
alter table public.enrollments alter column updated_at set default now();

create index if not exists enrollments_user_status_idx on public.enrollments(user_id,status);
create index if not exists enrollments_course_status_idx on public.enrollments(course_id,status);

-- ---------------------------------------------------------------------------
-- LESSON PROGRESS
-- ---------------------------------------------------------------------------
create table if not exists public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.lesson_progress
  add column if not exists user_id uuid,
  add column if not exists lesson_id uuid,
  add column if not exists completed boolean,
  add column if not exists completed_at timestamptz,
  add column if not exists created_at timestamptz;

update public.lesson_progress
set
  completed = coalesce(completed,false),
  created_at = coalesce(created_at,now());

alter table public.lesson_progress alter column completed set default false;
alter table public.lesson_progress alter column created_at set default now();

create index if not exists lesson_progress_user_idx on public.lesson_progress(user_id,completed);

-- ---------------------------------------------------------------------------
-- PAYMENTS (needed by the V7 student/admin consoles)
-- ---------------------------------------------------------------------------
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  provider text not null default 'mercadopago',
  preference_id text,
  payment_id text,
  external_reference text,
  status text not null default 'pending',
  amount_cents integer not null default 0,
  raw jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.payments
  add column if not exists user_id uuid,
  add column if not exists course_id uuid,
  add column if not exists provider text,
  add column if not exists preference_id text,
  add column if not exists payment_id text,
  add column if not exists external_reference text,
  add column if not exists status text,
  add column if not exists amount_cents integer,
  add column if not exists raw jsonb,
  add column if not exists created_at timestamptz,
  add column if not exists updated_at timestamptz;

update public.payments
set
  provider = coalesce(nullif(provider,''),'mercadopago'),
  status = coalesce(nullif(status,''),'pending'),
  amount_cents = greatest(coalesce(amount_cents,0),0),
  created_at = coalesce(created_at,now()),
  updated_at = coalesce(updated_at,now());

create index if not exists payments_user_idx on public.payments(user_id,created_at desc);
create index if not exists payments_reference_idx on public.payments(external_reference);

-- ---------------------------------------------------------------------------
-- CORE FUNCTIONS expected by Dashboard / Admin
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path=public
as $$
  select exists(
    select 1 from public.profiles p
    where p.id=auth.uid()
      and coalesce(p.role::text,'student')='admin'
      and coalesce(p.blocked,false)=false
  );
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated, service_role;

create or replace function public.get_leaderboard(limit_count integer default 100)
returns table(id uuid,name text,headline text,xp integer)
language sql stable security definer set search_path=public
as $$
  select p.id,
         coalesce(p.name,'Aluno')::text,
         p.headline::text,
         coalesce(p.xp,0)::integer
  from public.profiles p
  where coalesce(p.blocked,false)=false
  order by coalesce(p.xp,0) desc, p.created_at asc
  limit least(greatest(limit_count,1),100);
$$;
revoke all on function public.get_leaderboard(integer) from public;
grant execute on function public.get_leaderboard(integer) to authenticated;

-- ---------------------------------------------------------------------------
-- BASE RLS expected before migration 002 tightens access further.
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.lessons enable row level security;
alter table public.enrollments enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.payments enable row level security;

drop policy if exists profiles_select_self_or_admin on public.profiles;
create policy profiles_select_self_or_admin on public.profiles
for select to authenticated
using (id=auth.uid() or public.is_admin());

drop policy if exists courses_select_published_or_admin on public.courses;
create policy courses_select_published_or_admin on public.courses
for select to authenticated
using (coalesce(published,false) or public.is_admin());

drop policy if exists lessons_select_enrolled on public.lessons;
create policy lessons_select_enrolled on public.lessons
for select to authenticated
using (
  public.is_admin() or exists(
    select 1 from public.enrollments e
    where e.user_id=auth.uid()
      and e.course_id=lessons.course_id
      and e.status::text='active'
  )
);

drop policy if exists enrollments_select_own_or_admin on public.enrollments;
create policy enrollments_select_own_or_admin on public.enrollments
for select to authenticated
using (user_id=auth.uid() or public.is_admin());

drop policy if exists progress_select_own_or_admin on public.lesson_progress;
create policy progress_select_own_or_admin on public.lesson_progress
for select to authenticated
using (user_id=auth.uid() or public.is_admin());

drop policy if exists progress_insert_active_enrollment on public.lesson_progress;
create policy progress_insert_active_enrollment on public.lesson_progress
for insert to authenticated
with check (
  user_id=auth.uid() and exists(
    select 1
    from public.lessons l
    join public.enrollments e on e.course_id=l.course_id
    where l.id=lesson_progress.lesson_id
      and e.user_id=auth.uid()
      and e.status::text='active'
  )
);

drop policy if exists progress_update_active_enrollment on public.lesson_progress;
create policy progress_update_active_enrollment on public.lesson_progress
for update to authenticated
using (user_id=auth.uid())
with check (
  user_id=auth.uid() and exists(
    select 1
    from public.lessons l
    join public.enrollments e on e.course_id=l.course_id
    where l.id=lesson_progress.lesson_id
      and e.user_id=auth.uid()
      and e.status::text='active'
  )
);

drop policy if exists payments_select_own_or_admin on public.payments;
create policy payments_select_own_or_admin on public.payments
for select to authenticated
using (user_id=auth.uid() or public.is_admin());

grant select on public.profiles, public.courses, public.lessons, public.enrollments, public.payments to authenticated;
grant select,insert,update on public.lesson_progress to authenticated;
revoke all on public.courses,public.lessons,public.enrollments,public.lesson_progress,public.payments from anon;

notify pgrst, 'reload schema';

-- Diagnostic: all values should be true before running migration 002.
select
  exists(select 1 from information_schema.columns where table_schema='public' and table_name='lessons' and column_name='course_id') as lessons_course_id_ok,
  exists(select 1 from information_schema.columns where table_schema='public' and table_name='lessons' and column_name='xp_reward') as lessons_xp_ok,
  to_regclass('public.courses') is not null as courses_ok,
  to_regclass('public.enrollments') is not null as enrollments_ok,
  to_regclass('public.lesson_progress') is not null as lesson_progress_ok,
  to_regclass('public.payments') is not null as payments_ok,
  to_regprocedure('public.is_admin()') is not null as is_admin_ok,
  to_regprocedure('public.get_leaderboard(integer)') is not null as leaderboard_ok;
