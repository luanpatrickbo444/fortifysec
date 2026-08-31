-- Fortify Cloud 1.7 — integração Acronis Cyber Protect Cloud
-- Execute DEPOIS de 001, 002 e 003.

create extension if not exists pgcrypto;

alter table public.cloud_organizations
  add column if not exists provider text,
  add column if not exists provider_tenant_id text,
  add column if not exists provider_metadata jsonb not null default '{}'::jsonb,
  add column if not exists last_provider_sync_at timestamptz;

drop index if exists public.cloud_organizations_provider_tenant_uidx;
create unique index cloud_organizations_provider_tenant_uidx
  on public.cloud_organizations(provider, provider_tenant_id);

alter table public.cloud_protected_assets
  add column if not exists provider text,
  add column if not exists operating_system text,
  add column if not exists cyberfit_score integer,
  add column if not exists last_backup_at timestamptz,
  add column if not exists next_backup_at timestamptz,
  add column if not exists last_sync_at timestamptz,
  add column if not exists provider_metadata jsonb not null default '{}'::jsonb;

drop index if exists public.cloud_protected_assets_provider_ref_uidx;
create unique index cloud_protected_assets_provider_ref_uidx
  on public.cloud_protected_assets(organization_id, provider, provider_ref);

alter table public.cloud_incidents
  add column if not exists asset_id uuid references public.cloud_protected_assets(id) on delete set null,
  add column if not exists provider text,
  add column if not exists external_alert_id text,
  add column if not exists details jsonb not null default '{}'::jsonb,
  add column if not exists last_seen_at timestamptz;

drop index if exists public.cloud_incidents_provider_external_uidx;
create unique index cloud_incidents_provider_external_uidx
  on public.cloud_incidents(organization_id, provider, external_alert_id);

-- O índice original de jobs era parcial; recriamos como UNIQUE normal para o UPSERT da API.
drop index if exists public.cloud_backup_jobs_provider_external_uidx;
create unique index cloud_backup_jobs_provider_external_uidx
  on public.cloud_backup_jobs(organization_id, provider, external_job_id);

create table if not exists public.cloud_provider_sync_runs (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  organization_id uuid references public.cloud_organizations(id) on delete cascade,
  provider_tenant_id text,
  status text not null default 'running' check(status in ('running','success','warning','failed')),
  summary jsonb not null default '{}'::jsonb,
  error_message text,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists cloud_provider_sync_runs_provider_created_idx
  on public.cloud_provider_sync_runs(provider, created_at desc);
create index if not exists cloud_provider_sync_runs_org_created_idx
  on public.cloud_provider_sync_runs(organization_id, created_at desc);

alter table public.cloud_provider_sync_runs enable row level security;

drop policy if exists admin_all on public.cloud_provider_sync_runs;
create policy admin_all on public.cloud_provider_sync_runs
  for all to authenticated
  using (public.cloud_is_admin())
  with check (public.cloud_is_admin());

grant select,insert,update,delete on public.cloud_provider_sync_runs to authenticated;

-- Service-role ignora RLS; estas permissões mantêm o console admin consistente.
grant select,insert,update,delete on public.cloud_provider_sync_runs to service_role;

-- Índices úteis para o portal e para sincronização.
create index if not exists cloud_assets_org_provider_idx
  on public.cloud_protected_assets(organization_id, provider, last_sync_at desc);
create index if not exists cloud_incidents_org_provider_idx
  on public.cloud_incidents(organization_id, provider, opened_at desc);
