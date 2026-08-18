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
  // `/admin/cursos` is kept only as a compatibility URL.
  // The canonical route is `/admin/content-studio` because the old segment
  // intermittently returned a Vercel/App Router 404 despite being present
  // in the production route manifest. A real HTTP redirect avoids RSC/rewrite
  // ambiguity and gives the browser a stable canonical route.
  const pathname = request.nextUrl.pathname
  if (pathname === '/admin/cursos' || pathname.startsWith('/admin/cursos/')) {
    const target = request.nextUrl.clone()
    target.pathname = pathname.replace('/admin/cursos', '/admin/content-studio')
    return NextResponse.redirect(target, 307)
  }

  let response = NextResponse.next({ request })

  // Login/cadastro/recovery pages are always reachable.
  // Authorization is performed only inside protected route layouts/actions.
  if (AUTH_PUBLIC_PATHS.has(request.nextUrl.pathname)) return response

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

  // Session refresh only. This proxy intentionally contains NO redirects.
  await supabase.auth.getUser().catch(() => null)
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
