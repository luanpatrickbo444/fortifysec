import { DashboardShell } from '@/components/DashboardShell'
import { requireUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function PanelSectionShell({ children }: { children: React.ReactNode }) {
  const { supabase, user } = await requireUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  return (
    <DashboardShell admin={String(profile?.role || '') === 'admin'}>
      {children}
    </DashboardShell>
  )
}
