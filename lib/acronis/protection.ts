import { acronisFetch } from './client'

export type AcronisPolicyStatus = {
  type?: string
  status?: string
  last_run?: string
  last_success_run?: string
  next_run_time?: string
  names?: string[] | string
  running?: { state?: string }
  [key: string]: unknown
}

export type AcronisResourceStatus = {
  aggregate?: { status?: string; names?: string[] | string }
  context?: {
    id?: string
    name?: string
    user_defined_name?: string
    tenant_id?: string
    type?: string
    external_id?: string
    agent_id?: string
    [key: string]: unknown
  }
  policies?: AcronisPolicyStatus[]
  attributes?: unknown
  [key: string]: unknown
}

type StatusList = { items?: AcronisResourceStatus[] }
type AttributeItem = { name?: string; kvs?: Array<{ key?: string; value?: unknown }>; details?: Array<{ key?: string; value?: unknown }> }
type AttributesResponse = { items?: AttributeItem[] }

export type AcronisPolicyResourceStatus = {
  context?: {
    id?: string
    external_id?: string
    name?: string
    user_defined_name?: string
    tenant_id?: string
    type?: string
    [key: string]: unknown
  }
  policies?: AcronisPolicyStatus[]
  [key: string]: unknown
}

type PolicyStatusList = { items?: AcronisPolicyResourceStatus[] }

export async function getAcronisPolicyStatuses(tenantId: string) {
  const response = await acronisFetch<PolicyStatusList>('/api/policy_management/v4/policy_statuses', {
    tenantId,
    query: { limit: 500 },
  })
  // O token já é escopado para o tenant. `context.tenant_id` pode ser o ID legado
  // numérico da API e não o UUID usado no Account Management, então não filtre
  // novamente por igualdade de string aqui.
  return response.items ?? []
}

export function mergeResourceAndPolicyStatus(
  resource: AcronisResourceStatus | null | undefined,
  policy: AcronisPolicyResourceStatus | null | undefined,
): AcronisResourceStatus | null {
  if (!resource && !policy) return null
  const resourcePolicies = resource?.policies ?? []
  const policyPolicies = policy?.policies ?? []
  const merged = new Map<string, AcronisPolicyStatus>()
  for (const item of resourcePolicies) merged.set(String(item.type ?? `resource-${merged.size}`), item)
  for (const item of policyPolicies) {
    const key = String(item.type ?? `policy-${merged.size}`)
    merged.set(key, { ...(merged.get(key) ?? {}), ...item })
  }
  return {
    ...(resource ?? {}),
    context: { ...(policy?.context ?? {}), ...(resource?.context ?? {}) },
    policies: [...merged.values()],
  }
}

export async function getAcronisResourceStatuses(tenantId: string) {
  const response = await acronisFetch<StatusList>('/api/resource_management/v4/resource_statuses', {
    tenantId,
    query: { type: 'resource.machine', include_attributes: true, limit: 500 },
  })
  const machineItems = response.items ?? []
  if (machineItems.length) return machineItems

  // Alguns tenants/agents não retornam itens quando o filtro `resource.machine`
  // é aplicado, embora a API retorne o mesmo recurso sem o filtro. Fazemos o
  // fallback somente quando a primeira consulta vier vazia para não duplicar
  // chamadas em ambientes normais.
  const fallback = await acronisFetch<StatusList>('/api/resource_management/v4/resource_statuses', {
    tenantId,
    query: { include_attributes: true, limit: 500 },
  })
  return (fallback.items ?? []).filter((item) => {
    const type = String(item.context?.type ?? '').toLowerCase()
    return !type || type.includes('machine') || type.includes('workload') || type.includes('server') || type.includes('workstation')
  })
}

export async function getAcronisResourceAttributes(tenantId: string, resourceId: string) {
  return acronisFetch<AttributesResponse>(`/api/resource_management/v4/resources/${encodeURIComponent(resourceId)}/attributes`, { tenantId })
}

export function backupPolicy(status?: AcronisResourceStatus | null) {
  return status?.policies?.find((policy) => String(policy.type ?? '').startsWith('policy.backup')) ?? null
}

export function protectionPlanName(status?: AcronisResourceStatus | null) {
  const aggregateNames = status?.aggregate?.names
  if (Array.isArray(aggregateNames) && aggregateNames.length) return aggregateNames.join(', ')
  if (typeof aggregateNames === 'string' && aggregateNames) return aggregateNames
  for (const policy of status?.policies ?? []) {
    if (Array.isArray(policy.names) && policy.names.length) return policy.names.join(', ')
    if (typeof policy.names === 'string' && policy.names) return policy.names
  }
  return null
}

export function normalizeProtectionStatus(status?: AcronisResourceStatus | null) {
  const aggregate = String(status?.aggregate?.status ?? '').toLowerCase()
  const backup = backupPolicy(status)
  const backupStatus = String(backup?.status ?? backup?.running?.state ?? '').toLowerCase()
  if (['error', 'failed', 'failure', 'critical'].some((value) => aggregate.includes(value) || backupStatus.includes(value))) return 'warning'
  if (aggregate === 'not_protected' || aggregate.includes('not_protected')) return 'warning'
  if (status) return 'protected'
  return 'pending'
}

export function extractCyberfitScore(attributes: AttributesResponse | null | undefined) {
  for (const item of attributes?.items ?? []) {
    for (const pair of [...(item.kvs ?? []), ...(item.details ?? [])]) {
      if (pair.key === 'cyberfit_score_value') {
        const parsed = Number(pair.value)
        if (Number.isFinite(parsed)) return parsed
      }
    }
  }
  return null
}

export function extractOperatingSystem(attributes: AttributesResponse | null | undefined) {
  const candidates = new Set(['os_name', 'operating_system', 'os'])
  for (const item of attributes?.items ?? []) {
    for (const pair of [...(item.kvs ?? []), ...(item.details ?? [])]) {
      if (pair.key && candidates.has(pair.key) && typeof pair.value === 'string' && pair.value) return pair.value
    }
  }
  return null
}
