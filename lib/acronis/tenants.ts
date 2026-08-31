import { getAcronisConfig } from './config'
import { acronisFetch } from './client'

export type AcronisTenant = {
  id: string
  name: string
  kind?: string
  parent_id?: string | null
  enabled?: boolean
  ancestral_access?: boolean
  customer_id?: string | null
  [key: string]: unknown
}

type ApiClientInfo = { tenant_id: string; data?: { client_name?: string }; type?: string }
type TenantList = { items?: AcronisTenant[] }

export async function getAcronisPartnerTenantId() {
  const { clientId } = getAcronisConfig()
  const client = await acronisFetch<ApiClientInfo>(`/api/2/clients/${encodeURIComponent(clientId)}`)
  if (!client.tenant_id) throw new Error('Acronis API client response did not include tenant_id.')
  return client.tenant_id
}

export async function getAcronisTenant(tenantId: string) {
  return acronisFetch<AcronisTenant>(`/api/2/tenants/${encodeURIComponent(tenantId)}`)
}

export async function getAcronisPartnerTenant() {
  return getAcronisTenant(await getAcronisPartnerTenantId())
}

export async function getAcronisCustomerTenants() {
  const rootId = await getAcronisPartnerTenantId()
  const response = await acronisFetch<TenantList>('/api/2/tenants', {
    query: { subtree_root_id: rootId },
  })
  return (response.items ?? [])
    .filter((tenant) => tenant.id !== rootId && (tenant.kind === 'customer' || !tenant.kind))
    .sort((a, b) => a.name.localeCompare(b.name))
}
