import { createAdminClient } from '@/lib/supabase/admin'
import { getAcronisWorkloads, type AcronisWorkload } from './workloads'
import {
  backupPolicy,
  extractCyberfitScore,
  extractOperatingSystem,
  getAcronisResourceAttributes,
  getAcronisResourceStatuses,
  getAcronisPolicyStatuses,
  mergeResourceAndPolicyStatus,
  normalizeProtectionStatus,
  protectionPlanName,
  type AcronisResourceStatus,
} from './protection'
import {
  activityAssetNames,
  activityAssetProviderRefs,
  activityExternalId,
  getAcronisActivities,
  isBackupActivity,
  normalizeActivityStatus,
  type AcronisActivity,
} from './activities'
import { alertTimestamp, getAcronisAlerts, normalizeAlertSeverity } from './alerts'
import { getAcronisStorageUsage } from './usage'

export type AcronisSyncResult = {
  organizationId: string
  organizationName: string
  tenantId: string
  assets: number
  backupJobs: number
  incidents: number
  events: number
  storageBytes: number | null
  immutableStorageBytes: number | null
  warnings: string[]
  trigger: 'manual' | 'cron' | 'api'
}

type AssetCandidate = {
  providerRef: string
  name: string
  workload: AcronisWorkload | null
  status: AcronisResourceStatus | null
  activity: AcronisActivity | null
}

type SyncedAsset = {
  id: string
  providerRef: string
  name: string
  lastBackupAt: string | null
  backup: ReturnType<typeof backupPolicy>
}

function resourceIdFromWorkload(workload: Record<string, unknown>) {
  return String(workload.id ?? workload.external_id ?? '')
}

function workloadType(workload: Record<string, unknown> | null, os: string | null, status?: AcronisResourceStatus | null) {
  const raw = String(workload?.type_alias ?? workload?.type ?? status?.context?.type ?? '').toLowerCase()
  if (raw.includes('server') || /server/i.test(os ?? '')) return 'server'
  if (raw.includes('virtual') || raw.includes('vm')) return 'virtual-machine'
  if (raw.includes('machine') || raw.includes('workstation')) return 'workstation'
  return 'workload'
}

function statusName(status: AcronisResourceStatus) {
  return String(status.context?.name ?? status.context?.user_defined_name ?? '').trim()
}

function statusRef(status: AcronisResourceStatus) {
  return String(status.context?.id ?? status.context?.external_id ?? '').trim()
}

function activityTimestamp(activity: AcronisActivity) {
  const raw = activity.completedAt ?? activity.updatedAt ?? activity.startedAt ?? activity.createdAt ?? ''
  const time = new Date(raw).getTime()
  return Number.isFinite(time) ? time : 0
}

