import { NextResponse } from 'next/server'
import { hasAcronisConfig } from '@/lib/acronis/config'
import { syncAllMappedAcronisOrganizations } from '@/lib/acronis/sync'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300

function authorizationState(request: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret) return { ok: false, error: 'cron_secret_not_configured' }
  if (request.headers.get('authorization') !== `Bearer ${secret}`) return { ok: false, error: 'unauthorized' }
  return { ok: true, error: null }
}

export async function GET(request: Request) {
  const auth = authorizationState(request)
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.error === 'cron_secret_not_configured' ? 503 : 401 })
  if (!hasAcronisConfig()) return NextResponse.json({ ok: false, error: 'acronis_not_configured' }, { status: 503 })

  try {
    const result = await syncAllMappedAcronisOrganizations('cron')
    return NextResponse.json({ ...result, executedAt: new Date().toISOString() })
  } catch (error) {
    return NextResponse.json({
      ok: false,
      trigger: 'cron',
      error: error instanceof Error ? error.message : String(error),
    }, { status: 502 })
  }
}
