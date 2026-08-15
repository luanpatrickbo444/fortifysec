-- FortifySec final schema
-- Execute in Supabase SQL Editor on a fresh project or adapt names if tables already exist.

create extension if not exists pgcrypto;

create type public.user_role as enum ('student','admin');
create type public.enrollment_status as enum ('pending','active','blocked','expired');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default 'Aluno',
  email text not null,
  headline text,
  role public.user_role not null default 'student',
  blocked boolean not null default false,
  xp integer not null default 0 check (xp >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text not null default '',
  price_cents integer not null default 0 check (price_cents >= 0),
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  content text,
  video_url text,
  position integer not null default 1 check (position > 0),
  xp_reward integer not null default 10 check (xp_reward >= 0),
  created_at timestamptz not null default now(),
  unique(course_id, position)
);

create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  status public.enrollment_status not null default 'pending',
  source text not null default 'admin' check (source in ('admin','payment','import')),
  activated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, course_id)
);

create table public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique(user_id, lesson_id)
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  provider text not null default 'mercadopago',
  preference_id text,
  payment_id text,
  external_reference text not null,
  status text not null default 'pending',
  amount_cents integer not null check(amount_cents >= 0),
  raw jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index enrollments_user_idx on public.enrollments(user_id,status);
create index enrollments_course_idx on public.enrollments(course_id,status);
create index progress_user_idx on public.lesson_progress(user_id,completed);
create index payment_reference_idx on public.payments(external_reference);

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path=public
as $$ select exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin' and not p.blocked); $$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path=public
as $$
begin
  insert into public.profiles(id,name,email)
  values(new.id,coalesce(nullif(new.raw_user_meta_data->>'name',''),'Aluno'),coalesce(new.email,''))
  on conflict(id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$ begin new.updated_at=now(); return new; end; $$;
create trigger profiles_touch before update on public.profiles for each row execute procedure public.touch_updated_at();
create trigger courses_touch before update on public.courses for each row execute procedure public.touch_updated_at();
create trigger enrollments_touch before update on public.enrollments for each row execute procedure public.touch_updated_at();
create trigger payments_touch before update on public.payments for each row execute procedure public.touch_updated_at();

-- XP is awarded server-side by the database when an enrolled student completes a lesson.
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
create trigger lesson_xp_after after insert or update on public.lesson_progress for each row execute procedure public.award_lesson_xp();

create or replace function public.get_leaderboard(limit_count integer default 100)
returns table(id uuid,name text,headline text,xp integer)
language sql stable security definer set search_path=public
as $$ select p.id,p.name,p.headline,p.xp from public.profiles p where not p.blocked order by p.xp desc,p.created_at asc limit least(greatest(limit_count,1),100); $$;

grant execute on function public.get_leaderboard(integer) to authenticated;

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.lessons enable row level security;
alter table public.enrollments enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.payments enable row level security;

-- PROFILE: student sees/edits own safe fields; admin can read all.
create policy profiles_select_self_or_admin on public.profiles for select to authenticated using (id=auth.uid() or public.is_admin());
create policy profiles_update_self on public.profiles for update to authenticated using (id=auth.uid() and not blocked) with check (id=auth.uid());
revoke update on public.profiles from authenticated;
grant update(name,headline) on public.profiles to authenticated;
grant select on public.profiles to authenticated;

-- COURSE CATALOG is readable; writes are server/admin only.
create policy courses_select_published_or_admin on public.courses for select to authenticated using (published or public.is_admin());
grant select on public.courses to authenticated;

-- LESSONS: only active enrollment or admin.
create policy lessons_select_enrolled on public.lessons for select to authenticated using (
  public.is_admin() or exists(
    select 1 from public.enrollments e
    where e.user_id=auth.uid() and e.course_id=lessons.course_id and e.status='active'
  )
);
grant select on public.lessons to authenticated;

-- ENROLLMENT: student can READ only own rows. NO INSERT/UPDATE/DELETE policy exists for students.
-- Creation/activation is done with service_role from admin backend or verified payment webhook.
create policy enrollments_select_own_or_admin on public.enrollments for select to authenticated using (user_id=auth.uid() or public.is_admin());
grant select on public.enrollments to authenticated;

-- PROGRESS: only for lessons belonging to an ACTIVE enrollment.
create policy progress_select_own_or_admin on public.lesson_progress for select to authenticated using (user_id=auth.uid() or public.is_admin());
create policy progress_insert_active_enrollment on public.lesson_progress for insert to authenticated with check (
  user_id=auth.uid() and exists(
    select 1 from public.lessons l join public.enrollments e on e.course_id=l.course_id
    where l.id=lesson_progress.lesson_id and e.user_id=auth.uid() and e.status='active'
  )
);
create policy progress_update_active_enrollment on public.lesson_progress for update to authenticated using (user_id=auth.uid()) with check (
  user_id=auth.uid() and exists(
    select 1 from public.lessons l join public.enrollments e on e.course_id=l.course_id
    where l.id=lesson_progress.lesson_id and e.user_id=auth.uid() and e.status='active'
  )
);
grant select,insert,update on public.lesson_progress to authenticated;

-- PAYMENTS: students see own status only. Browser cannot insert/update payments.
create policy payments_select_own_or_admin on public.payments for select to authenticated using (user_id=auth.uid() or public.is_admin());
grant select on public.payments to authenticated;

-- Anonymous visitors do not get application tables.
revoke all on public.profiles,public.courses,public.lessons,public.enrollments,public.lesson_progress,public.payments from anon;

-- Initial FortifySec course. Change content/price in admin after first login.
insert into public.courses(title,slug,description,price_cents,published)
values('Formação FortifySec','formacao-fortifysec','Formação prática em cybersecurity com módulos progressivos.',299700,true)
on conflict(slug) do nothing;

insert into public.lessons(course_id,title,content,position,xp_reward)
select c.id,x.title,x.content,x.position,10
from public.courses c
cross join (values
 ('Introdução à plataforma','Conheça o funcionamento da FortifySec e sua trilha.',1),
 ('Fundamentos de Segurança','Conceitos essenciais para avançar nos laboratórios.',2),
 ('Primeiro desafio prático','Aplique os fundamentos em ambiente controlado.',3)
) as x(title,content,position)
where c.slug='formacao-fortifysec'
on conflict(course_id,position) do nothing;

-- IMPORTANTE: promova o PRIMEIRO admin manualmente após criar sua conta:
-- update public.profiles set role='admin' where email='SEU_EMAIL@DOMINIO.COM';
