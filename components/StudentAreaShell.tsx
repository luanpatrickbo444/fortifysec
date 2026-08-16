import { DashboardShell } from '@/components/DashboardShell'
import { requireUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'

export async function StudentAreaShell({ children }: { children: React.ReactNode }) {
  const { supabase, user } = await requireUser()

  let role = 'student'
  let hasCompany = false

  try {
    const admin = createAdminClient()
    const [{ data: profile }, { data: companyMember }] = await Promise.all([
      admin.from('profiles').select('role').eq('id', user.id).maybeSingle(),
      admin.from('company_members').select('company_id').eq('user_id', user.id).limit(1).maybeSingle(),
    ])
    role = String(profile?.role || 'student')
    hasCompany = Boolean(companyMember?.company_id)
  } catch {
    // Se a chave admin não estiver configurada (ou falhar por qualquer motivo),
    // tenta de novo com o client normal (sujeito a RLS). Essa segunda tentativa
    // também pode falhar — nesse caso, NUNCA deixamos o layout inteiro do painel
    // quebrar por causa disso. Mantemos os valores padrão (student / sem empresa)
    // e a página continua carregando normalmente.
    try {
      const [{ data: profile }, { data: companyMember }] = await Promise.all([
        supabase.from('profiles').select('role').eq('id', user.id).maybeSingle(),
        supabase.from('company_members').select('company_id').eq('user_id', user.id).limit(1).maybeSingle(),
      ])
      role = String(profile?.role || 'student')
      hasCompany = Boolean(companyMember?.company_id)
    } catch (error) {
      console.error('[painel:shell-fallback]', error)
    }
  }

  return (
    <DashboardShell mode="student" isAdmin={role === 'admin'} hasCompany={hasCompany}>
      {children}
    </DashboardShell>
  )
}
