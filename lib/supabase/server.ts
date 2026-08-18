import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { assertSupabasePublicConfig } from './config'

/**
 * Server client compatible with @supabase/ssr 0.7.x.
 *
 * IMPORTANT:
 * - no auth redirect lives here;
 * - Server Components may be unable to mutate cookies, so refresh writes are
 *   best-effort and Proxy handles refresh on protected requests;
 * - Server Actions can mutate cookies normally (login/register/logout flows).
 */
export async function createClient() {
  const { url, key } = assertSupabasePublicConfig()
  const cookieStore = await cookies()

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Expected from read-only Server Component renders.
          // Protected Proxy requests perform session refresh separately.
        }
      },
    },
  })
}
