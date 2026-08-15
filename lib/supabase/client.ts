import { createBrowserClient } from '@supabase/ssr'
import { assertSupabasePublicConfig } from './config'

export function createClient() {
  const { url, key } = assertSupabasePublicConfig()
  return createBrowserClient(url, key)
}
