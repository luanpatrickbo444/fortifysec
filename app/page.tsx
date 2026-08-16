import { AcademyPublic } from '@/components/AcademyPublic'

// Fallback da raiz. Em produção, next.config.ts também garante `/` -> `/academy`
// via rewrite beforeFiles, mantendo a URL `/` no navegador.
export default function HomePage() {
  return <AcademyPublic />
}
