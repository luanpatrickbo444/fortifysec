import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'

export async function POST(request: Request) {
  const { supabase } = await requireAdmin()
  const form = await request.formData()
  const challengeId = String(form.get('challenge_id') || '').trim()
  const enabled = String(form.get('enabled') || 'false') === 'true'
  const url = new URL('/admin/range', request.url)

  if (!challengeId) {
    url.searchParams.set('erro', 'Challenge inválido.')
    return NextResponse.redirect(url, 303)
  }

  const { error } = await supabase
    .from('challenges')
    .update({ dynamic_flag_enabled: enabled })
    .eq('id', challengeId)

  if (error) url.searchParams.set('erro', error.message)
  else url.searchParams.set('flag', '1')
  return NextResponse.redirect(url, 303)
}
