-- FortifySec V7 — Operations Console
-- Adds course modules, lesson publishing controls, editable site settings and CTF challenge linking.

create table if not exists public.course_modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  description text not null default '',
  position integer not null check(position > 0),
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(course_id, position)
);

alter table public.lessons add column if not exists module_id uuid references public.course_modules(id) on delete set null;
alter table public.lessons add column if not exists summary text not null default '';
alter table public.lessons add column if not exists published boolean not null default true;
create index if not exists lessons_module_idx on public.lessons(module_id, position);
create index if not exists course_modules_course_idx on public.course_modules(course_id, position);

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

insert into public.site_settings(key,value) values
('platform', jsonb_build_object(
  'announcement','',
  'support_email','contato@fortifysec.com.br',
  'academy_cta','Explorar Academy',
  'labs_cta','Abrir Cyber Range',
  'ctf_prize_label','R$ 15.000',
  'maintenance_mode',false
)) on conflict(key) do nothing;

create table if not exists public.ctf_event_challenges (
  event_id uuid not null references public.ctf_events(id) on delete cascade,
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  position integer not null default 1,
  points_override integer,
  primary key(event_id, challenge_id)
);
create index if not exists ctf_event_challenges_event_idx on public.ctf_event_challenges(event_id, position);

alter table public.course_modules enable row level security;
alter table public.site_settings enable row level security;
alter table public.ctf_event_challenges enable row level security;

-- Students see published modules only when they have active course access. Admins see all.
drop policy if exists course_modules_read on public.course_modules;
create policy course_modules_read on public.course_modules for select to authenticated using (
  public.current_user_active() and (
    public.is_admin() or (
      published=true and exists(
        select 1 from public.enrollments e
        where e.user_id=auth.uid() and e.course_id=course_modules.course_id and e.status='active'
      )
    )
  )
);

-- Tighten lesson visibility with the new publishing flag.
drop policy if exists lessons_select_enrolled on public.lessons;
create policy lessons_select_enrolled on public.lessons for select to authenticated using (
  public.current_user_active() and (
    public.is_admin() or (
      published=true and exists(
        select 1 from public.enrollments e
        where e.user_id=auth.uid() and e.course_id=lessons.course_id and e.status='active'
      )
    )
  )
);

-- Site settings are editable only from service-role server actions. Authenticated users may read public settings.
drop policy if exists site_settings_read on public.site_settings;
create policy site_settings_read on public.site_settings for select to anon, authenticated using (true);

-- CTF challenge composition can be read by authenticated users; writes stay server-side.
drop policy if exists ctf_links_read on public.ctf_event_challenges;
create policy ctf_links_read on public.ctf_event_challenges for select to authenticated using (public.current_user_active());

grant select on public.course_modules to authenticated;
grant select(id,course_id,module_id,title,summary,content,video_url,position,xp_reward,published,created_at) on public.lessons to authenticated;
grant select on public.site_settings to anon, authenticated;
grant select on public.ctf_event_challenges to authenticated;

revoke all on public.course_modules,public.ctf_event_challenges from anon;
