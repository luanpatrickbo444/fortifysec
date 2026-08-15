-- FortifySec V7.5 — Auth -> Profiles synchronization for legacy databases
-- Safe to run more than once after 000 + 001b compatibility patches.

begin;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles(
    id, name, email, role, blocked, xp,
    created_at, updated_at, profile_public, open_to_work
  )
  values(
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data->>'name',''),
      nullif(new.raw_user_meta_data->>'full_name',''),
      nullif(split_part(coalesce(new.email,''),'@',1),''),
      'Aluno'
    ),
    coalesce(new.email,''),
    'student',
    false,
    0,
    now(),
    now(),
    false,
    false
  )
  on conflict (id) do update
  set
    email = case when coalesce(public.profiles.email,'')='' then excluded.email else public.profiles.email end,
    name = case when coalesce(public.profiles.name,'')='' then excluded.name else public.profiles.name end,
    updated_at = now();

  return new;
end;
$$;

-- Recreate trigger so future signups always create the application profile.
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Backfill users that already exist in Auth but do not yet exist in public.profiles.
insert into public.profiles(
  id, name, email, role, blocked, xp,
  created_at, updated_at, profile_public, open_to_work
)
select
  u.id,
  coalesce(
    nullif(u.raw_user_meta_data->>'name',''),
    nullif(u.raw_user_meta_data->>'full_name',''),
    nullif(split_part(coalesce(u.email,''),'@',1),''),
    'Aluno'
  ),
  coalesce(u.email,''),
  'student',
  false,
  0,
  coalesce(u.created_at,now()),
  now(),
  false,
  false
from auth.users u
left join public.profiles p on p.id=u.id
where p.id is null
on conflict (id) do nothing;

-- Synchronize blank identity fields without changing an existing role/admin assignment.
update public.profiles p
set
  email = case when coalesce(p.email,'')='' then coalesce(u.email,'') else p.email end,
  name = case
    when coalesce(p.name,'')='' then coalesce(
      nullif(u.raw_user_meta_data->>'name',''),
      nullif(u.raw_user_meta_data->>'full_name',''),
      nullif(split_part(coalesce(u.email,''),'@',1),''),
      'Aluno'
    )
    else p.name
  end,
  updated_at = now()
from auth.users u
where p.id=u.id
  and (coalesce(p.email,'')='' or coalesce(p.name,'')='');

commit;

notify pgrst, 'reload schema';

-- Diagnostics: missing_profiles must be 0 and trigger_exists must be true.
select
  (select count(*) from auth.users u left join public.profiles p on p.id=u.id where p.id is null) as missing_profiles,
  exists(
    select 1 from pg_trigger t
    join pg_class c on c.oid=t.tgrelid
    join pg_namespace n on n.oid=c.relnamespace
    where n.nspname='auth' and c.relname='users' and t.tgname='on_auth_user_created' and not t.tgisinternal
  ) as trigger_exists;
