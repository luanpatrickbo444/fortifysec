import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type Props = { params: Promise<{ id: string }> }

export default async function LegacyAdminCourseStudio({ params }: Props) {
  const { id } = await params
  redirect(`/admin/content-studio/${encodeURIComponent(id)}`)
}
