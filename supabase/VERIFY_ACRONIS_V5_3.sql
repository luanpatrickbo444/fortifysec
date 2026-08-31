-- Fortify Cloud V5.3 — diagnóstico Acronis (somente leitura)
-- Pode ser executado no Supabase SQL Editor sem alterar dados.

-- 1) Organização e telemetria do provider
select
  id, name, status, provider, provider_tenant_id,
  last_provider_sync_at, provider_usage_synced_at,
  provider_storage_bytes, provider_immutable_storage_bytes
from public.cloud_organizations
where upper(name) = 'FORTIFY-LAB';

-- 2) Ativos Acronis reconhecidos
select
  id, organization_id, name, asset_type, status, provider, provider_ref,
  policy_name, operating_system, cyberfit_score,
  last_backup_at, next_backup_at, last_sync_at
from public.cloud_protected_assets
where provider = 'acronis'
order by last_sync_at desc nulls last;

-- 3) Jobs e vínculo com o ativo
select
  j.id,
  j.organization_id,
  j.asset_id,
  a.name as asset_name,
  j.status,
  j.started_at,
  j.finished_at,
  j.external_job_id,
  coalesce(
    j.details #>> '{context,Persistent,Name}',
    j.details #>> '{context,name}',
    j.details ->> 'resourceName',
    j.details ->> 'resource_name'
  ) as source_from_payload
from public.cloud_backup_jobs j
left join public.cloud_protected_assets a on a.id = j.asset_id
where j.provider = 'acronis'
order by j.finished_at desc nulls last
limit 100;

-- 4) Deve chegar a zero depois de uma sincronização V5.3 em tenant de uma máquina
select count(*) as orphan_backup_jobs
from public.cloud_backup_jobs
where provider = 'acronis' and asset_id is null;

-- 5) Histórico de sincronização, incluindo trigger manual/api/cron no summary
select
  created_at, finished_at, status, organization_id, provider_tenant_id,
  summary ->> 'trigger' as trigger,
  summary ->> 'assets' as assets,
  summary ->> 'backupJobs' as backup_jobs,
  summary ->> 'incidents' as incidents,
  error_message
from public.cloud_provider_sync_runs
where provider = 'acronis'
order by created_at desc
limit 30;
