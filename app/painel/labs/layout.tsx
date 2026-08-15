import { DashboardShell } from '@/components/DashboardShell'
import { requireUser } from '@/lib/auth'
import { getPlatformAccess } from '@/lib/platform-access'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function LabsLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireUser()
  const access = await getPlatformAccess(user.id)

  return <DashboardShell admin={access.isAdmin}>{children}</DashboardShell>
}
