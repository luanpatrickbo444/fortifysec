import { acronisFetch } from './client'

export type AcronisActivity = {
  id?: string | number
  idString?: string
  uuid?: string
  state?: string
  createdAt?: string
  startedAt?: string
  completedAt?: string
  updatedAt?: string
  result?: { code?: string; payload?: unknown }
  context?: {
    title?: string
    name?: string
    resource_name?: string
    Persistent?: { ID?: string; Name?: string; OwnerID?: string; [key: string]: unknown }
    target?: { id?: string; name?: string; [key: string]: unknown }
    workload?: { id?: string; name?: string; [key: string]: unknown }
    machine?: { id?: string; name?: string; [key: string]: unknown }
    [key: string]: unknown
  }
  tenant?: { id?: string; name?: string }
  type?: string
  resourceId?: string
  resource_id?: string
  resourceName?: string
  resource_name?: string
  workload_id?: string
  machine_id?: string
  [key: string]: unknown
}

type ActivityList = { items?: AcronisActivity[] }

export async function getAcronisActivities(tenantId: string) {
  const response = await acronisFetch<ActivityList>('/api/task_manager/v2/activities', {
    tenantId,
    query: { limit: 200 },
  })
  return response.items ?? []
}

export function isBackupActivity(activity: AcronisActivity) {
  const title = String(activity.context?.title ?? activity.type ?? '')
  return /backup|backing up|recovery point|archive/i.test(title)
}

export function activityExternalId(activity: AcronisActivity) {
  return String(activity.idString ?? activity.uuid ?? activity.id ?? '')
}

export function activityAssetNames(activity: AcronisActivity) {
  const values = [
    activity.context?.Persistent?.Name,
    activity.context?.name,
    activity.context?.resource_name,
    activity.context?.target?.name,
    activity.context?.workload?.name,
    activity.context?.machine?.name,
    activity.resourceName,
    activity.resource_name,
  ]
  return [...new Set(values.filter(Boolean).map((value) => String(value).trim()).filter(Boolean))]
}

export function activityAssetName(activity: AcronisActivity) {
  return activityAssetNames(activity)[0] ?? null
}

export function activityAssetProviderRefs(activity: AcronisActivity) {
  const values = [
    activity.context?.Persistent?.ID,
    activity.context?.Persistent?.OwnerID,
    activity.context?.target?.id,
    activity.context?.workload?.id,
    activity.context?.machine?.id,
    activity.resourceId,
    activity.resource_id,
    activity.workload_id,
    activity.machine_id,
  ]
  return [...new Set(values.filter(Boolean).map((value) => String(value).trim()).filter(Boolean))]
}

export function normalizeActivityStatus(activity: AcronisActivity) {
  const state = String(activity.state ?? '').toLowerCase()
  const result = String(activity.result?.code ?? '').toLowerCase()
  if (['failed', 'error', 'canceled', 'cancelled'].some((v) => state.includes(v) || result.includes(v))) return 'failed'
  if (state === 'completed' && (!result || result === 'ok' || result === 'success')) return 'success'
  if (['started', 'running', 'queued', 'enqueued'].some((v) => state.includes(v))) return 'running'
  return state || result || 'unknown'
}
