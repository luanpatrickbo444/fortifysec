-- Fortify Cloud OPS V4 — telemetria de uso Acronis e correção de inventário
-- Execute DEPOIS de 005_ops_support_reports.sql.

alter table public.cloud_organizations
  add column if not exists provider_storage_bytes bigint,
  add column if not exists provider_immutable_storage_bytes bigint,
  add column if not exists provider_usage_synced_at timestamptz;

comment on column public.cloud_organizations.provider_storage_bytes is
  'Storage em nuvem consumido no provider. Para Acronis vem de /api/2/tenants/usages (usage_name=storage).';
comment on column public.cloud_organizations.provider_immutable_storage_bytes is
  'Parcela de immutable storage reportada pelo provider quando disponível.';

create index if not exists cloud_org_provider_usage_sync_idx
  on public.cloud_organizations(provider, provider_usage_synced_at desc);
