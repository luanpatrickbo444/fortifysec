import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function requireUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: accessProfile } = await supabase
    .from('profiles')
    .select('blocked')
    .eq('id', user.id)
    .maybeSingle()

  if (accessProfile?.blocked) redirect('/bloqueado')
  return { supabase, user }
}

export async function requireAdmin() {
  // Admin has its own gateway. Do not call requireUser() here because that
  // function redirects anonymous users to /login (student gateway). Keeping
  // the gateways separate prevents cross-area redirect cycles.
  const sessionClient = await createClient()
  const { data: { user } } = await sessionClient.auth.getUser()
  if (!user) redirect('/admin/login')

  // A autorização administrativa é conferida server-side com a chave privada.
  // Isso evita depender de RLS/policies legadas para descobrir a role do usuário.
  let admin
  try {
    admin = createAdminClient()
  } catch {
    redirect('/admin/login?erro=' + encodeURIComponent('Configuração administrativa do servidor ausente.'))
  }

  const { data: profile, error } = await admin
    .from('profiles')
    .select('role,name,blocked,email')
    .eq('id', user.id)
    .maybeSingle()

  if (error || !profile) {
    redirect('/admin/login?erro=' + encodeURIComponent('Perfil da conta não está sincronizado.'))
  }
  if (profile.blocked) redirect('/bloqueado')
  if (String(profile.role) !== 'admin') redirect('/painel')

  return { supabase: admin, user, profile }
}

export async function hasActiveEnrollment(courseId: string) {
  const { supabase, user } = await requireUser()
  const { data } = await supabase
    .from('enrollments')
    .select('id,status')
    .eq('user_id', user.id)
    .eq('course_id', courseId)
    .eq('status', 'active')
    .maybeSingle()
  return !!data
}

export async function requireCompany() {
  // Company routes have their own login gateway. Do not call requireUser() here,
  // otherwise an unauthenticated company request is sent to /login and can enter
  // a cross-gateway redirect cycle.
  const sessionClient = await createClient()
  const { data: { user } } = await sessionClient.auth.getUser()
  if (!user) redirect('/empresa/login')

  const admin = createAdminClient()

  const { data: profile } = await admin
    .from('profiles')
    .select('blocked')
    .eq('id', user.id)
    .maybeSingle()
  if (profile?.blocked) redirect('/bloqueado')

  const { data: membership, error } = await admin
    .from('company_members')
    .select('company_id,member_role,companies(id,name,slug,verified,active)')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle()

  const company = Array.isArray((membership as any)?.companies)
    ? (membership as any).companies[0]
    : (membership as any)?.companies

  if (error || !membership || !company || !company.active) {
    redirect('/empresa/login?erro=' + encodeURIComponent('Esta conta não está vinculada a uma empresa ativa.'))
  }

  return { supabase: admin, user, membership, company }
}
