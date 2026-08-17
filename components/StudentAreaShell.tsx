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
    const [{ data: profile }, { data: companyMember }] = await Promise.all([
      supabase.from('profiles').select('role').eq('id', user.id).maybeSingle(),
      supabase.from('company_members').select('company_id').eq('user_id', user.id).limit(1).maybeSingle(),
    ])
    role = String(profile?.role || 'student')
    hasCompany = Boolean(companyMember?.company_id)
  }

  return (
    <DashboardShell mode="student" isAdmin={role === 'admin'} hasCompany={hasCompany}>
      {children}
    </DashboardShell>
  )
}
