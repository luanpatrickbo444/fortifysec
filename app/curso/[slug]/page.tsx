import { redirect } from 'next/navigation'

// Rota antiga mantida apenas para compatibilidade com links/bookmarks salvos.
// O conteúdo do curso agora vive em /painel/curso/[slug], dentro do mesmo
// layout do menu lateral, para que a navegação nunca precise remontar o shell.
export default async function CourseAlias({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  redirect(`/painel/curso/${slug}`)
}
