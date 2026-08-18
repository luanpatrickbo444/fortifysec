// Stable internal alias for /admin/cursos.
// The public URL remains /admin/cursos via next.config.ts rewrite.
export const dynamic = 'force-dynamic'
export const revalidate = 0

export { default } from '../cursos/page'
