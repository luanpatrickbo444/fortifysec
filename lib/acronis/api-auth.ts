import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

function configuredAdminEmails() {
  return (process.env.FORTIFY_ADMIN_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
}

export async function isFortifyAdminRequest(request?: Request) {
  const ingest = request?.headers.get('x-fortify-ingest-secret')
  if (ingest && process.env.FORTIFY_INGEST_SECRET && ingest === process.env.FORTIFY_INGEST_SECRET) return true

  const supabase = await createClient()
  if (!supabase) return false
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  if (user.email && configuredAdminEmails().includes(user.email.toLowerCase())) return true

  const admin = createAdminClient()
  if (!admin) return false
  const { data } = await admin.from('cloud_profiles').select('role').eq('id', user.id).maybeSingle()
  return data?.role === 'admin'
}
