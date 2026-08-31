import { createAdminClient } from '@/lib/supabase/admin'
import { hasSupabaseConfig } from '@/lib/supabase/config'

export async function getAdminOverview() {
  if (!hasSupabaseConfig()) return { clients: 12, jobs: 428, successRate: 99.5, successCount: 426, alerts: 3, tests: 7, onboarding: 2, leads: 5, tickets: 4 }
  const s = createAdminClient()
  if (!s) return { clients: 0, jobs: 0, successRate: 0, successCount: 0, alerts: 0, tests: 0, onboarding: 0, leads: 0, tickets: 0 }
  const since = new Date(Date.now() - 86400000).toISOString()
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
  const [{ count: clients }, { data: jobs }, { count: alerts }, { count: tests }, { count: onboarding }, { count: leads }, { count: tickets }] = await Promise.all([
    s.from('cloud_organizations').select('id', { count: 'exact', head: true }),
    s.from('cloud_backup_jobs').select('status').gte('created_at', since),
    s.from('cloud_incidents').select('id', { count: 'exact', head: true }).not('status','in','(resolved,closed)'),
    s.from('cloud_recovery_tests').select('id', { count: 'exact', head: true }).gte('created_at', monthStart),
    s.from('cloud_onboarding_requests').select('id', { count: 'exact', head: true }).in('status', ['submitted', 'reviewing', 'needs_info', 'approved']),
    s.from('cloud_leads').select('id', { count: 'exact', head: true }).eq('status', 'new'),
    s.from('cloud_support_tickets').select('id', { count: 'exact', head: true }).in('status', ['open', 'in_progress', 'waiting_customer']),
  ])
  const rows = jobs ?? []
  const ok = rows.filter((j: any) => j.status === 'success').length
  return { clients: clients ?? 0, jobs: rows.length, successRate: rows.length ? (ok / rows.length) * 100 : 0, successCount: ok, alerts: alerts ?? 0, tests: tests ?? 0, onboarding: onboarding ?? 0, leads: leads ?? 0, tickets: tickets ?? 0 }
}

export async function getAdminClients() {
  if (!hasSupabaseConfig()) return [{ id: 'demo-acme', name: 'ACME Ltda.', plan: 'Business', status: 'active' }, { id: 'demo-norte', name: 'Grupo Norte', plan: 'Enterprise', status: 'active' }, { id: 'demo-vida', name: 'Clínica Vida', plan: 'Essencial', status: 'onboarding' }]
  const s = createAdminClient(); if (!s) return []
  const { data } = await s.from('cloud_organizations').select('id,name,plan,status,contact_email,data_volume,updated_at,provider,provider_tenant_id,last_provider_sync_at,provider_storage_bytes,provider_immutable_storage_bytes,provider_usage_synced_at').order('name')
  return data ?? []
}

export async function getAdminOnboarding() {
  if (!hasSupabaseConfig()) return [{ id: 'demo', user_id: 'demo-user', organization_name: 'Clínica Vida', contact_name: 'Ana Souza', plan: 'Essencial', data_volume: '500 GB–2 TB', status: 'submitted', admin_notes: null, updated_at: new Date().toISOString(), email: 'ana@clinicavida.com.br' }]
  const s = createAdminClient(); if (!s) return []
  const { data: requests } = await s.from('cloud_onboarding_requests').select('*').order('updated_at', { ascending: false })
  if (!requests?.length) return []
  const { data: users } = await s.auth.admin.listUsers({ page: 1, perPage: 1000 })
  const emails = new Map(users.users.map((u: { id: string; email?: string }) => [u.id, u.email ?? '']))
  return requests.map((r: any) => ({ ...r, email: emails.get(r.user_id) || '' }))
}

export async function getAdminClientDetail(id: string) {
  if (!hasSupabaseConfig()) return null
  const s = createAdminClient(); if (!s) return null
  const [{ data: org }, { data: assets }, { data: incidents }, { data: recovery }, { data: members }, { data: backups }, { data: reports }, { data: tickets }] = await Promise.all([
    s.from('cloud_organizations').select('*').eq('id', id).maybeSingle(),
    s.from('cloud_protected_assets').select('*').eq('organization_id', id).order('name'),
    s.from('cloud_incidents').select('*').eq('organization_id', id).order('opened_at', { ascending: false }).limit(20),
    s.from('cloud_recovery_tests').select('*,cloud_protected_assets(name)').eq('organization_id', id).order('created_at', { ascending: false }).limit(20),
    s.from('cloud_organization_members').select('*').eq('organization_id', id),
    s.from('cloud_backup_jobs').select('*,cloud_protected_assets(name)').eq('organization_id', id).order('finished_at', { ascending: false }).limit(20),
    s.from('cloud_monthly_reports').select('*').eq('organization_id', id).order('reference_month', { ascending: false }).limit(12),
    s.from('cloud_support_tickets').select('*').eq('organization_id', id).order('created_at', { ascending: false }).limit(30),
  ])
  if (!org) return null
  const { data: users } = await s.auth.admin.listUsers({ page: 1, perPage: 1000 })
  const userMap = new Map(users.users.map((u: { id: string; email?: string }) => [u.id, u.email ?? '']))
  return { org, assets: assets ?? [], incidents: incidents ?? [], recovery: recovery ?? [], backups: backups ?? [], reports: reports ?? [], tickets: tickets ?? [], members: (members ?? []).map((m: any) => ({ ...m, email: userMap.get(m.user_id) || 'Usuário' })) }
}

