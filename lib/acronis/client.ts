import { getAcronisConfig } from './config'
import { clearAcronisTokenCache, getAcronisAccessToken, getAcronisScopedAccessToken } from './auth'

export class AcronisApiError extends Error {
  status: number
  endpoint: string
  responseBody: string
  constructor(status: number, endpoint: string, responseBody: string) {
    super(`Acronis API request failed (${status}) at ${endpoint}`)
    this.name = 'AcronisApiError'
    this.status = status
    this.endpoint = endpoint
    this.responseBody = responseBody
  }
}

type Options = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  query?: Record<string, string | number | boolean | undefined | null>
  body?: unknown
  tenantId?: string
  token?: string
}

function buildUrl(path: string, query?: Options['query']) {
  const { datacenterUrl } = getAcronisConfig()
  const url = new URL(path.startsWith('http') ? path : `${datacenterUrl}${path.startsWith('/') ? path : `/${path}`}`)
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value))
  }
  return url
}

export async function acronisFetch<T>(path: string, options: Options = {}, retry = true): Promise<T> {
  const token = options.token ?? (options.tenantId
    ? await getAcronisScopedAccessToken(options.tenantId)
    : await getAcronisAccessToken())
  const url = buildUrl(path, options.query)
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
  }
  let body: string | undefined
  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json'
    body = JSON.stringify(options.body)
  }

  const response = await fetch(url, {
    method: options.method ?? 'GET',
    headers,
    body,
    cache: 'no-store',
  })

  if (response.status === 401 && retry && !options.token) {
    clearAcronisTokenCache()
    return acronisFetch<T>(path, options, false)
  }

  const text = await response.text()
  if (!response.ok) throw new AcronisApiError(response.status, url.pathname, text.slice(0, 1200))
  if (!text) return {} as T
  return JSON.parse(text) as T
}
