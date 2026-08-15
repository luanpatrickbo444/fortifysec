-- FortifySec legacy profiles compatibility patch
-- Execute this ONLY when public.profiles already exists from an older FortifySec schema.
-- Safe to run more than once. It preserves existing users/data and only adds/backfills columns
-- required by the current V7.x application.

begin;

alter table public.profiles
  add column if not exists name text,
  add column if not exists email text,
  add column if not exists headline text,
  add column if not exists role text,
  add column if not exists blocked boolean,
  add column if not exists xp integer,
  add column if not exists created_at timestamptz,
  add column if not exists updated_at timestamptz,
  add column if not exists github_url text,
  add column if not exists linkedin_url text,
  add column if not exists profile_public boolean,
  add column if not exists open_to_work boolean;

-- Bring account data across from auth.users without deleting legacy profile information.
update public.profiles p
set email = coalesce(nullif(p.email, ''), u.email, '')
from auth.users u
where p.id = u.id
  and (p.email is null or p.email = '');

update public.profiles p
set name = coalesce(
  nullif(p.name, ''),
  nullif(u.raw_user_meta_data->>'name', ''),
  nullif(u.raw_user_meta_data->>'full_name', ''),
  nullif(split_part(coalesce(u.email, ''), '@', 1), ''),
  'Aluno'
)
from auth.users u
where p.id = u.id
  and (p.name is null or p.name = '');

update public.profiles set name = 'Aluno' where name is null or name = '';
update public.profiles set email = '' where email is null;
update public.profiles set role = 'student' where role is null or role = '';
update public.profiles set blocked = false where blocked is null;
update public.profiles set xp = 0 where xp is null;
update public.profiles set created_at = now() where created_at is null;
update public.profiles set updated_at = now() where updated_at is null;
update public.profiles set profile_public = false where profile_public is null;
update public.profiles set open_to_work = false where open_to_work is null;

alter table public.profiles alter column name set default 'Aluno';
alter table public.profiles alter column email set default '';
alter table public.profiles alter column role set default 'student';
alter table public.profiles alter column blocked set default false;
alter table public.profiles alter column xp set default 0;
alter table public.profiles alter column created_at set default now();
alter table public.profiles alter column updated_at set default now();
alter table public.profiles alter column profile_public set default false;
alter table public.profiles alter column open_to_work set default false;

alter table public.profiles alter column name set not null;
alter table public.profiles alter column email set not null;
alter table public.profiles alter column role set not null;
alter table public.profiles alter column blocked set not null;
alter table public.profiles alter column xp set not null;
alter table public.profiles alter column created_at set not null;
alter table public.profiles alter column updated_at set not null;
alter table public.profiles alter column profile_public set not null;
alter table public.profiles alter column open_to_work set not null;

commit;

NOTIFY pgrst, 'reload schema';

-- Diagnostic: all required columns should return true.
select
  exists(select 1 from information_schema.columns where table_schema='public' and table_name='profiles' and column_name='name') as name_ok,
  exists(select 1 from information_schema.columns where table_schema='public' and table_name='profiles' and column_name='email') as email_ok,
  exists(select 1 from information_schema.columns where table_schema='public' and table_name='profiles' and column_name='headline') as headline_ok,
  exists(select 1 from information_schema.columns where table_schema='public' and table_name='profiles' and column_name='role') as role_ok,
  exists(select 1 from information_schema.columns where table_schema='public' and table_name='profiles' and column_name='blocked') as blocked_ok,
  exists(select 1 from information_schema.columns where table_schema='public' and table_name='profiles' and column_name='xp') as xp_ok,
  exists(select 1 from information_schema.columns where table_schema='public' and table_name='profiles' and column_name='github_url') as github_ok,
  exists(select 1 from information_schema.columns where table_schema='public' and table_name='profiles' and column_name='linkedin_url') as linkedin_ok,
  exists(select 1 from information_schema.columns where table_schema='public' and table_name='profiles' and column_name='profile_public') as profile_public_ok,
  exists(select 1 from information_schema.columns where table_schema='public' and table_name='profiles' and column_name='open_to_work') as open_to_work_ok;
