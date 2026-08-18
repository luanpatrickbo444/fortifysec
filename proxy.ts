import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const AUTH_PUBLIC_PATHS = new Set([
  '/login',
  '/cadastro',
  '/recuperar-senha',
  '/atualizar-senha',
  '/admin/login',
  '/empresa/login',
  '/empresa/cadastro',
])

function getPublicConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || ''
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    ''

  return { url, key }
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Compatibilidade somente para a área de empresas.
  if (pathname === '/empresa/vagas' || pathname.startsWith('/empresa/vagas/')) {
    const target = request.nextUrl.clone()
    target.pathname = pathname.replace('/empresa/vagas', '/empresa/job-console')
    return NextResponse.redirect(target, 307)
  }

  // IMPORTANTE:
  // /admin/cursos e /admin/cursos/[id] NÃO são reescritos nem redirecionados.
  // O App Router deve resolver diretamente:
  // app/admin/cursos/page.tsx
  // app/admin/cursos/[id]/page.tsx
  let response = NextResponse.next({ request })

  if (AUTH_PUBLIC_PATHS.has(pathname)) return response

  const { url, key } = getPublicConfig()
  if (!url || !key) return response

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))

        response = NextResponse.next({ request })

        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        )
      },
    },
  })

  // Somente refresh/validação de sessão. Sem redirect/rewrite do admin.
  await supabase.auth.getUser().catch(() => null)

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
