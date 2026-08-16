import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

function getPublicConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || ''
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    ''
  return { url, key }
}

// IMPORTANT: Next.js only recognizes edge middleware when this file is named
// `middleware.ts` (project root or `src/`) AND exports a function named
// `middleware`. It was previously named `proxy.ts` exporting `proxy`, which
// Next.js silently ignores — no build error, no runtime error, it just never
// runs. That meant the Supabase session cookie was never refreshed on
// navigation, so authenticated requests eventually carried an expired/stale
// access token. Under RLS, an invalid session behaves like "not logged in":
// queries either error out or return zero rows instead of throwing, which is
// exactly why students saw a blank/broken CTF page and courses 404'd (the
// course lookup in app/curso/[slug]/page.tsx came back empty and hit
// notFound()) while admin pages kept working (they use the service-role
// admin client, which bypasses auth/RLS entirely).
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })
  const { url, key } = getPublicConfig()

  // Public pages must not become a global 500 just because auth env vars are absent.
  // Protected pages/actions will still fail with a clear configuration error until fixed.
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

  // Touching getUser() here is what actually refreshes the token and
  // rewrites the auth cookies on the response before the request reaches
  // any Server Component/Action.
  await supabase.auth.getUser().catch(() => null)
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
