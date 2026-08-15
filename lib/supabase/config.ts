export function getSupabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || ''
}

export function getSupabasePublicKey() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    ''
  )
}

export function getSupabaseServerKey() {
  return (
    process.env.SUPABASE_SECRET_KEY?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    ''
  )
}

export function hasSupabasePublicConfig() {
  return Boolean(getSupabaseUrl() && getSupabasePublicKey())
}

export function assertSupabasePublicConfig() {
  const url = getSupabaseUrl()
  const key = getSupabasePublicKey()
  if (!url || !key) {
    throw new Error(
      'Supabase public config missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or legacy NEXT_PUBLIC_SUPABASE_ANON_KEY) in Vercel.'
    )
  }
  return { url, key }
}

export function assertSupabaseServerConfig() {
  const url = getSupabaseUrl()
  const key = getSupabaseServerKey()
  if (!url || !key) {
    throw new Error(
      'Supabase server config missing. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY (or legacy SUPABASE_SERVICE_ROLE_KEY) in Vercel.'
    )
  }
  return { url, key }
}
