import { acronisFetch } from './client'

type UsageItem = {
  usage_name?: string
  name?: string
  measurement_unit?: string
  value?: number
  absolute_value?: number
  tenant_uuid?: string
  [key: string]: unknown
}

type TenantUsage = {
  tenant?: string
  usages?: UsageItem[]
}

type UsageResponse = { items?: TenantUsage[] }

export type AcronisStorageUsage = {
  storageBytes: number | null
  immutableStorageBytes: number | null
  raw: TenantUsage | null
}

function sumUsage(usages: UsageItem[], usageName: string) {
  const rows = usages.filter((item) =>
    item.usage_name === usageName && String(item.measurement_unit ?? '').toLowerCase() === 'bytes',
  )
  if (!rows.length) return null
  return rows.reduce((sum, item) => {
    const current = Number(item.value ?? 0)
    const absolute = Number(item.absolute_value ?? 0)
    const value = Math.max(Number.isFinite(current) ? current : 0, Number.isFinite(absolute) ? absolute : 0)
    return sum + (value > 0 ? value : 0)
  }, 0)
}

/**
 * Account Management API usage is tenant-level telemetry. It is NOT the
 * logical size of source disks; it is the storage consumed in Acronis.
 */
export async function getAcronisStorageUsage(tenantId: string): Promise<AcronisStorageUsage> {
  const response = await acronisFetch<UsageResponse>('/api/2/tenants/usages', {
    query: {
      tenants: tenantId,
      usage_names: 'storage,immutable_storage',
    },
  })
  const row = (response.items ?? []).find((item) => item.tenant === tenantId) ?? response.items?.[0] ?? null
  const usages = row?.usages ?? []
  return {
    storageBytes: sumUsage(usages, 'storage'),
    immutableStorageBytes: sumUsage(usages, 'immutable_storage'),
    raw: row,
  }
}
