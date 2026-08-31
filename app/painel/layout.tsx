import { PortalShell } from '@/components/PortalShell'
import { getPortalShellContext } from '@/lib/onboarding-data'

export const metadata = { title: 'Portal do Cliente' }
export default async function Layout({ children }: { children: React.ReactNode }) {
  const context = await getPortalShellContext()
  return <PortalShell context={context}>{children}</PortalShell>
}
