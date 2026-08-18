import { redirect } from 'next/navigation'

export default async function LegacyPanelCourse({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  redirect(`/curso/${encodeURIComponent(slug)}`)
}
