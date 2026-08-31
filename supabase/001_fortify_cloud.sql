create extension if not exists pgcrypto;

create table if not exists public.cloud_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'client' check (role in ('client','admin')),
  created_at timestamptz not null default now()

);

create or replace function public.fortify_cloud_handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
begin
  insert into public.cloud_profiles(id, full_name) values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1))) on conflict(id) do nothing;
  return new;
end;
$$;
drop trigger if exists fortify_cloud_on_auth_user_created on auth.users;
create trigger fortify_cloud_on_auth_user_created after insert on auth.users for each row execute procedure public.fortify_cloud_handle_new_user();

create table if not exists public.cloud_organizations (
  id uuid primary key default gen_random_uuid(), name text not null, plan text not null default 'Essencial', status text not null default 'onboarding', created_at timestamptz not null default now()
);
create table if not exists public.cloud_organization_members (
  organization_id uuid references public.cloud_organizations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  member_role text not null default 'viewer' check(member_role in ('admin','operator','viewer')),
  created_at timestamptz not null default now(), primary key(organization_id,user_id)
);
create table if not exists public.cloud_protected_assets (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.cloud_organizations(id) on delete cascade,
  name text not null, asset_type text not null, owner_area text, policy_name text, status text not null default 'pending', provider_ref text, protected_bytes bigint not null default 0, created_at timestamptz not null default now()
);
create unique index if not exists cloud_protected_assets_org_name_uidx on public.cloud_protected_assets(organization_id,name);

create table if not exists public.cloud_backup_jobs (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.cloud_organizations(id) on delete cascade,
  asset_id uuid references public.cloud_protected_assets(id) on delete set null, provider text, external_job_id text,
  status text not null, started_at timestamptz, finished_at timestamptz, bytes_processed bigint, retention_label text, details jsonb not null default '{}'::jsonb, created_at timestamptz not null default now()
);
create unique index if not exists cloud_backup_jobs_provider_external_uidx on public.cloud_backup_jobs(organization_id,provider,external_job_id) where external_job_id is not null;

create table if not exists public.cloud_recovery_tests (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.cloud_organizations(id) on delete cascade,
  asset_id uuid references public.cloud_protected_assets(id) on delete set null, test_type text not null, status text not null default 'planned', scheduled_at timestamptz, completed_at timestamptz, rto_seconds integer, evidence_url text, notes text, created_at timestamptz not null default now()
);
create table if not exists public.cloud_incidents (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.cloud_organizations(id) on delete cascade,
  title text not null, severity text not null default 'medium', status text not null default 'open', opened_at timestamptz not null default now(), resolved_at timestamptz, summary text
);
create table if not exists public.cloud_monthly_reports (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.cloud_organizations(id) on delete cascade,
  reference_month date not null, health_score numeric(5,2), backup_success_rate numeric(5,2), recovery_tests_passed integer default 0, incidents_count integer default 0, report_url text, created_at timestamptz not null default now(), unique(organization_id,reference_month)
);
create table if not exists public.cloud_support_tickets (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.cloud_organizations(id) on delete cascade,
  opened_by uuid references auth.users(id) on delete set null, subject text not null, priority text not null default 'normal', description text not null, status text not null default 'open', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.cloud_leads (
  id uuid primary key default gen_random_uuid(), name text not null, company text not null, email text not null, phone text, employees text, data_volume text, message text, status text not null default 'new', created_at timestamptz not null default now()
);
create table if not exists public.cloud_integration_events (
  id uuid primary key default gen_random_uuid(), organization_id uuid references public.cloud_organizations(id) on delete set null,
  provider text not null, event_type text not null, external_id text, payload jsonb not null default '{}'::jsonb, received_at timestamptz not null default now()
);

create or replace function public.cloud_is_admin() returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.cloud_profiles where id=auth.uid() and role='admin');
$$;
create or replace function public.cloud_is_org_member(org uuid) returns boolean language sql stable security definer set search_path=public as $$
  select public.cloud_is_admin() or exists(select 1 from public.cloud_organization_members where organization_id=org and user_id=auth.uid());
