'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { getAcronisTenant } from '@/lib/acronis/tenants'
import { syncAcronisOrganization, syncAllMappedAcronisOrganizations } from '@/lib/acronis/sync'

function isStarterTenantName(name: string | undefined) {
  return String(name ?? '').trim().toLowerCase() === 'my first customer'
}

async function adminClient() {
  const user = await requireAdmin()
  const client = createAdminClient()
  if (!client) redirect('/admin/integracoes/acronis?error=service-role')
  return { client: client!, user }
}

function requireStarterConfirmation(tenantName: string | undefined, formData: FormData) {
  if (isStarterTenantName(tenantName) && String(formData.get('confirm_starter') ?? '') !== '1') {
    redirect('/admin/integracoes/acronis?error=starter-tenant')
  }
}

export async function linkAcronisTenantAction(formData: FormData) {
  const { client } = await adminClient()
  const organizationId = String(formData.get('organization_id') ?? '')
  const tenantId = String(formData.get('tenant_id') ?? '')
  if (!organizationId || !tenantId) redirect('/admin/integracoes/acronis?error=mapping')

  const tenant = await getAcronisTenant(tenantId)
  if (!tenant?.id) redirect('/admin/integracoes/acronis?error=tenant')
  requireStarterConfirmation(tenant.name, formData)

  const { error } = await client.from('cloud_organizations').update({
    provider: 'acronis',
    provider_tenant_id: tenant.id,
    provider_metadata: { tenant: { id: tenant.id, name: tenant.name, kind: tenant.kind, enabled: tenant.enabled, parent_id: tenant.parent_id ?? null } },
    updated_at: new Date().toISOString(),
  }).eq('id', organizationId)
  if (error) redirect(`/admin/integracoes/acronis?error=${encodeURIComponent(error.message)}`)

  revalidatePath('/admin/integracoes/acronis')
  revalidatePath('/admin/clientes')
  redirect('/admin/integracoes/acronis?mapped=1')
}

export async function unlinkAcronisTenantAction(formData: FormData) {
  const { client } = await adminClient()
  const organizationId = String(formData.get('organization_id') ?? '')
  if (!organizationId) redirect('/admin/integracoes/acronis?error=mapping')
  await client.from('cloud_organizations').update({
    provider: null,
    provider_tenant_id: null,
    provider_metadata: {},
    last_provider_sync_at: null,
    updated_at: new Date().toISOString(),
  }).eq('id', organizationId)
  revalidatePath('/admin/integracoes/acronis')
  revalidatePath('/admin/clientes')
  redirect('/admin/integracoes/acronis?unmapped=1')
}

export async function createFortifyOrgFromAcronisTenantAction(formData: FormData) {
  const { client } = await adminClient()
  const tenantId = String(formData.get('tenant_id') ?? '')
  if (!tenantId) redirect('/admin/integracoes/acronis?error=tenant')
  const tenant = await getAcronisTenant(tenantId)
  if (!tenant?.id || !tenant.name) redirect('/admin/integracoes/acronis?error=tenant')
  requireStarterConfirmation(tenant.name, formData)

  const { data: existing } = await client.from('cloud_organizations')
    .select('id')
    .eq('provider', 'acronis')
    .eq('provider_tenant_id', tenant.id)
    .maybeSingle()
  if (existing?.id) redirect(`/admin/integracoes/acronis?existing=${existing.id}`)

  const { data: org, error } = await client.from('cloud_organizations').insert({
    name: tenant.name,
    plan: 'Business',
    status: 'active',
    provider: 'acronis',
    provider_tenant_id: tenant.id,
    provider_metadata: { tenant: { id: tenant.id, name: tenant.name, kind: tenant.kind, enabled: tenant.enabled, parent_id: tenant.parent_id ?? null } },
    updated_at: new Date().toISOString(),
  }).select('id').single()
  if (error || !org) redirect(`/admin/integracoes/acronis?error=${encodeURIComponent(error?.message ?? 'org')}`)

  // Importante: criar/mapear um cliente NÃO concede acesso ao portal.
  // Portal access é uma decisão separada e explícita.
  revalidatePath('/admin/integracoes/acronis')
  revalidatePath('/admin/clientes')
  redirect(`/admin/integracoes/acronis?created=${org.id}`)
}

export async function grantAdminPortalAccessAction(formData: FormData) {
  const { client, user } = await adminClient()
  const organizationId = String(formData.get('organization_id') ?? '')
  if (!organizationId) redirect('/admin/integracoes/acronis?error=portal-access')

  const { error } = await client.from('cloud_organization_members').upsert({
    organization_id: organizationId,
    user_id: user.id,
    member_role: 'admin',
  }, { onConflict: 'organization_id,user_id' })
  if (error) redirect(`/admin/integracoes/acronis?error=${encodeURIComponent(error.message)}`)

  revalidatePath('/admin/integracoes/acronis')
  revalidatePath('/painel')
  redirect('/admin/integracoes/acronis?portal_access=1')
}

export async function revokeAdminPortalAccessAction(formData: FormData) {
  const { client, user } = await adminClient()
  const organizationId = String(formData.get('organization_id') ?? '')
  if (!organizationId) redirect('/admin/integracoes/acronis?error=portal-access')

  const { error } = await client.from('cloud_organization_members')
    .delete()
    .eq('organization_id', organizationId)
    .eq('user_id', user.id)
  if (error) redirect(`/admin/integracoes/acronis?error=${encodeURIComponent(error.message)}`)

  revalidatePath('/admin/integracoes/acronis')
  revalidatePath('/painel')
  redirect('/admin/integracoes/acronis?portal_access_removed=1')
}

export async function syncAcronisAction(formData: FormData) {
  await requireAdmin()
  const organizationId = String(formData.get('organization_id') ?? '')
  try {
    if (organizationId) await syncAcronisOrganization(organizationId)
    else await syncAllMappedAcronisOrganizations()
  } catch (error) {
    redirect(`/admin/integracoes/acronis?sync_error=${encodeURIComponent(error instanceof Error ? error.message : String(error))}`)
  }
  revalidatePath('/admin/integracoes/acronis')
  revalidatePath('/admin')
  revalidatePath('/admin/clientes')
  revalidatePath('/admin/alertas')
  revalidatePath('/admin/relatorios')
  revalidatePath('/admin/eventos')
  revalidatePath('/painel')
  revalidatePath('/painel/ativos')
  revalidatePath('/painel/backups')
  revalidatePath('/painel/incidentes')
  redirect('/admin/integracoes/acronis?synced=1')
}
