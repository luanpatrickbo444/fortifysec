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
  const { user } = await requireUser()

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
  const { user } = await requireUser()
  const admin = createAdminClient()
  const { data: membership, error } = await admin
    .from('company_members')
    .select('company_id,member_role,companies(id,name,slug,verified,active)')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle()

  const company = Array.isArray((membership as any)?.companies)
    ? (membership as any).companies[0]
    : (membership as any)?.companies

  if (error || !membership || !company || !company.active) redirect('/empresa/login?erro=' + encodeURIComponent('Esta conta não está vinculada a uma empresa ativa.'))

  return { supabase: admin, user, membership, company }
}
