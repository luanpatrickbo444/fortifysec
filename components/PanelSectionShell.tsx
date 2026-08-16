import { DashboardShell } from '@/components/DashboardShell'
import { requireUser } from '@/lib/auth'

/**
 * Shared shell for authenticated student sections under /painel/*.
 *
 * Keep this component visual-free: it only resolves the current role and
 * delegates all UI to the canonical DashboardShell. This makes each route
 * section independent from the parent /painel layout while preserving the
 * exact same sidebar and styles used elsewhere in the platform.
 */
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
