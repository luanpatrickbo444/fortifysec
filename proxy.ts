import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/proxy'

/**
 * Protected-session boundary only.
 *
 * Public routes (/login, /academy, /planos, etc.) never enter this Proxy.
 * Authorization itself remains inside the protected server pages/actions.
 */
export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Public gateways living below protected prefixes.
  if (
    pathname === '/admin/login' ||
    pathname === '/empresa/login' ||
    pathname === '/empresa/cadastro'
  ) {
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
