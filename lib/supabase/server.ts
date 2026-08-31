import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { hasSupabaseConfig } from './config'

export async function createClient() {
  if (!hasSupabaseConfig()) return null
  const store = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return store.getAll() },
        setAll(items: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
          try { items.forEach(({ name, value, options }) => store.set(name, value, options)) } catch {}
        },
      },
    },
  )
}
