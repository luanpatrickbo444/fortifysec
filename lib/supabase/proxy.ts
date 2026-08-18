import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { getSupabasePublicKey, getSupabaseUrl } from './config'

/**
 * Refreshes the Supabase session and returns the SAME response that received
 * the refreshed cookies/headers. No authorization or route redirects live here.
 *
 * Keeping this function small is intentional: Proxy runs before filesystem
 * routing, so auth refresh must never decide whether a Next.js page exists.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })

  const url = getSupabaseUrl()
  const key = getSupabasePublicKey()

  // Public pages must remain reachable even during a configuration mistake.
  // Protected layouts/actions still validate configuration server-side.
  if (!url || !key) return response

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet, cacheHeaders) {
        // Make the refreshed cookie immediately visible to Server Components
        // in this same request.
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value)
        })

        response = NextResponse.next({ request })

        // Make the refreshed cookie visible to the browser for the next request.
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })

        // @supabase/ssr >= 0.10 passes cache-safety headers here. Propagating
        // them is important behind Vercel/CDN so an auth response is not reused.
        for (const [header, value] of Object.entries(cacheHeaders ?? {})) {
          response.headers.set(header, value)
        }
      },
    },
  })

  // Official Supabase SSR flow: getClaims validates/refreshes the JWT and is
  // the only auth operation that belongs in Proxy.
  await supabase.auth.getClaims().catch(() => null)

  return response
}
