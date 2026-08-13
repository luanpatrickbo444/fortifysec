-- Execute este arquivo uma vez no SQL Editor do Supabase.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text default '',
  role text not null default 'student' check (role in ('student','admin')),
  created_at timestamptz not null default now()
);
create unique index if not exists profiles_email_lower_unique on public.profiles(lower(email));

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text default '',
  thumbnail_url text default '',
  workload_hours integer not null default 0,
  published boolean not null default false,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  position integer not null default 0
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  title text not null,
  description text default '',
  youtube_url text default '',
  duration_minutes integer not null default 0,
  position integer not null default 0,
  published boolean not null default true
);

create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  status text not null default 'active' check (status in ('active','blocked','refunded')),
  source text not null default 'manual',
  payment_id text,
  enrolled_at timestamptz not null default now(),
  unique(user_id, course_id)
);

create table if not exists public.lesson_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  completed boolean not null default false,
  watched_seconds integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key(user_id, lesson_id)
);

create table if not exists public.payment_events (
  payment_id text primary key,
  user_id uuid references auth.users(id) on delete set null,
  status text not null,
  amount numeric(10,2),
  raw jsonb not null,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles(id,email,full_name)
  values(new.id,coalesce(new.email,''),coalesce(new.raw_user_meta_data->>'full_name',''))
  on conflict(id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.enrollments enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.payment_events enable row level security;

-- O navegador acessa dados apenas pelas APIs autenticadas da aplicação.
-- A service role usada no servidor ignora RLS; nunca exponha essa chave no cliente.

insert into public.courses(title,slug,description,workload_hours,published,position)
values('Formação Completa FortifySec','formacao-fortifysec','37 cursos de Cybersecurity, Ethical Hacking e Red Team.',633,true,1)
on conflict(slug) do nothing;

-- Depois de criar sua conta, torne-a administradora substituindo o e-mail:
-- update public.profiles set role='admin' where email='seu@email.com';
