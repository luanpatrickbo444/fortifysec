import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'

export async function POST(request: Request) {
  const { supabase } = await requireAdmin()
  const form = await request.formData()
  const challengeId = String(form.get('challenge_id') || '').trim()
  const skillCode = String(form.get('skill_code') || '').trim()
  const weight = Math.max(1, Math.min(10, Math.trunc(Number(form.get('weight') || 1))))
  const url = new URL('/admin/range', request.url)

  if (!challengeId || !skillCode) {
    url.searchParams.set('erro', 'Challenge e Skill são obrigatórios.')
    return NextResponse.redirect(url, 303)
  }

  const { error } = await supabase.from('challenge_skills').upsert({
    challenge_id: challengeId,
    skill_code: skillCode,
    weight,
  }, { onConflict: 'challenge_id,skill_code' })

  if (error) url.searchParams.set('erro', error.message)
  else url.searchParams.set('skill', '1')
  return NextResponse.redirect(url, 303)
}
