import { acronisFetch } from './client'

export type AcronisAlert = {
  id?: string
  type?: string
  category?: string
  severity?: string
  tenantID?: string
  resourceId?: string
  resourceName?: string
  created_at?: string | number
  updated_at?: string | number
  source_time_stamp?: string | number
  details?: {
    title?: string
    category?: string
    description?: string
    fields?: Record<string, unknown>
  }
  [key: string]: unknown
}

type AlertList = { items?: AcronisAlert[]; alerts?: AcronisAlert[] }

export async function getAcronisAlerts(tenantId: string) {
  const response = await acronisFetch<AlertList>('/api/alert_manager/v1/alerts', {
    tenantId,
    query: { tenant: tenantId, limit: 200, order: 'desc(created_at)' },
  })
  const raw = response as unknown
  if (Array.isArray(raw)) return raw as AcronisAlert[]
  return response.items ?? response.alerts ?? []
}

export function normalizeAlertSeverity(severity: string | undefined) {
  switch (String(severity ?? '').toLowerCase()) {
    case 'critical': return 'critical'
    case 'error': return 'high'
    case 'warning': return 'medium'
    default: return 'low'
  }
}

export function alertTimestamp(value: string | number | undefined) {
  if (typeof value === 'number') {
    const ms = value > 10_000_000_000 ? Math.floor(value / 1_000_000) : value * 1000
    return new Date(ms).toISOString()
  }
  if (typeof value === 'string' && value) {
    const numeric = Number(value)
    if (Number.isFinite(numeric) && /^\d+$/.test(value)) return alertTimestamp(numeric)
    const date = new Date(value)
    if (!Number.isNaN(date.getTime())) return date.toISOString()
  }
  return new Date().toISOString()
}