function mergeAssetCandidates(workloads: AcronisWorkload[], statuses: AcronisResourceStatus[], activities: AcronisActivity[]) {
  const byRef = new Map<string, AssetCandidate>()
  const statusByName = new Map<string, AcronisResourceStatus>()
  const statusByRef = new Map<string, AcronisResourceStatus>()
  for (const status of statuses) {
    const name = statusName(status)
    const ref = statusRef(status)
    if (name) statusByName.set(name.toLowerCase(), status)
    if (ref) statusByRef.set(ref, status)
  }

  for (const workload of workloads) {
    const providerRef = resourceIdFromWorkload(workload)
    const name = String(workload.name ?? '').trim()
    if (!providerRef || !name) continue
    const status = statusByRef.get(providerRef) ?? statusByName.get(name.toLowerCase()) ?? null
    byRef.set(providerRef, { providerRef, name, workload, status, activity: null })
  }

  // Resource Status is authoritative enough to represent protected machines even
  // when Workload Management returns no item for a tenant/agent combination.
  for (const status of statuses) {
    const providerRef = statusRef(status)
    const name = statusName(status)
    if (!providerRef || !name) continue
    const existing = byRef.get(providerRef)
    if (existing) {
      existing.status = status
      continue
    }
    const sameName = [...byRef.values()].find((candidate) => candidate.name.toLowerCase() === name.toLowerCase())
    if (sameName) {
      sameName.status = status
      continue
    }
    byRef.set(providerRef, { providerRef, name, workload: null, status, activity: null })
  }

  // Task Manager is a third inventory source. Some Acronis tenants expose a
  // successful backup activity before Workload Management/Resource Management
  // exposes the corresponding machine. We still create a stable Fortify asset
  // from the activity so the portal never degrades to "Ativo não identificado".
  for (const activity of activities.filter(isBackupActivity).sort((a, b) => activityTimestamp(b) - activityTimestamp(a))) {
    const names = activityAssetNames(activity)
    const refs = activityAssetProviderRefs(activity)
    const name = names[0] ?? ''
    if (!name) continue
    const existingByRef = refs.map((ref) => byRef.get(ref)).find(Boolean)
    const existingByName = [...byRef.values()].find((candidate) => candidate.name.toLowerCase() === name.toLowerCase())
    const existing = existingByRef ?? existingByName
    if (existing) {
      if (!existing.activity || activityTimestamp(activity) > activityTimestamp(existing.activity)) existing.activity = activity
      continue
    }
    const providerRef = refs[0] ?? `activity-name:${name.toLowerCase().replace(/[^a-z0-9._-]+/g, '-')}`
    byRef.set(providerRef, { providerRef, name, workload: null, status: null, activity })
  }

  return [...byRef.values()]
}

function nearSameBackup(a?: string | null, b?: string | null) {
  if (!a || !b) return false
  const aa = new Date(a).getTime()
  const bb = new Date(b).getTime()
  return Number.isFinite(aa) && Number.isFinite(bb) && Math.abs(aa - bb) <= 5 * 60 * 1000
}

async function logSyncRun(input: {
  organizationId?: string | null
  tenantId?: string | null
  status: string
  summary?: unknown
  error?: string | null
}) {
  const admin = createAdminClient()
  if (!admin) return
  await admin.from('cloud_provider_sync_runs').insert({
    provider: 'acronis',
    organization_id: input.organizationId ?? null,
    provider_tenant_id: input.tenantId ?? null,
    status: input.status,
    summary: input.summary ?? {},
    error_message: input.error ?? null,
    finished_at: new Date().toISOString(),
  })
}

async function upsertIntegrationEvent(
  organizationId: string,
  eventType: string,
  externalId: string | null,
  payload: unknown,
) {
  const admin = createAdminClient()
  if (!admin) throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for Acronis sync.')

  if (externalId) {
    const { data: existing } = await admin
      .from('cloud_integration_events')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('provider', 'acronis')
      .eq('event_type', eventType)
      .eq('external_id', externalId)
      .limit(1)
      .maybeSingle()
    if (existing?.id) return false
  }

  await admin.from('cloud_integration_events').insert({
    organization_id: organizationId,
    provider: 'acronis',
    event_type: eventType,
    external_id: externalId,
    payload,
  })
  return true
}

function resolveActivityAssetId(
  activity: AcronisActivity,
  assetIdByName: Map<string, string>,
  assetIdByProviderRef: Map<string, string>,
) {
  for (const ref of activityAssetProviderRefs(activity)) {
    const match = assetIdByProviderRef.get(ref)
    if (match) return match
  }
  for (const name of activityAssetNames(activity)) {
    const match = assetIdByName.get(name.toLowerCase())
    if (match) return match
  }
  // A single-machine tenant is unambiguous and this repairs older Acronis
  // activities that do not expose machine identifiers in their activity payload.
  const uniqueIds = [...new Set(assetIdByProviderRef.values())]
  return uniqueIds.length === 1 ? uniqueIds[0] : null
}

