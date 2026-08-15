import { createClient } from '@supabase/supabase-js'
import { assertSupabaseServerConfig } from './config'

export function createAdminClient() {
  const { url, key } = assertSupabaseServerConfig()
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
