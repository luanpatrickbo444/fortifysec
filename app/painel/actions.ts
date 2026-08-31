'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { resolvePortalOrganization } from '@/lib/portal-org'

export async function setPortalOrganizationAction(formData: FormData) {
  const user = await requireUser()
  const organizationId = String(formData.get('organization_id') ?? '')
  if (!organizationId || user.demo) redirect('/painel')

  const supabase = await createClient()
  const { data: membership } = await supabase!
    .from('cloud_organization_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .eq('organization_id', organizationId)
    .maybeSingle()

  if (!membership?.organization_id) redirect('/painel')

  const cookieStore = await cookies()
  cookieStore.set('fortify_portal_org', organizationId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  })
  redirect('/painel')
}

async function customerContext() {
  const user = await requireUser()
  if (user.demo) return { user, supabase: null, org: null }
  const supabase = await createClient()
  const portal = await resolvePortalOrganization(supabase!, user.id)
  if (!portal.org) redirect('/painel/onboarding')
  return { user, supabase: supabase!, org: portal.org }
}

export async function replySupportTicketAction(formData: FormData) {
  const { user, supabase, org } = await customerContext()
  if (!supabase || !org) redirect('/painel/suporte')
  const ticketId = String(formData.get('ticket_id') ?? '')
  const body = String(formData.get('body') ?? '').trim()
  if (!ticketId || !body) redirect(`/painel/suporte/${ticketId}?error=mensagem`)

  const { data: ticket } = await supabase
    .from('cloud_support_tickets')
    .select('id,status')
    .eq('id', ticketId)
    .eq('organization_id', org.id)
    .maybeSingle()
  if (!ticket) redirect('/painel/suporte?error=chamado')
  if (ticket.status === 'closed') redirect(`/painel/suporte/${ticketId}?error=fechado`)

  const now = new Date().toISOString()
  const { error } = await supabase.from('cloud_support_ticket_messages').insert({
    ticket_id: ticketId,
    organization_id: org.id,
    author_id: user.id,
    author_role: 'customer',
    body,
    is_internal: false,
  })
  if (error) redirect(`/painel/suporte/${ticketId}?error=envio`)

  // A mensagem foi autorizada pela sessão do cliente. A atualização operacional do ticket
  // é feita no backend porque clientes não possuem UPDATE direto nessa tabela.
  const admin = createAdminClient()
  if (!admin) redirect(`/painel/suporte/${ticketId}?error=backend`)
  const ticketUpdate: Record<string, unknown> = { last_reply_at: now, updated_at: now }
  if (ticket.status === 'resolved') {
    ticketUpdate.status = 'open'
    ticketUpdate.resolved_at = null
    ticketUpdate.resolution_note = null
  }
  await admin.from('cloud_support_tickets').update(ticketUpdate).eq('id', ticketId).eq('organization_id', org.id)

  revalidatePath('/painel/suporte')
  revalidatePath(`/painel/suporte/${ticketId}`)
  redirect(`/painel/suporte/${ticketId}?sent=1`)
}

export async function confirmSupportTicketResolutionAction(formData: FormData) {
  const { supabase, org } = await customerContext()
  if (!supabase || !org) redirect('/painel/suporte')
  const ticketId = String(formData.get('ticket_id') ?? '')
  const now = new Date().toISOString()
  if (!ticketId) redirect('/painel/suporte')

  const { data: ticket } = await supabase.from('cloud_support_tickets')
    .select('id,status')
    .eq('id', ticketId)
    .eq('organization_id', org.id)
    .maybeSingle()
  if (!ticket || ticket.status !== 'resolved') redirect(`/painel/suporte/${ticketId}?error=status`)

  // A policy de cliente não permite UPDATE na tabela; a operação é validada acima e
  // finalizada pelo backend com service role.
  const admin = createAdminClient()
  if (!admin) redirect(`/painel/suporte/${ticketId}?error=backend`)
  await admin.from('cloud_support_tickets').update({ status: 'closed', closed_at: now, updated_at: now }).eq('id', ticketId).eq('organization_id', org.id)

  revalidatePath('/painel/suporte')
  revalidatePath(`/painel/suporte/${ticketId}`)
  redirect(`/painel/suporte/${ticketId}?closed=1`)
}

