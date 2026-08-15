import { createClient } from '@/lib/supabase/server'

export async function getPlatformAccess(userId: string) {
  const supabase = await createClient()

  const [{ data: profile, error: profileError }, { data: enrollment, error: enrollmentError }] = await Promise.all([
    supabase
      .from('profiles')
      .select('role,blocked')
      .eq('id', userId)
      .maybeSingle(),
    supabase
      .from('enrollments')
      .select('id,course_id,status')
      .eq('user_id', userId)
      .eq('status', 'active')
      .limit(1)
      .maybeSingle(),
  ])

  if (profileError) console.error('[platform-access:profile]', profileError)
  if (enrollmentError) console.error('[platform-access:enrollment]', enrollmentError)

  const isAdmin = String(profile?.role || '') === 'admin'
  const blocked = Boolean(profile?.blocked)

  return {
    isAdmin,
    blocked,
    enrollment: enrollment || null,
    hasActiveEnrollment: !blocked && Boolean(enrollment),
    canAccessCyberRange: !blocked && (isAdmin || Boolean(enrollment)),
    error: profileError || enrollmentError || null,
  }
}
