import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'

export async function POST(request: Request) {
  const { supabase } = await requireAdmin()
  const form = await request.formData()
  const eventId = String(form.get('event_id') || '').trim()
  const freezeRaw = String(form.get('freeze_at') || '').trim()
  const attempts = Math.max(3, Math.min(120, Math.trunc(Number(form.get('max_attempts_per_minute') || 10))))
  const url = new URL('/admin/range', request.url)

  if (!eventId) {
    url.searchParams.set('erro', 'CTF inválido.')
    return NextResponse.redirect(url, 303)
  }

  let freezeAt: string | null = null
  if (freezeRaw) {
    const date = new Date(freezeRaw)
    if (!Number.isFinite(date.getTime())) {
      url.searchParams.set('erro', 'Data de freeze inválida.')
      return NextResponse.redirect(url, 303)
    }
    freezeAt = date.toISOString()
  }

  const { error } = await supabase
    .from('ctf_events')
    .update({ freeze_at: freezeAt, max_attempts_per_minute: attempts })
    .eq('id', eventId)

  if (error) url.searchParams.set('erro', error.message)
  else url.searchParams.set('ctf', '1')
  return NextResponse.redirect(url, 303)
}
