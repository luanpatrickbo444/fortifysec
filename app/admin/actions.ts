'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'

async function adminClient() {
  await requireAdmin()
  const client = createAdminClient()
  if (!client) redirect('/admin?error=service-role')
  return client
}

export async function updateOnboardingStatusAction(formData: FormData) {
  const client = await adminClient()
  const id = String(formData.get('id') ?? '')
  const status = String(formData.get('status') ?? '')
  const adminNotes = String(formData.get('admin_notes') ?? '').trim() || null
  if (!id || !['reviewing', 'needs_info', 'rejected'].includes(status)) redirect('/admin/onboarding?error=status')
  await client!.from('cloud_onboarding_requests').update({ status, admin_notes: adminNotes, updated_at: new Date().toISOString() }).eq('id', id)
  revalidatePath('/admin/onboarding')
  redirect(`/admin/onboarding?updated=1`)
}

export async function provisionOnboardingAction(formData: FormData) {
  const client = await adminClient()
  const requestId = String(formData.get('id') ?? '')
  if (!requestId) redirect('/admin/onboarding?error=request')

  const { data: request, error } = await client!.from('cloud_onboarding_requests').select('*').eq('id', requestId).single()
  if (error || !request) redirect('/admin/onboarding?error=request')

  if (request.provisioned_organization_id) {
    await client!.from('cloud_organization_members').upsert({
      organization_id: request.provisioned_organization_id,
      user_id: request.user_id,
      member_role: 'admin',
    }, { onConflict: 'organization_id,user_id' })
    redirect(`/admin/clientes/${request.provisioned_organization_id}`)
  }

  const { data: authUser } = await client!.auth.admin.getUserById(request.user_id)
  const { data: org, error: orgError } = await client!.from('cloud_organizations').insert({
    name: request.organization_name,
    legal_name: request.legal_name,
    cnpj: request.cnpj,
    contact_email: authUser.user?.email ?? null,
    contact_phone: request.contact_phone,
    plan: request.plan,
    status: 'onboarding',
    employees: request.employees,
    data_volume: request.data_volume,
    rpo_target: request.rpo_target,
    rto_target: request.rto_target,
    admin_notes: request.admin_notes,
    updated_at: new Date().toISOString(),
  }).select('id').single()
  if (orgError || !org) redirect('/admin/onboarding?error=org')

  const { error: memberError } = await client!.from('cloud_organization_members').insert({
    organization_id: org.id,
    user_id: request.user_id,
    member_role: 'admin',
  })
  if (memberError) {
    await client!.from('cloud_organizations').delete().eq('id', org.id)
    redirect('/admin/onboarding?error=member')
  }

  await client!.from('cloud_onboarding_requests').update({
    status: 'provisioned',
    provisioned_organization_id: org.id,
    updated_at: new Date().toISOString(),
  }).eq('id', requestId)

  revalidatePath('/admin')
  revalidatePath('/admin/onboarding')
  redirect(`/admin/clientes/${org.id}?provisioned=1`)
}

export async function setOrganizationStatusAction(formData: FormData) {
  const client = await adminClient()
  const id = String(formData.get('organization_id') ?? '')
  const status = String(formData.get('status') ?? '')
  if (!id || !['onboarding', 'active', 'suspended'].includes(status)) redirect('/admin/clientes?error=status')
  await client!.from('cloud_organizations').update({ status, updated_at: new Date().toISOString() }).eq('id', id)
  revalidatePath('/admin/clientes')
  revalidatePath(`/admin/clientes/${id}`)
  revalidatePath('/painel')
  redirect(`/admin/clientes/${id}?status=1`)
}

export async function addAssetAction(formData: FormData) {
  const client = await adminClient()
  const organizationId = String(formData.get('organization_id') ?? '')
  const name = String(formData.get('name') ?? '').trim()
  const assetType = String(formData.get('asset_type') ?? 'workload').trim()
  if (!organizationId || !name) redirect(`/admin/clientes/${organizationId}?error=asset`)
  await client!.from('cloud_protected_assets').upsert({
    organization_id: organizationId,
    name,
    asset_type: assetType,
    owner_area: String(formData.get('owner_area') ?? '').trim() || null,
    policy_name: String(formData.get('policy_name') ?? '').trim() || null,
    status: String(formData.get('status') ?? 'pending'),
    protected_bytes: Number(formData.get('protected_bytes') ?? 0) || 0,
  }, { onConflict: 'organization_id,name' })
  revalidatePath(`/admin/clientes/${organizationId}`)
  revalidatePath('/painel/ativos')
  redirect(`/admin/clientes/${organizationId}?asset=1`)
}

