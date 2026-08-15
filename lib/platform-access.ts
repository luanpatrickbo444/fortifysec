import { createAdminClient } from '@/lib/supabase/admin'

export async function getPlatformAccess(userId: string) {
  const admin = createAdminClient()

  const [{ data: profile }, { data: enrollment }] = await Promise.all([
    admin
      .from('profiles')
      .select('role,blocked')
      .eq('id', userId)
      .maybeSingle(),
    admin
      .from('enrollments')
      .select('id,course_id,status')
      .eq('user_id', userId)
      .eq('status', 'active')
      .limit(1)
      .maybeSingle(),
  ])

  const isAdmin = String(profile?.role || '') === 'admin'
  const blocked = Boolean(profile?.blocked)

  return {
    isAdmin,
    blocked,
    enrollment: enrollment || null,
    hasActiveEnrollment: !blocked && Boolean(enrollment),
    canAccessCyberRange: !blocked && (isAdmin || Boolean(enrollment)),
  }
}
