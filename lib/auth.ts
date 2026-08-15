import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function requireUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: accessProfile } = await supabase.from('profiles').select('blocked').eq('id', user.id).maybeSingle()
  if (accessProfile?.blocked) redirect('/bloqueado')
  return { supabase, user }
}

export async function requireAdmin() {
  const { supabase, user } = await requireUser()
  const { data: profile } = await supabase.from('profiles').select('role,name').eq('id', user.id).single()
  if (!profile || profile.role !== 'admin') redirect('/dashboard')
  return { supabase, user, profile }
}

export async function hasActiveEnrollment(courseId: string) {
  const { supabase, user } = await requireUser()
  const { data } = await supabase
    .from('enrollments')
    .select('id,status')
    .eq('user_id', user.id)
    .eq('course_id', courseId)
    .eq('status', 'active')
    .maybeSingle()
  return !!data
}