export async function generateMonthlyReportAction(formData: FormData) {
  const { user, supabase, org } = await customerContext()
  if (!supabase || !org || user.demo) redirect('/painel/relatorios')
  const admin = createAdminClient()
  if (!admin) redirect('/painel/relatorios?error=backend')

  const now = new Date()
  const requested = String(formData.get('reference_month') ?? '').trim()
  const fallback = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const monthValue = /^\d{4}-\d{2}$/.test(requested) ? requested : fallback
  const [year, month] = monthValue.split('-').map(Number)
  const monthStartDate = new Date(year, month - 1, 1)
  const nextMonthDate = new Date(year, month, 1)
  if (monthStartDate.getTime() > new Date(now.getFullYear(), now.getMonth(), 1).getTime()) redirect('/painel/relatorios?error=mes-futuro')

  const referenceMonth = `${monthValue}-01`
  const monthStart = monthStartDate.toISOString()
  const nextMonth = nextMonthDate.toISOString()

  const [{ data: assets }, { data: jobs }, { data: tests }, { data: incidents }] = await Promise.all([
    admin.from('cloud_protected_assets').select('id,status').eq('organization_id', org.id),
    admin.from('cloud_backup_jobs').select('id,asset_id,status,finished_at').eq('organization_id', org.id).gte('finished_at', monthStart).lt('finished_at', nextMonth),
    admin.from('cloud_recovery_tests').select('id,status,completed_at').eq('organization_id', org.id).gte('completed_at', monthStart).lt('completed_at', nextMonth),
    admin.from('cloud_incidents').select('id,status,severity,opened_at').eq('organization_id', org.id).gte('opened_at', monthStart).lt('opened_at', nextMonth),
  ])

  const assetRows = assets ?? []
  const jobRows = jobs ?? []
  const testRows = tests ?? []
  const incidentRows = incidents ?? []
  if (!assetRows.length && !jobRows.length) redirect('/painel/relatorios?error=sem-dados')

  const currentProtectedAssets = assetRows.filter((row: any) => row.status === 'protected').length
  const monthlyAssetIds = [...new Set(jobRows.map((row: any) => row.asset_id).filter(Boolean))]
  const monthlyProtectedIds = [...new Set(jobRows.filter((row: any) => row.status === 'success').map((row: any) => row.asset_id).filter(Boolean))]
  const protectedAssets = monthlyAssetIds.length ? monthlyProtectedIds.length : currentProtectedAssets
  const assetTotal = monthlyAssetIds.length ? monthlyAssetIds.length : assetRows.length
  const assetHealth = assetTotal ? (protectedAssets / assetTotal) * 100 : 0
  const successfulJobs = jobRows.filter((row: any) => row.status === 'success').length
  const backupSuccess = jobRows.length ? (successfulJobs / jobRows.length) * 100 : 0
  const openIncidents = incidentRows.filter((row: any) => !['resolved', 'closed'].includes(String(row.status))).length
  const incidentScore = Math.max(0, 100 - openIncidents * 20)
  const healthScore = Math.max(0, Math.min(100, assetHealth * 0.5 + backupSuccess * 0.4 + incidentScore * 0.1))
  const recoveryPassed = testRows.filter((row: any) => row.status === 'passed').length

  const { data: existingReport } = await admin.from('cloud_monthly_reports')
    .select('id,report_url,source,generated_by')
    .eq('organization_id', org.id)
    .eq('reference_month', referenceMonth)
    .maybeSingle()

  const summary = {
    formula: 'health = ativos protegidos 50% + sucesso de backup 40% + higiene de incidentes 10%',
    assets_total: assetTotal,
    assets_protected: protectedAssets,
    backup_jobs_total: jobRows.length,
    backup_jobs_success: successfulJobs,
    recovery_tests_total: testRows.length,
    recovery_tests_passed: recoveryPassed,
    incidents_total: incidentRows.length,
    incidents_open: openIncidents,
    generated_from: monthlyAssetIds.length ? 'monthly_backup_activity' : 'fortify_operational_data',
    period_start: monthStart,
    period_end: nextMonth,
  }

  const { data: report, error } = await admin.from('cloud_monthly_reports').upsert({
    organization_id: org.id,
    reference_month: referenceMonth,
    health_score: Number(healthScore.toFixed(2)),
    backup_success_rate: Number(backupSuccess.toFixed(2)),
    recovery_tests_passed: recoveryPassed,
    incidents_count: incidentRows.length,
    generation_status: 'ready',
    report_url: existingReport?.report_url ?? null,
    source: existingReport?.report_url ? (existingReport.source ?? 'admin') : 'client',
    generated_by: existingReport?.report_url ? (existingReport.generated_by ?? null) : user.id,
    generated_at: now.toISOString(),
    summary,
  }, { onConflict: 'organization_id,reference_month' }).select('id').single()

  if (error || !report) redirect('/painel/relatorios?error=geracao')
  revalidatePath('/painel/relatorios')
  revalidatePath('/admin/relatorios')
  redirect(`/painel/relatorios/${report.id}?generated=1`)
}
