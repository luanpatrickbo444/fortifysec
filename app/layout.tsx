import { StudentAreaShell } from '@/components/StudentAreaShell'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function CourseAreaLayout({ children }: { children: React.ReactNode }) {
  return <StudentAreaShell>{children}</StudentAreaShell>
}
