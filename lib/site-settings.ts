import { createClient } from '@/lib/supabase/server'
import { hasSupabasePublicConfig } from '@/lib/supabase/config'

export type PlatformSettings = {
  announcement: string
  support_email: string
  academy_cta: string
  labs_cta: string
  ctf_prize_label: string
  maintenance_mode: boolean
}

const defaults: PlatformSettings = {
  announcement: '',
  support_email: 'contato@fortifysec.com.br',
  academy_cta: 'Explorar Academy',
  labs_cta: 'Abrir Cyber Range',
  ctf_prize_label: 'R$ 15.000',
  maintenance_mode: false,
}

export async function getPlatformSettings(): Promise<PlatformSettings> {
  if (!hasSupabasePublicConfig()) return defaults
  try {
    const supabase = await createClient()
    const { data } = await supabase.from('site_settings').select('value').eq('key', 'platform').maybeSingle()
    return { ...defaults, ...((data?.value || {}) as Partial<PlatformSettings>) }
  } catch {
    return defaults
  }
}