export async function recordRecoveryTestAction(formData: FormData) {
  const client = await adminClient()
  const organizationId = String(formData.get('organization_id') ?? '')
  if (!organizationId) redirect('/admin/clientes')
  const status = String(formData.get('status') ?? 'planned')
  const completed = status === 'passed' || status === 'failed'
  await client!.from('cloud_recovery_tests').insert({
    organization_id: organizationId,
    asset_id: String(formData.get('asset_id') ?? '') || null,
    test_type: String(formData.get('test_type') ?? 'File restore'),
    status,
    scheduled_at: new Date().toISOString(),
    completed_at: completed ? new Date().toISOString() : null,
    rto_seconds: Number(formData.get('rto_seconds') ?? 0) || null,
    notes: String(formData.get('notes') ?? '').trim() || null,
  })
  revalidatePath(`/admin/clientes/${organizationId}`)
  revalidatePath('/painel/recuperacao')
  redirect(`/admin/clientes/${organizationId}?recovery=1`)
}

export async function createIncidentAction(formData: FormData) {
  const client = await adminClient()
  const organizationId = String(formData.get('organization_id') ?? '')
  const title = String(formData.get('title') ?? '').trim()
  if (!organizationId || !title) redirect(`/admin/clientes/${organizationId}?error=incident`)
  await client!.from('cloud_incidents').insert({
    organization_id: organizationId,
    title,
    severity: String(formData.get('severity') ?? 'medium'),
    status: 'open',
    summary: String(formData.get('summary') ?? '').trim() || null,
  })
  revalidatePath(`/admin/clientes/${organizationId}`)
  revalidatePath('/admin/alertas')
  revalidatePath('/painel/incidentes')
  redirect(`/admin/clientes/${organizationId}?incident=1`)
}

export async function resolveIncidentAction(formData: FormData) {
  const client = await adminClient()
  const organizationId = String(formData.get('organization_id') ?? '')
  const incidentId = String(formData.get('incident_id') ?? '')
  await client!.from('cloud_incidents').update({ status: 'resolved', resolved_at: new Date().toISOString() }).eq('id', incidentId).eq('organization_id', organizationId)
  revalidatePath(`/admin/clientes/${organizationId}`)
  revalidatePath('/admin/alertas')
  revalidatePath('/painel/incidentes')
  redirect(`/admin/clientes/${organizationId}?resolved=1`)
}

export async function addOrganizationMemberAction(formData: FormData) {
  const client = await adminClient()
  const organizationId = String(formData.get('organization_id') ?? '')
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const role = String(formData.get('member_role') ?? 'viewer')
  if (!organizationId || !email) redirect(`/admin/clientes/${organizationId}?error=member`)

  const { data } = await client!.auth.admin.listUsers({ page: 1, perPage: 1000 })
  const user = data.users.find((candidate: { id: string; email?: string }) => candidate.email?.toLowerCase() === email)
  if (!user) redirect(`/admin/clientes/${organizationId}?error=user-not-found`)

  await client!.from('cloud_organization_members').upsert({ organization_id: organizationId, user_id: user.id, member_role: role }, { onConflict: 'organization_id,user_id' })
  revalidatePath(`/admin/clientes/${organizationId}`)
  revalidatePath('/painel/equipe')
  redirect(`/admin/clientes/${organizationId}?member=1`)
}

export async function createMonthlyReportAction(formData: FormData) {
  const client = await adminClient()
  const organizationId = String(formData.get('organization_id') ?? '')
  const referenceMonth = String(formData.get('reference_month') ?? '')
  if (!organizationId || !referenceMonth) redirect(`/admin/clientes/${organizationId}?error=report`)
  await client!.from('cloud_monthly_reports').upsert({
    organization_id: organizationId,
    reference_month: `${referenceMonth}-01`,
    health_score: Number(formData.get('health_score') ?? 0) || 0,
    backup_success_rate: Number(formData.get('backup_success_rate') ?? 0) || 0,
    recovery_tests_passed: Number(formData.get('recovery_tests_passed') ?? 0) || 0,
    incidents_count: Number(formData.get('incidents_count') ?? 0) || 0,
    report_url: String(formData.get('report_url') ?? '').trim() || null,
    generation_status: 'ready',
    source: 'admin',
    generated_at: new Date().toISOString(),
  }, { onConflict: 'organization_id,reference_month' })
  revalidatePath(`/admin/clientes/${organizationId}`)
  revalidatePath('/admin/relatorios')
  revalidatePath('/painel/relatorios')
  redirect(`/admin/clientes/${organizationId}?report=1`)
}

export async function closeSupportTicketAction(formData: FormData) {
  const client = await adminClient()
  const organizationId = String(formData.get('organization_id') ?? '')
  const ticketId = String(formData.get('ticket_id') ?? '')
  const now = new Date().toISOString()
  await client!.from('cloud_support_tickets').update({ status: 'closed', closed_at: now, updated_at: now }).eq('id', ticketId).eq('organization_id', organizationId)
  revalidatePath(`/admin/clientes/${organizationId}`)
  revalidatePath('/painel/suporte')
  redirect(`/admin/clientes/${organizationId}?ticket=1`)
}

