import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { getSupabasePublicKey, getSupabaseUrl } from './config'

/**
 * Session refresh only. Compatible with @supabase/ssr 0.7.x.
 *
 * This function never decides authorization and never redirects. Route access
 * remains owned by requireUser(), requireAdmin() and requireCompany().
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })

  const url = getSupabaseUrl()
  const key = getSupabasePublicKey()
  if (!url || !key) return response

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        // The refreshed cookie must be visible both to the current request and
        // to the browser response. This is the stable 0.7.x contract.
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value)
        })

        response = NextResponse.next({ request })

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  // 0.7.x stable refresh path used by the last known-good FortifySec build.
  await supabase.auth.getUser().catch(() => null)
  return response
}
