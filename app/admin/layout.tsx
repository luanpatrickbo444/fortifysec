export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * Admin pages are always rendered per request. Individual pages/actions keep
 * their own requireAdmin() authorization checks.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children
}
