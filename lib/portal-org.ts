import { cookies } from 'next/headers'

export type PortalOrganization = {
  id: string
  name: string
  plan: string
  status: string
  provider: string | null
}

export async function resolvePortalOrganization(supabase: any, userId: string) {
  const { data: memberships, error: membershipError } = await supabase
    .from('cloud_organization_members')
    .select('organization_id,member_role,created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })

  if (membershipError || !memberships?.length) {
    return { org: null as PortalOrganization | null, organizations: [] as PortalOrganization[], membershipRole: null as string | null }
  }

  const ids = memberships.map((member: any) => String(member.organization_id))
  const { data: organizations } = await supabase
    .from('cloud_organizations')
    .select('id,name,plan,status,provider')
    .in('id', ids)
    .order('name', { ascending: true })

  const orgs: PortalOrganization[] = (organizations ?? []).map((org: any) => ({
    id: String(org.id),
    name: String(org.name),
    plan: String(org.plan ?? 'Essencial'),
    status: String(org.status ?? 'onboarding'),
    provider: org.provider ? String(org.provider) : null,
  }))

  if (!orgs.length) return { org: null, organizations: [], membershipRole: null }

  const cookieStore = await cookies()
  const preferredId = cookieStore.get('fortify_portal_org')?.value
  const selected = orgs.find((org) => org.id === preferredId)
    ?? orgs.find((org) => org.status === 'active')
    ?? orgs[0]

  const membership = memberships.find((member: any) => String(member.organization_id) === selected.id)
  return {
    org: selected,
    organizations: orgs,
    membershipRole: membership?.member_role ? String(membership.member_role) : null,
  }
}
