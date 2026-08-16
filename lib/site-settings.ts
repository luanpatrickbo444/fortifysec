import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { getSupabasePublicKey, getSupabaseUrl } from '@/lib/supabase/config'

export type PlatformSettings = {
  announcement: string
  support_email: string
  academy_cta: string
  labs_cta: string
  ctf_prize_label: string
  maintenance_mode: boolean
}

export const DEFAULT_PLATFORM_SETTINGS: PlatformSettings = {
  announcement: '',
  support_email: 'contato@fortifysec.com.br',
  academy_cta: 'Explorar Academy',
  labs_cta: 'Abrir Cyber Range',
  ctf_prize_label: 'R$ 15.000',
  maintenance_mode: false,
}

/**
 * Reads public site settings without touching the authenticated server session.
 * Root/public layouts must never depend on requireUser()/redirect().
 */
export async function getPlatformSettings(): Promise<PlatformSettings> {
  const url = getSupabaseUrl()
  const key = getSupabasePublicKey()
  if (!url || !key) return DEFAULT_PLATFORM_SETTINGS

  try {
    const supabase = createSupabaseClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    })

    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'platform')
      .maybeSingle()

    if (error) return DEFAULT_PLATFORM_SETTINGS
    return {
      ...DEFAULT_PLATFORM_SETTINGS,
      ...((data?.value || {}) as Partial<PlatformSettings>),
    }
  } catch {
    return DEFAULT_PLATFORM_SETTINGS
  }
}
