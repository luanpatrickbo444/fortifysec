import { getAcronisConfig } from './config'

type TokenInfo = {
  access_token: string
  token_type?: string
  expires_on?: number
}

type CachedToken = { token: string; expiresAt: number }

let partnerTokenCache: CachedToken | null = null
const scopedTokenCache = new Map<string, CachedToken>()

function usable(cached: CachedToken | null | undefined) {
  return Boolean(cached && cached.expiresAt > Date.now() + 60_000)
}

async function parseTokenResponse(response: Response, label: string): Promise<TokenInfo> {
  const text = await response.text()
  let payload: unknown = null
  try { payload = text ? JSON.parse(text) : null } catch {}
  if (!response.ok) {
    const safe = typeof payload === 'object' && payload ? JSON.stringify(payload).slice(0, 800) : text.slice(0, 800)
    throw new Error(`${label} failed (${response.status}): ${safe || response.statusText}`)
  }
  const token = payload as TokenInfo
  if (!token?.access_token) throw new Error(`${label} did not return an access_token.`)
  return token
}

function tokenExpiry(token: TokenInfo) {
  if (token.expires_on) return token.expires_on * 1000
  return Date.now() + 110 * 60 * 1000
}

export async function getAcronisAccessToken(force = false) {
  if (!force && usable(partnerTokenCache)) return partnerTokenCache!.token

  const { clientId, clientSecret, datacenterUrl } = getAcronisConfig()
  const basic = Buffer.from(`${clientId}:${clientSecret}`, 'utf8').toString('base64')
  const body = new URLSearchParams({ grant_type: 'client_credentials' })

  const response = await fetch(`${datacenterUrl}/api/2/idp/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body,
    cache: 'no-store',
  })

  const token = await parseTokenResponse(response, 'Acronis authentication')
  partnerTokenCache = { token: token.access_token, expiresAt: tokenExpiry(token) }
  return token.access_token
}

export async function getAcronisScopedAccessToken(tenantId: string, force = false) {
  const cached = scopedTokenCache.get(tenantId)
  if (!force && usable(cached)) return cached!.token

  const { datacenterUrl } = getAcronisConfig()
  const partnerToken = await getAcronisAccessToken(force)
  const body = new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion: partnerToken,
    scope: `urn:acronis.com:tenant-id:${tenantId}`,
  })

  const response = await fetch(`${datacenterUrl}/api/2/idp/token`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${partnerToken}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body,
    cache: 'no-store',
  })

  const token = await parseTokenResponse(response, 'Acronis scoped authentication')
  scopedTokenCache.set(tenantId, { token: token.access_token, expiresAt: tokenExpiry(token) })
  return token.access_token
}

export function clearAcronisTokenCache() {
  partnerTokenCache = null
  scopedTokenCache.clear()
}
