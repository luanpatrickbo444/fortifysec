import { createAdminClient } from '@/lib/supabase/admin'

type AuthUserLike = {
  id: string
  email?: string | null
  user_metadata?: Record<string, unknown>
}

export type ApplicationProfile = {
  id: string
  name: string | null
  email: string | null
  role: string | null
  blocked: boolean | null
  xp?: number | null
  headline?: string | null
}

export async function ensureApplicationProfile(authUser: AuthUserLike): Promise<ApplicationProfile | null> {
  const email = String(authUser.email || '').trim().toLowerCase()
  const metadataName = String(authUser.user_metadata?.name || authUser.user_metadata?.full_name || '').trim()
  const fallbackName = metadataName || (email ? email.split('@')[0] : 'Aluno')

  try {
    const admin = createAdminClient()
    const { data: existing } = await admin
      .from('profiles')
      .select('id,name,email,role,blocked,xp,headline')
      .eq('id', authUser.id)
      .maybeSingle()

    if (existing) {
      const patch: Record<string, unknown> = {}
      if (!existing.name) patch.name = fallbackName
      if (!existing.email && email) patch.email = email
      if (Object.keys(patch).length) {
        await admin.from('profiles').update(patch).eq('id', authUser.id)
      }
      return { ...existing, ...patch } as ApplicationProfile
    }

    const { data: created, error } = await admin
      .from('profiles')
      .insert({
        id: authUser.id,
        name: fallbackName,
        email,
        role: 'student',
        blocked: false,
        xp: 0,
      })
      .select('id,name,email,role,blocked,xp,headline')
      .maybeSingle()

    if (error) {
      console.error('[auth:profile-create]', error)
      return null
    }
    return created as ApplicationProfile | null
  } catch (error) {
    console.error('[auth:profile-sync]', error)
    return null
  }
}
