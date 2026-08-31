import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { hasSupabaseConfig } from '@/lib/supabase/config'

export async function requireUser() {
  if (!hasSupabaseConfig()) return { id: 'demo-user', email: 'demo@fortifysec.com.br', demo: true as const }
  const supabase = await createClient()
  const { data: { user } } = await supabase!.auth.getUser()
  if (!user) redirect('/acesso')
  return { id: user.id, email: user.email ?? '', demo: false as const }
}

function configuredAdminEmails() {
  return (process.env.FORTIFY_ADMIN_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
}

export async function requireAdmin() {
  const user = await requireUser()
  if (user.demo) return user

  const allowList = configuredAdminEmails()
  if (allowList.includes(user.email.toLowerCase())) {
    const admin = createAdminClient()
    if (admin) {
      await admin.from('cloud_profiles').upsert({ id: user.id, role: 'admin' }, { onConflict: 'id' })
    }
    return user
  }

  const supabase = await createClient()
  const { data } = await supabase!.from('cloud_profiles').select('role').eq('id', user.id).maybeSingle()
  if (data?.role !== 'admin') redirect('/painel')
  return user
}
