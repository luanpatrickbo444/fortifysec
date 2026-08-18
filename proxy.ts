import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/proxy'

/**
 * FortifySec network boundary.
 *
 * IMPORTANT:
 * Public pages MUST NOT initialize/refresh the Supabase SSR session in Proxy.
 * They need to remain reachable even with stale/invalid auth cookies.
 *
 * Only protected application surfaces pass through updateSession().
 */
export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Login gateways are intentionally public even though they live below
  // /admin and /empresa, which are otherwise protected matcher prefixes.
  if (pathname === '/admin/login' || pathname === '/empresa/login') {
    return NextResponse.next()
  }

  return updateSession(request)
}

export const config = {
  matcher: [
    '/painel/:path*',
    '/curso/:path*',
    '/admin/:path*',
    '/empresa/:path*',
    '/api/checkout/:path*',
  ],
}
