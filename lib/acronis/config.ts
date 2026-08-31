export type AcronisConfig = {
  clientId: string
  clientSecret: string
  datacenterUrl: string
}

export function hasAcronisConfig() {
  return Boolean(
    process.env.ACRONIS_CLIENT_ID &&
    process.env.ACRONIS_CLIENT_SECRET &&
    process.env.ACRONIS_DATACENTER_URL,
  )
}

export function getAcronisConfig(): AcronisConfig {
  const clientId = process.env.ACRONIS_CLIENT_ID?.trim()
  const clientSecret = process.env.ACRONIS_CLIENT_SECRET?.trim()
  const rawUrl = process.env.ACRONIS_DATACENTER_URL?.trim()

  if (!clientId || !clientSecret || !rawUrl) {
    throw new Error('Acronis integration is not configured. Set ACRONIS_CLIENT_ID, ACRONIS_CLIENT_SECRET and ACRONIS_DATACENTER_URL.')
  }

  let parsed: URL
  try {
    parsed = new URL(rawUrl)
  } catch {
    throw new Error('ACRONIS_DATACENTER_URL is invalid.')
  }

  if (parsed.protocol !== 'https:') throw new Error('ACRONIS_DATACENTER_URL must use HTTPS.')

  return {
    clientId,
    clientSecret,
    datacenterUrl: parsed.origin,
  }
}