export async function syncAcronisOrganization(organizationId: string, trigger: 'manual' | 'cron' | 'api' = 'manual'): Promise<AcronisSyncResult> {
  const admin = createAdminClient()
  if (!admin) throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for Acronis sync.')

  const { data: org, error: orgError } = await admin
    .from('cloud_organizations')
    .select('id,name,provider,provider_tenant_id,provider_metadata')
    .eq('id', organizationId)
    .single()
  if (orgError || !org) throw new Error('Fortify organization not found.')
  if (org.provider !== 'acronis' || !org.provider_tenant_id) throw new Error('Organization is not mapped to an Acronis tenant.')

  const tenantId = String(org.provider_tenant_id)
  const warnings: string[] = []
  let assetsCount = 0
  let jobsCount = 0
  let incidentsCount = 0
  let eventsCount = 0
  let storageBytes: number | null = null
  let immutableStorageBytes: number | null = null

  try {
    const [workloads, statuses, policyStatuses, activities, alerts, usage] = await Promise.all([
      getAcronisWorkloads(tenantId).catch((error) => { warnings.push(`workloads: ${String(error)}`); return [] }),
      getAcronisResourceStatuses(tenantId).catch((error) => { warnings.push(`resource_statuses: ${String(error)}`); return [] }),
      getAcronisPolicyStatuses(tenantId).catch((error) => { warnings.push(`policy_statuses: ${String(error)}`); return [] }),
      getAcronisActivities(tenantId).catch((error) => { warnings.push(`activities: ${String(error)}`); return [] }),
      getAcronisAlerts(tenantId).catch((error) => { warnings.push(`alerts: ${String(error)}`); return [] }),
      getAcronisStorageUsage(tenantId).catch((error) => { warnings.push(`usage: ${String(error)}`); return null }),
    ])

    if (usage) {
      storageBytes = usage.storageBytes
      immutableStorageBytes = usage.immutableStorageBytes
    }

    const policyStatusById = new Map<string, any>()
    const policyStatusByName = new Map<string, any>()
    for (const status of policyStatuses) {
      const id = String(status.context?.id ?? '')
      const external = String(status.context?.external_id ?? '')
      const name = String(status.context?.user_defined_name ?? status.context?.name ?? '').trim().toLowerCase()
      if (id) policyStatusById.set(id, status)
      if (external) policyStatusById.set(external, status)
      if (name) policyStatusByName.set(name, status)
    }

    const candidates = mergeAssetCandidates(workloads, statuses, activities)
    if (!candidates.length) warnings.push('No machine workloads/resource statuses returned for this tenant.')

    const assetIdByName = new Map<string, string>()
    const assetIdByProviderRef = new Map<string, string>()
    const syncedAssets: SyncedAsset[] = []

    for (const candidate of candidates) {
      const statusResourceRef = statusRef(candidate.status ?? {}) || candidate.providerRef
      let attributes = null
      if (candidate.status || candidate.workload) {
        try { attributes = await getAcronisResourceAttributes(tenantId, statusResourceRef) }
        catch (error) { warnings.push(`attributes ${candidate.name}: ${String(error)}`) }
      }

      const cyberfit = extractCyberfitScore(attributes)
      const os = extractOperatingSystem(attributes)
      const policyStatus = policyStatusById.get(candidate.providerRef)
        ?? policyStatusById.get(statusResourceRef)
        ?? policyStatusByName.get(candidate.name.toLowerCase())
        ?? null
      const effectiveStatus = mergeResourceAndPolicyStatus(candidate.status, policyStatus)
      const backup = backupPolicy(effectiveStatus)
      const activityState = candidate.activity ? normalizeActivityStatus(candidate.activity) : null
      const activityBackupAt = candidate.activity && activityState === 'success'
        ? candidate.activity.completedAt ?? candidate.activity.updatedAt ?? candidate.activity.startedAt ?? candidate.activity.createdAt ?? null
        : null
      const lastBackupAt = backup?.last_success_run ?? activityBackupAt
      const nextBackupAt = backup?.next_run_time ?? null
      const normalized = effectiveStatus
        ? normalizeProtectionStatus(effectiveStatus)
        : activityState === 'success' ? 'protected' : activityState === 'failed' ? 'warning' : 'pending'
      const now = new Date().toISOString()

      const payload = {
        organization_id: organizationId,
        name: candidate.name,
        asset_type: workloadType(candidate.workload, os, effectiveStatus),
        owner_area: 'Acronis Cyber Protect Cloud',
        operating_system: os,
        policy_name: protectionPlanName(effectiveStatus),
        status: normalized,
        provider: 'acronis',
        provider_ref: candidate.providerRef,
        cyberfit_score: cyberfit,
        last_backup_at: lastBackupAt,
        next_backup_at: nextBackupAt,
        last_sync_at: now,
        provider_metadata: {
          workload: candidate.workload ? {
            id: candidate.workload.id,
            type: candidate.workload.type,
            type_alias: candidate.workload.type_alias,
            agent_id: candidate.workload.agent_id,
            enabled: candidate.workload.enabled,
            updated_at: candidate.workload.updated_at,
            attributes: candidate.workload.attributes ?? null,
          } : null,
          resource_context: candidate.status?.context ?? null,
          protection: { aggregate: candidate.status?.aggregate ?? null, policies: candidate.status?.policies ?? [] },
          cyberfit_score: cyberfit,
          operating_system: os,
          discovered_from_activity: !candidate.workload && !candidate.status,
          policy_status: policyStatus ?? null,
          latest_activity: candidate.activity ? {
            id: activityExternalId(candidate.activity),
            title: candidate.activity.context?.title ?? null,
            state: candidate.activity.state ?? null,
            completed_at: candidate.activity.completedAt ?? candidate.activity.updatedAt ?? null,
          } : null,
        },
      }

      const { data: existing } = await admin
        .from('cloud_protected_assets')
        .select('id')
        .eq('organization_id', organizationId)
        .eq('provider', 'acronis')
        .eq('provider_ref', candidate.providerRef)
        .maybeSingle()

      let assetId = existing?.id ? String(existing.id) : undefined
      if (assetId) {
        const { error } = await admin.from('cloud_protected_assets').update(payload).eq('id', assetId)
        if (error) throw error
      } else {
        const { data: byName } = await admin
          .from('cloud_protected_assets')
          .select('id')
          .eq('organization_id', organizationId)
          .eq('name', candidate.name)
          .maybeSingle()
        if (byName?.id) {
          assetId = String(byName.id)
          const { error } = await admin.from('cloud_protected_assets').update(payload).eq('id', assetId)
          if (error) throw error
        } else {
          const { data: inserted, error } = await admin.from('cloud_protected_assets').insert(payload).select('id').single()
          if (error || !inserted) throw error ?? new Error('Asset insert failed')
          assetId = String(inserted.id)
        }
      }

      if (!assetId) throw new Error(`Asset id missing after upsert: ${candidate.name}`)
      assetIdByName.set(candidate.name.toLowerCase(), assetId)
      assetIdByProviderRef.set(candidate.providerRef, assetId)
      for (const ref of candidate.activity ? activityAssetProviderRefs(candidate.activity) : []) assetIdByProviderRef.set(ref, assetId)
      for (const name of candidate.activity ? activityAssetNames(candidate.activity) : []) assetIdByName.set(name.toLowerCase(), assetId)
      if (statusResourceRef) assetIdByProviderRef.set(statusResourceRef, assetId)
      if (candidate.workload?.external_id) assetIdByProviderRef.set(String(candidate.workload.external_id), assetId)
      if (candidate.workload?.agent_id) assetIdByProviderRef.set(String(candidate.workload.agent_id), assetId)
      if (candidate.status?.context?.external_id) assetIdByProviderRef.set(String(candidate.status.context.external_id), assetId)
      if (candidate.status?.context?.agent_id) assetIdByProviderRef.set(String(candidate.status.context.agent_id), assetId)
      syncedAssets.push({ id: assetId, providerRef: candidate.providerRef, name: candidate.name, lastBackupAt, backup })
      assetsCount++
    }

    // Reconcile historical orphan jobs created before the machine mapping was
    // available. This fixes old rows in-place instead of only fixing new syncs.
    const { data: orphanJobs } = await admin
      .from('cloud_backup_jobs')
      .select('id,details')
      .eq('organization_id', organizationId)
      .eq('provider', 'acronis')
      .is('asset_id', null)
      .limit(500)
    for (const orphan of orphanJobs ?? []) {
      const details = (orphan.details && typeof orphan.details === 'object' ? orphan.details : {}) as AcronisActivity
      const repairedAssetId = resolveActivityAssetId(details, assetIdByName, assetIdByProviderRef)
      if (repairedAssetId) await admin.from('cloud_backup_jobs').update({ asset_id: repairedAssetId }).eq('id', orphan.id)
    }

    // Synthetic status jobs are fallback records only. Remove old generated rows so
    // an activity + resource status do not appear as two backups in the portal.
    await admin.from('cloud_backup_jobs')
      .delete()
      .eq('organization_id', organizationId)
      .eq('provider', 'acronis')
      .like('external_job_id', 'resource:%')

    const linkedActivities: Array<{ assetId: string | null; status: string; completedAt: string | null }> = []
    for (const activity of activities.filter(isBackupActivity)) {
      const externalId = activityExternalId(activity)
      if (!externalId) continue
      const assetId = resolveActivityAssetId(activity, assetIdByName, assetIdByProviderRef)
      const normalized = normalizeActivityStatus(activity)
      const completedAt = activity.completedAt ?? (normalized === 'success' || normalized === 'failed' ? activity.updatedAt ?? null : null)
      linkedActivities.push({ assetId, status: normalized, completedAt })
      const { error } = await admin.from('cloud_backup_jobs').upsert({
        organization_id: organizationId,
        asset_id: assetId,
        provider: 'acronis',
        external_job_id: `activity:${externalId}`,
        status: normalized,
        started_at: activity.startedAt ?? activity.createdAt ?? null,
        finished_at: completedAt,
        retention_label: null,
        details: activity,
      }, { onConflict: 'organization_id,provider,external_job_id' })
      if (!error) jobsCount++
      if (await upsertIntegrationEvent(organizationId, `acronis.backup.${normalized}`, externalId, activity)) eventsCount++
    }

    // If Task Manager did not expose a matching activity, keep Resource Status as
    // a fallback so the latest successful backup is still visible.
    for (const asset of syncedAssets) {
      if (!asset.lastBackupAt) continue
      const hasRealActivity = linkedActivities.some((activity) =>
        activity.assetId === asset.id && activity.status === 'success' && nearSameBackup(activity.completedAt, asset.lastBackupAt),
      )
      if (hasRealActivity) continue
      const syntheticId = `resource:${asset.providerRef}:last-success:${asset.lastBackupAt}`
      const { error } = await admin.from('cloud_backup_jobs').upsert({
        organization_id: organizationId,
        asset_id: asset.id,
        provider: 'acronis',
        external_job_id: syntheticId,
        status: 'success',
        started_at: asset.backup?.last_run ?? asset.lastBackupAt,
        finished_at: asset.lastBackupAt,
        retention_label: null,
        details: { source: 'resource_statuses', resource_id: asset.providerRef, policy: asset.backup },
      }, { onConflict: 'organization_id,provider,external_job_id' })
      if (!error) jobsCount++
    }

    for (const alert of alerts) {
      const externalId = String(alert.id ?? '')
      if (!externalId) continue
      const resourceRef = alert.resourceId ? String(alert.resourceId) : null
      const resourceName = alert.resourceName ? String(alert.resourceName) : null
      const assetId = (resourceRef ? assetIdByProviderRef.get(resourceRef) : undefined)
        ?? (resourceName ? assetIdByName.get(resourceName.toLowerCase()) : undefined)
        ?? null
      if (await upsertIntegrationEvent(organizationId, 'acronis.alert', externalId, alert)) eventsCount++
      const rawSeverity = String(alert.severity ?? '').toLowerCase()
      if (!['critical', 'error', 'warning'].includes(rawSeverity)) continue
      const title = alert.details?.title || alert.details?.category || alert.category || alert.type || 'Acronis alert'
      const summary = alert.details?.description || `Alerta recebido do Acronis Cyber Protect Cloud (${alert.category ?? alert.type ?? 'security'}).`
      const openedAt = alertTimestamp(alert.created_at ?? alert.source_time_stamp)
      const { error } = await admin.from('cloud_incidents').upsert({
        organization_id: organizationId,
        asset_id: assetId,
        provider: 'acronis',
        external_alert_id: externalId,
        title,
        severity: normalizeAlertSeverity(alert.severity),
        status: 'open',
        opened_at: openedAt,
        summary,
        details: alert,
        last_seen_at: new Date().toISOString(),
      }, { onConflict: 'organization_id,provider,external_alert_id' })
      if (!error) incidentsCount++
    }

    const finishedAt = new Date().toISOString()
    const orgUpdate: Record<string, unknown> = {
      last_provider_sync_at: finishedAt,
      updated_at: finishedAt,
    }
    if (usage) {
      orgUpdate.provider_storage_bytes = storageBytes
      orgUpdate.provider_immutable_storage_bytes = immutableStorageBytes
      orgUpdate.provider_usage_synced_at = finishedAt
      orgUpdate.provider_metadata = {
        ...((org.provider_metadata && typeof org.provider_metadata === 'object') ? org.provider_metadata : {}),
        usage: usage.raw,
        usage_note: 'Acronis tenant storage usage; refreshed by Acronis on average every 5-6 hours.',
      }
    }
    const { error: updateOrgError } = await admin.from('cloud_organizations').update(orgUpdate).eq('id', organizationId)
    if (updateOrgError && usage) {
      warnings.push(`usage persistence: ${updateOrgError.message} — execute supabase/006_acronis_usage_assets.sql`)
      await admin.from('cloud_organizations').update({ last_provider_sync_at: finishedAt, updated_at: finishedAt }).eq('id', organizationId)
    }

    const result = {
      organizationId,
      organizationName: org.name,
      tenantId,
      assets: assetsCount,
      backupJobs: jobsCount,
      incidents: incidentsCount,
      events: eventsCount,
      storageBytes,
      immutableStorageBytes,
      warnings,
      trigger,
    }
    await logSyncRun({ organizationId, tenantId, status: warnings.length ? 'warning' : 'success', summary: result })
    return result
  } catch (error) {
    await logSyncRun({ organizationId, tenantId, status: 'failed', summary: { trigger }, error: error instanceof Error ? error.message : String(error) })
    throw error
  }
}

export async function syncAllMappedAcronisOrganizations(trigger: 'manual' | 'cron' | 'api' = 'manual') {
  const admin = createAdminClient()
  if (!admin) throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for Acronis sync.')
  const { data: organizations, error } = await admin
    .from('cloud_organizations')
    .select('id')
    .eq('provider', 'acronis')
    .not('provider_tenant_id', 'is', null)
  if (error) throw error

  const results: AcronisSyncResult[] = []
  const errors: Array<{ organizationId: string; error: string }> = []
  for (const org of organizations ?? []) {
    try { results.push(await syncAcronisOrganization(String(org.id), trigger)) }
    catch (error) { errors.push({ organizationId: String(org.id), error: error instanceof Error ? error.message : String(error) }) }
  }
  return { ok: errors.length === 0, synced: results.length, trigger, results, errors }
}