export async function getAdminEvents() {
  if (!hasSupabaseConfig()) return [{ id: '1', received_at: new Date().toISOString(), provider: 'backup-provider', event_type: 'backup.completed', external_id: 'demo-001' }]
  const s = createAdminClient(); if (!s) return []
  const { data } = await s.from('cloud_integration_events').select('id,received_at,provider,event_type,external_id,organization_id').order('received_at', { ascending: false }).limit(100)
  return data ?? []
}

export async function getAdminLeads() {
  if (!hasSupabaseConfig()) return [{ id: 'demo', name: 'Marcos Silva', company: 'Empresa Demo', email: 'marcos@empresa.com.br', phone: '(65) 99999-0000', employees: '21–50', data_volume: '500 GB–2 TB', status: 'new', created_at: new Date().toISOString() }]
  const s = createAdminClient(); if (!s) return []
  const { data } = await s.from('cloud_leads').select('*').order('created_at', { ascending: false }).limit(200)
  return data ?? []
}

export async function getAdminAlerts() {
  if (!hasSupabaseConfig()) return []
  const s = createAdminClient(); if (!s) return []
  const { data: incidents } = await s.from('cloud_incidents')
    .select('id,organization_id,asset_id,title,severity,status,opened_at,summary,provider,external_alert_id,last_seen_at')
    .order('opened_at', { ascending: false })
    .limit(300)
  const rows = incidents ?? []
  if (!rows.length) return []
  const orgIds = [...new Set(rows.map((row: any) => row.organization_id).filter(Boolean))]
  const assetIds = [...new Set(rows.map((row: any) => row.asset_id).filter(Boolean))]
  const [{ data: orgs }, { data: assets }] = await Promise.all([
    orgIds.length ? s.from('cloud_organizations').select('id,name').in('id', orgIds) : Promise.resolve({ data: [] as any[] }),
    assetIds.length ? s.from('cloud_protected_assets').select('id,name').in('id', assetIds) : Promise.resolve({ data: [] as any[] }),
  ])
  const orgMap = new Map((orgs ?? []).map((org: any) => [String(org.id), String(org.name)]))
  const assetMap = new Map((assets ?? []).map((asset: any) => [String(asset.id), String(asset.name)]))
  return rows.map((row: any) => ({
    ...row,
    organization_name: orgMap.get(String(row.organization_id)) ?? 'Organização',
    asset_name: row.asset_id ? assetMap.get(String(row.asset_id)) ?? 'Ativo' : '—',
  }))
}

export async function getAdminReports() {
  if (!hasSupabaseConfig()) return []
  const s = createAdminClient(); if (!s) return []
  const { data: reports } = await s.from('cloud_monthly_reports')
    .select('id,organization_id,reference_month,health_score,backup_success_rate,recovery_tests_passed,incidents_count,report_url,created_at,generation_status,source,generated_at,summary')
    .order('reference_month', { ascending: false })
    .limit(300)
  const rows = reports ?? []
  if (!rows.length) return []
  const orgIds = [...new Set(rows.map((row: any) => row.organization_id).filter(Boolean))]
  const { data: orgs } = orgIds.length
    ? await s.from('cloud_organizations').select('id,name,plan,status').in('id', orgIds)
    : { data: [] as any[] }
  const orgMap = new Map((orgs ?? []).map((org: any) => [String(org.id), org]))
  return rows.map((row: any) => ({ ...row, organization: orgMap.get(String(row.organization_id)) ?? null }))
}

export async function getAdminTickets() {
  if (!hasSupabaseConfig()) return []
  const s = createAdminClient(); if (!s) return []
  const { data: tickets } = await s.from('cloud_support_tickets')
    .select('id,organization_id,subject,priority,category,status,created_at,updated_at,resolved_at,closed_at,last_reply_at')
    .order('updated_at', { ascending: false })
    .limit(500)
  const rows = tickets ?? []
  if (!rows.length) return []
  const orgIds = [...new Set(rows.map((row: any) => row.organization_id).filter(Boolean))]
  const { data: orgs } = orgIds.length ? await s.from('cloud_organizations').select('id,name,plan,status').in('id', orgIds) : { data: [] as any[] }
  const orgMap = new Map((orgs ?? []).map((org: any) => [String(org.id), org]))
  return rows.map((row: any) => ({ ...row, organization: orgMap.get(String(row.organization_id)) ?? null }))
}

export async function getAdminTicketDetail(id: string) {
  if (!hasSupabaseConfig()) return null
  const s = createAdminClient(); if (!s) return null
  const { data: ticket } = await s.from('cloud_support_tickets').select('*').eq('id', id).maybeSingle()
  if (!ticket) return null
  const [{ data: org }, { data: messages }] = await Promise.all([
    s.from('cloud_organizations').select('id,name,plan,status,provider').eq('id', ticket.organization_id).maybeSingle(),
    s.from('cloud_support_ticket_messages').select('*').eq('ticket_id', id).order('created_at', { ascending: true }),
  ])
  return { ticket, organization: org, messages: messages ?? [] }
}

export async function getAdminReportDetail(id: string) {
  if (!hasSupabaseConfig()) return null
  const s = createAdminClient(); if (!s) return null
  const { data: report } = await s.from('cloud_monthly_reports').select('*').eq('id', id).maybeSingle()
  if (!report) return null
  const { data: organization } = await s.from('cloud_organizations').select('id,name,plan,status,provider').eq('id', report.organization_id).maybeSingle()
  return { report, organization }
}
