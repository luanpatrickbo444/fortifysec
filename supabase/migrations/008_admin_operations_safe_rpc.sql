-- FortifySec — safe admin write RPCs for Lessons / Challenges / CTF
-- This migration does NOT change routing, auth redirects, proxy.ts or next.config.ts.
-- Writes are executed with SECURITY DEFINER, but every function verifies public.is_admin().

create or replace function public.admin_create_lesson_safe(
  p_course_id uuid,
  p_module_id uuid default null,
  p_title text default '',
  p_summary text default '',
  p_content text default '',
  p_video_url text default null,
  p_position integer default null,
  p_xp_reward integer default 10,
  p_published boolean default true
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_position integer;
begin
  if auth.uid() is null or not public.is_admin() then
    raise exception 'admin_required' using errcode = '42501';
  end if;

  if p_course_id is null or nullif(btrim(coalesce(p_title,'')), '') is null then
    raise exception 'invalid_lesson_data' using errcode = '22023';
  end if;

  perform 1 from public.courses where id = p_course_id;
  if not found then
    raise exception 'course_not_found' using errcode = '22023';
  end if;

  if p_module_id is not null then
    perform 1
      from public.course_modules
     where id = p_module_id
       and course_id = p_course_id;
    if not found then
      raise exception 'module_not_in_course' using errcode = '22023';
    end if;
  end if;

  v_position := case when coalesce(p_position, 0) > 0 then p_position else null end;

  -- If the requested position is empty OR already occupied, append safely.
  if v_position is null
     or exists (
       select 1 from public.lessons
        where course_id = p_course_id
          and position = v_position
     ) then
    select coalesce(max(position), 0) + 1
      into v_position
      from public.lessons
     where course_id = p_course_id;
  end if;

  insert into public.lessons(
    course_id, module_id, title, summary, content, video_url,
    position, xp_reward, published
  ) values (
    p_course_id,
    p_module_id,
    btrim(p_title),
    coalesce(p_summary,''),
    coalesce(p_content,''),
    nullif(btrim(coalesce(p_video_url,'')),''),
    v_position,
    greatest(coalesce(p_xp_reward,10),0),
    coalesce(p_published,true)
  )
  returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.admin_create_lesson_safe(uuid,uuid,text,text,text,text,integer,integer,boolean) from public;
grant execute on function public.admin_create_lesson_safe(uuid,uuid,text,text,text,text,integer,integer,boolean) to authenticated;


create or replace function public.admin_create_challenge_safe(
  p_title text,
  p_slug text,
  p_description text default '',
  p_category text default 'Web',
  p_difficulty text default 'Easy',
  p_xp_reward integer default 50,
  p_briefing text default '',
  p_flag text default '',
  p_lab_id uuid default null
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if auth.uid() is null or not public.is_admin() then
    raise exception 'admin_required' using errcode = '42501';
  end if;

  if nullif(btrim(coalesce(p_title,'')), '') is null
     or nullif(btrim(coalesce(p_slug,'')), '') is null
     or nullif(btrim(coalesce(p_flag,'')), '') is null then
    raise exception 'invalid_challenge_data' using errcode = '22023';
  end if;

  if p_lab_id is not null then
    perform 1 from public.labs where id = p_lab_id;
    if not found then
      raise exception 'lab_not_found' using errcode = '22023';
    end if;
  end if;

  insert into public.challenges(
    title, slug, description, category, difficulty,
    xp_reward, briefing, flag_hash, published, lab_id
  ) values (
    btrim(p_title),
    btrim(p_slug),
    coalesce(p_description,''),
    coalesce(p_category,'Web'),
    coalesce(p_difficulty,'Easy'),
    greatest(coalesce(p_xp_reward,50),0),
    coalesce(p_briefing,''),
    digest(btrim(p_flag),'sha256'),
    true,
    p_lab_id
  )
  returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.admin_create_challenge_safe(text,text,text,text,text,integer,text,text,uuid) from public;
grant execute on function public.admin_create_challenge_safe(text,text,text,text,text,integer,text,text,uuid) to authenticated;


create or replace function public.admin_set_challenge_published_safe(
  p_challenge_id uuid,
  p_published boolean
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or not public.is_admin() then
    raise exception 'admin_required' using errcode = '42501';
  end if;

  update public.challenges
     set published = coalesce(p_published,false),
         updated_at = now()
   where id = p_challenge_id;

  return found;
end;
$$;

revoke all on function public.admin_set_challenge_published_safe(uuid,boolean) from public;
grant execute on function public.admin_set_challenge_published_safe(uuid,boolean) to authenticated;


create or replace function public.admin_create_ctf_safe(
  p_title text,
  p_description text,
  p_starts_at timestamptz,
  p_ends_at timestamptz,
  p_prize_text text,
  p_status text
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if auth.uid() is null or not public.is_admin() then
    raise exception 'admin_required' using errcode = '42501';
  end if;

  if nullif(btrim(coalesce(p_title,'')), '') is null then
    raise exception 'invalid_ctf_title' using errcode = '22023';
  end if;

  if p_starts_at is null or p_ends_at is null or p_ends_at <= p_starts_at then
    raise exception 'ctf_end_must_be_after_start' using errcode = '22023';
  end if;

  if p_status not in ('scheduled','live','finished') then
    raise exception 'invalid_ctf_status' using errcode = '22023';
  end if;

  insert into public.ctf_events(
    title, description, starts_at, ends_at, prize_text, status
  ) values (
    btrim(p_title),
    coalesce(p_description,''),
    p_starts_at,
    p_ends_at,
    nullif(btrim(coalesce(p_prize_text,'')),''),
    p_status
  )
  returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.admin_create_ctf_safe(text,text,timestamptz,timestamptz,text,text) from public;
grant execute on function public.admin_create_ctf_safe(text,text,timestamptz,timestamptz,text,text) to authenticated;


create or replace function public.admin_update_ctf_status_safe(
  p_event_id uuid,
  p_status text
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or not public.is_admin() then
    raise exception 'admin_required' using errcode = '42501';
  end if;

  if p_status not in ('scheduled','live','finished') then
    raise exception 'invalid_ctf_status' using errcode = '22023';
  end if;

  update public.ctf_events set status = p_status where id = p_event_id;
  return found;
end;
$$;

revoke all on function public.admin_update_ctf_status_safe(uuid,text) from public;
grant execute on function public.admin_update_ctf_status_safe(uuid,text) to authenticated;


create or replace function public.admin_link_challenge_to_ctf_safe(
  p_event_id uuid,
  p_challenge_id uuid,
  p_position integer default 1
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or not public.is_admin() then
    raise exception 'admin_required' using errcode = '42501';
  end if;

  perform 1 from public.ctf_events where id = p_event_id;
  if not found then
    raise exception 'ctf_not_found' using errcode = '22023';
  end if;

  perform 1 from public.challenges where id = p_challenge_id and published = true;
  if not found then
    raise exception 'published_challenge_not_found' using errcode = '22023';
  end if;

  insert into public.ctf_event_challenges(event_id, challenge_id, position)
  values(p_event_id, p_challenge_id, greatest(coalesce(p_position,1),1))
  on conflict(event_id, challenge_id)
  do update set position = excluded.position;

  return true;
end;
$$;

revoke all on function public.admin_link_challenge_to_ctf_safe(uuid,uuid,integer) from public;
grant execute on function public.admin_link_challenge_to_ctf_safe(uuid,uuid,integer) to authenticated;


create or replace function public.admin_unlink_challenge_from_ctf_safe(
  p_event_id uuid,
  p_challenge_id uuid
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or not public.is_admin() then
    raise exception 'admin_required' using errcode = '42501';
  end if;

  delete from public.ctf_event_challenges
   where event_id = p_event_id
     and challenge_id = p_challenge_id;

  return true;
end;
$$;

revoke all on function public.admin_unlink_challenge_from_ctf_safe(uuid,uuid) from public;
grant execute on function public.admin_unlink_challenge_from_ctf_safe(uuid,uuid) to authenticated;

create or replace function public.admin_set_lesson_published_safe(
  p_lesson_id uuid,
  p_published boolean
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or not public.is_admin() then
    raise exception 'admin_required' using errcode = '42501';
  end if;

  update public.lessons
     set published = coalesce(p_published,false)
   where id = p_lesson_id;

  return found;
end;
$$;

revoke all on function public.admin_set_lesson_published_safe(uuid,boolean) from public;
grant execute on function public.admin_set_lesson_published_safe(uuid,boolean) to authenticated;


create or replace function public.admin_delete_lesson_safe(
  p_lesson_id uuid
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or not public.is_admin() then
    raise exception 'admin_required' using errcode = '42501';
  end if;

  delete from public.lessons where id = p_lesson_id;
  return true;
end;
$$;

revoke all on function public.admin_delete_lesson_safe(uuid) from public;
grant execute on function public.admin_delete_lesson_safe(uuid) to authenticated;
