import { NextResponse } from 'next/server'
import { isFortifyAdminRequest } from '@/lib/acronis/api-auth'
import { hasAcronisConfig } from '@/lib/acronis/config'
import { getAcronisCustomerTenants, getAcronisPartnerTenant } from '@/lib/acronis/tenants'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  if (!(await isFortifyAdminRequest(request))) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  if (!hasAcronisConfig()) return NextResponse.json({ error: 'acronis_not_configured' }, { status: 503 })

  try {
    const [partner, customers] = await Promise.all([
      getAcronisPartnerTenant(),
      getAcronisCustomerTenants(),
    ])
    return NextResponse.json({
      ok: true,
      provider: 'acronis',
      partner: { id: partner.id, name: partner.name, kind: partner.kind },
      customer_count: customers.length,
      customers: customers.map((tenant) => ({ id: tenant.id, name: tenant.name, kind: tenant.kind, enabled: tenant.enabled })),
    })
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    }, { status: 502 })
  }
}
