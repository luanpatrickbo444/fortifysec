import { redirect } from 'next/navigation'

export default function LegacyAdminCourses() {
  redirect('/admin?view=courses')
}