$$;
create or replace function public.cloud_can_view_profile(target uuid) returns boolean language sql stable security definer set search_path=public as $$
  select public.cloud_is_admin() or target=auth.uid() or exists(
    select 1 from public.cloud_organization_members mine
    join public.cloud_organization_members theirs on theirs.organization_id=mine.organization_id
    where mine.user_id=auth.uid() and theirs.user_id=target
  );
$$;

alter table public.cloud_profiles enable row level security;
alter table public.cloud_organizations enable row level security;
alter table public.cloud_organization_members enable row level security;
alter table public.cloud_protected_assets enable row level security;
alter table public.cloud_backup_jobs enable row level security;
alter table public.cloud_recovery_tests enable row level security;
alter table public.cloud_incidents enable row level security;
alter table public.cloud_monthly_reports enable row level security;
alter table public.cloud_support_tickets enable row level security;
alter table public.cloud_leads enable row level security;
alter table public.cloud_integration_events enable row level security;

drop policy if exists profiles_self_or_admin on public.cloud_profiles;
create policy profiles_self_or_admin on public.cloud_profiles for select using(public.cloud_can_view_profile(id));
drop policy if exists org_member_select on public.cloud_organizations;
create policy org_member_select on public.cloud_organizations for select using(public.cloud_is_org_member(id));
drop policy if exists member_select on public.cloud_organization_members;
create policy member_select on public.cloud_organization_members for select using(public.cloud_is_org_member(organization_id));

do $$ declare t text; begin
  foreach t in array array['cloud_protected_assets','cloud_backup_jobs','cloud_recovery_tests','cloud_incidents','cloud_monthly_reports','cloud_support_tickets'] loop
    execute format('drop policy if exists org_access on public.%I',t);
    execute format('create policy org_access on public.%I for select using(public.cloud_is_org_member(organization_id))',t);
  end loop;
end $$;

drop policy if exists support_insert on public.cloud_support_tickets;
create policy support_insert on public.cloud_support_tickets for insert with check(public.cloud_is_org_member(organization_id) and opened_by=auth.uid());
drop policy if exists admin_all_orgs on public.cloud_organizations;
create policy admin_all_orgs on public.cloud_organizations for all using(public.cloud_is_admin()) with check(public.cloud_is_admin());

do $$ declare t text; begin
  foreach t in array array['cloud_organization_members','cloud_protected_assets','cloud_backup_jobs','cloud_recovery_tests','cloud_incidents','cloud_monthly_reports','cloud_support_tickets','cloud_integration_events','cloud_leads'] loop
    execute format('drop policy if exists admin_all on public.%I',t);
    execute format('create policy admin_all on public.%I for all using(public.cloud_is_admin()) with check(public.cloud_is_admin())',t);
  end loop;
end $$;

-- Leads públicos são inseridos pela Server Action usando a sessão anon.
-- Para aceitar o formulário sem service-role no servidor, habilite INSERT anônimo apenas nesta tabela.
drop policy if exists public_lead_insert on public.cloud_leads;
create policy public_lead_insert on public.cloud_leads for insert to anon, authenticated with check (true);

grant usage on schema public to anon, authenticated;
grant insert on public.cloud_leads to anon;
grant select on public.cloud_profiles,public.cloud_organizations,public.cloud_organization_members,public.cloud_protected_assets,public.cloud_backup_jobs,public.cloud_recovery_tests,public.cloud_incidents,public.cloud_monthly_reports,public.cloud_support_tickets,public.cloud_integration_events,public.cloud_leads to authenticated;
grant insert on public.cloud_support_tickets to authenticated;
-- Admins recebem as mesmas permissões SQL do papel authenticated; as policies RLS acima decidem quem pode alterar.
grant insert,update,delete on public.cloud_organizations,public.cloud_organization_members,public.cloud_protected_assets,public.cloud_backup_jobs,public.cloud_recovery_tests,public.cloud_incidents,public.cloud_monthly_reports,public.cloud_integration_events,public.cloud_leads,public.cloud_support_tickets to authenticated;
