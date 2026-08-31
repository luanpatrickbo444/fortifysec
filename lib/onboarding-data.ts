import { requireUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { resolvePortalOrganization } from '@/lib/portal-org'

export type OnboardingRequest = {
  id: string
  organization_name: string
  legal_name: string | null
  cnpj: string | null
  contact_name: string
  contact_phone: string | null
  plan: string
  employees: string | null
  data_volume: string | null
  infrastructure: string | null
  current_backup: string | null
  critical_systems: string | null
  rpo_target: string | null
  rto_target: string | null
  notes: string | null
  status: string
  admin_notes: string | null
  created_at: string
  updated_at: string
}

export async function getOnboardingState() {
  const user = await requireUser()
  if (user.demo) return { user, org: null, organizations: [], request: null, profile: { full_name: 'Conta demonstração' } }

  const supabase = await createClient()
  const [{ data: profile }, { data: request }, portal] = await Promise.all([
    supabase!.from('cloud_profiles').select('full_name').eq('id', user.id).maybeSingle(),
    supabase!.from('cloud_onboarding_requests').select('*').eq('user_id', user.id).maybeSingle(),
    resolvePortalOrganization(supabase!, user.id),
  ])

  return {
    user,
    org: portal.org,
    organizations: portal.organizations,
    request: request as OnboardingRequest | null,
    profile,
  }
}

export async function getPortalShellContext() {
  const state = await getOnboardingState()
  return {
    email: state.user.email,
    fullName: state.profile?.full_name || state.user.email.split('@')[0] || 'Cliente Fortify',
    activeOrgId: state.org?.id ?? null,
    orgName: state.org?.name ?? null,
    orgPlan: state.org?.plan ?? null,
    orgStatus: state.org?.status ?? null,
    organizations: state.organizations ?? [],
    onboardingStatus: state.request?.status ?? null,
  }
}
