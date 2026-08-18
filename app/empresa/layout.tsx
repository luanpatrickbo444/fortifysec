export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * Employer pages are session-bound and must never be reused from a shared cache.
 * Individual pages/actions keep their own requireCompany() checks.
 */
export default function EmpresaLayout({ children }: { children: React.ReactNode }) {
  return children
}
