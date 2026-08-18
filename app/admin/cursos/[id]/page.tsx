import { redirect } from 'next/navigation'

type Props = { params: Promise<{ id: string }> }

export default async function LegacyAdminCourseStudio({ params }: Props) {
  const { id } = await params
  redirect(`/admin?view=course&course=${encodeURIComponent(id)}`)
}
