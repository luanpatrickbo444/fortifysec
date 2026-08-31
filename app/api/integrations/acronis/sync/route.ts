import { NextResponse } from 'next/server'
import { isFortifyAdminRequest } from '@/lib/acronis/api-auth'
import { hasAcronisConfig } from '@/lib/acronis/config'
import { syncAcronisOrganization, syncAllMappedAcronisOrganizations } from '@/lib/acronis/sync'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300

export async function POST(request: Request) {
  if (!(await isFortifyAdminRequest(request))) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  if (!hasAcronisConfig()) return NextResponse.json({ error: 'acronis_not_configured' }, { status: 503 })

  const body = await request.json().catch(() => ({})) as { organization_id?: string }
  try {
    if (body.organization_id) {
      const result = await syncAcronisOrganization(body.organization_id, 'api')
      return NextResponse.json({ ok: true, synced: 1, results: [result], errors: [] })
    }
    return NextResponse.json(await syncAllMappedAcronisOrganizations('api'))
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    }, { status: 502 })
  }
}
