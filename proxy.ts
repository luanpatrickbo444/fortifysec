import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const AUTH_PUBLIC_PATHS = new Set([
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
  let response = NextResponse.next({ request })

  // Public gateways under protected prefixes must never be session-gated.
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

  // Refresh session only. Authorization stays in requireUser/requireAdmin/requireCompany.
  await supabase.auth.getUser().catch(() => null)
  return response
}

export const config = {
  // IMPORTANT: never run Proxy on public pages such as /, /academy or /login.
  matcher: [
    '/painel/:path*',
    '/curso/:path*',
    '/admin/:path*',
    '/empresa/:path*',
  ],
}