export async function updateLeadStatusAction(formData: FormData) {
  const client = await adminClient()
  const id = String(formData.get('id') ?? '')
  const status = String(formData.get('status') ?? 'contacted')
  await client!.from('cloud_leads').update({ status }).eq('id', id)
  revalidatePath('/admin/leads')
  redirect('/admin/leads?updated=1')
}

export async function deleteTrialPlaceholderOrganizationAction(formData: FormData) {
  const client = await adminClient()
  const organizationId = String(formData.get('organization_id') ?? '')
  if (!organizationId) redirect('/admin/clientes?error=organization')

  const { data: org } = await client!.from('cloud_organizations')
    .select('id,name,provider_tenant_id')
    .eq('id', organizationId)
    .maybeSingle()

  if (!org || String(org.name).trim().toLowerCase() !== 'my first customer' || org.provider_tenant_id) {
    redirect(`/admin/clientes/${organizationId}?error=placeholder-only`)
  }

  const tables = ['cloud_protected_assets', 'cloud_backup_jobs', 'cloud_recovery_tests', 'cloud_incidents', 'cloud_monthly_reports', 'cloud_support_tickets']
  for (const table of tables) {
    const { count } = await client!.from(table).select('id', { count: 'exact', head: true }).eq('organization_id', organizationId)
    if ((count ?? 0) > 0) redirect(`/admin/clientes/${organizationId}?error=organization-not-empty`)
  }

  await client!.from('cloud_organizations').delete().eq('id', organizationId)
  revalidatePath('/admin/clientes')
  revalidatePath('/painel')
  redirect('/admin/clientes?deleted=trial-placeholder')
}

export async function updateSupportTicketAction(formData: FormData) {
  const client = await adminClient()
  const ticketId = String(formData.get('ticket_id') ?? '')
  const organizationId = String(formData.get('organization_id') ?? '')
  const status = String(formData.get('status') ?? 'in_progress')
  const resolutionNote = String(formData.get('resolution_note') ?? '').trim() || null
  if (!ticketId || !organizationId || !['open','in_progress','waiting_customer','resolved','closed'].includes(status)) {
    redirect(`/admin/chamados/${ticketId}?error=status`)
  }

  const now = new Date().toISOString()
  const payload: Record<string, unknown> = { status, updated_at: now }
  if (status === 'resolved') {
    payload.resolved_at = now
    payload.closed_at = null
    payload.resolution_note = resolutionNote
  } else if (status === 'closed') {
    payload.closed_at = now
    if (resolutionNote) payload.resolution_note = resolutionNote
  } else {
    payload.closed_at = null
    if (status === 'open' || status === 'in_progress') payload.resolved_at = null
    if (resolutionNote) payload.resolution_note = resolutionNote
  }

  await client!.from('cloud_support_tickets').update(payload).eq('id', ticketId).eq('organization_id', organizationId)
  revalidatePath('/admin/chamados')
  revalidatePath(`/admin/chamados/${ticketId}`)
  revalidatePath(`/admin/clientes/${organizationId}`)
  revalidatePath('/painel/suporte')
  revalidatePath(`/painel/suporte/${ticketId}`)
  redirect(`/admin/chamados/${ticketId}?updated=1`)
}

export async function replySupportTicketAdminAction(formData: FormData) {
  const client = await adminClient()
  const admin = await requireAdmin()
  const ticketId = String(formData.get('ticket_id') ?? '')
  const organizationId = String(formData.get('organization_id') ?? '')
  const body = String(formData.get('body') ?? '').trim()
  const nextStatus = String(formData.get('next_status') ?? 'waiting_customer')
  if (!ticketId || !organizationId || !body) redirect(`/admin/chamados/${ticketId}?error=message`)

  const now = new Date().toISOString()
  await client!.from('cloud_support_ticket_messages').insert({
    ticket_id: ticketId,
    organization_id: organizationId,
    author_id: admin.id,
    author_role: 'staff',
    body,
    is_internal: false,
  })
  await client!.from('cloud_support_tickets').update({
    status: ['in_progress','waiting_customer','resolved'].includes(nextStatus) ? nextStatus : 'waiting_customer',
    resolved_at: nextStatus === 'resolved' ? now : null,
    last_reply_at: now,
    updated_at: now,
  }).eq('id', ticketId).eq('organization_id', organizationId)

  revalidatePath('/admin/chamados')
  revalidatePath(`/admin/chamados/${ticketId}`)
  revalidatePath(`/admin/clientes/${organizationId}`)
  revalidatePath('/painel/suporte')
  revalidatePath(`/painel/suporte/${ticketId}`)
  redirect(`/admin/chamados/${ticketId}?sent=1`)
}
