-- Fortify Cloud 1.1 — onboarding e operação gerenciada
create extension if not exists pgcrypto;

alter table public.cloud_organizations
  add column if not exists legal_name text,
  add column if not exists cnpj text,
  add column if not exists contact_email text,
  add column if not exists contact_phone text,
  add column if not exists employees text,
  add column if not exists data_volume text,
  add column if not exists rpo_target text,
  add column if not exists rto_target text,
  add column if not exists admin_notes text,
  add column if not exists updated_at timestamptz not null default now();

create table if not exists public.cloud_onboarding_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  organization_name text not null,
  legal_name text,
  cnpj text,
  contact_name text not null,
  contact_phone text,
  plan text not null default 'Business' check (plan in ('Essencial','Business','Enterprise')),
  employees text,
  data_volume text,
  infrastructure text,
  current_backup text,
  critical_systems text,
  rpo_target text,
  rto_target text,
  notes text,
  status text not null default 'submitted' check (status in ('draft','submitted','reviewing','needs_info','approved','rejected','provisioned')),
  admin_notes text,
  provisioned_organization_id uuid references public.cloud_organizations(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.cloud_onboarding_requests enable row level security;

drop policy if exists onboarding_owner_select on public.cloud_onboarding_requests;
create policy onboarding_owner_select on public.cloud_onboarding_requests
  for select to authenticated using (user_id = auth.uid() or public.cloud_is_admin());

drop policy if exists onboarding_owner_insert on public.cloud_onboarding_requests;
create policy onboarding_owner_insert on public.cloud_onboarding_requests
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists onboarding_owner_update on public.cloud_onboarding_requests;
create policy onboarding_owner_update on public.cloud_onboarding_requests
  for update to authenticated
  using (user_id = auth.uid() and status in ('draft','submitted','needs_info','rejected'))
  with check (user_id = auth.uid());

drop policy if exists onboarding_admin_all on public.cloud_onboarding_requests;
create policy onboarding_admin_all on public.cloud_onboarding_requests
  for all to authenticated using (public.cloud_is_admin()) with check (public.cloud_is_admin());

grant select,insert,update on public.cloud_onboarding_requests to authenticated;

-- Índices para as telas operacionais.
create index if not exists cloud_onboarding_status_idx on public.cloud_onboarding_requests(status, updated_at desc);
create index if not exists cloud_backup_jobs_org_finished_idx on public.cloud_backup_jobs(organization_id, finished_at desc);
create index if not exists cloud_incidents_org_status_idx on public.cloud_incidents(organization_id, status, opened_at desc);
create index if not exists cloud_recovery_org_created_idx on public.cloud_recovery_tests(organization_id, created_at desc);
