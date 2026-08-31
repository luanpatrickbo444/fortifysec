import { acronisFetch } from './client'

export type AcronisWorkload = {
  id: string
  name: string
  type?: string
  type_alias?: string
  tenant_id?: string
  external_id?: string
  agent_id?: string
  enabled?: boolean
  attributes?: Record<string, unknown>
  [key: string]: unknown
}

type WorkloadList = { items?: AcronisWorkload[] }

export async function getAcronisWorkloads(tenantId: string) {
  const response = await acronisFetch<WorkloadList>('/api/workload_management/v5/workloads', {
    tenantId,
    query: {
      tenant_id: tenantId,
      include_all_attributes: true,
      limit: 500,
    },
  })
  return (response.items ?? []).filter((item) => !item.tenant_id || item.tenant_id === tenantId)
}
