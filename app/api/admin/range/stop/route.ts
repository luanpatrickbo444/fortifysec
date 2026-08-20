import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'

function back(request: Request, query: string) {
  return NextResponse.redirect(new URL(`/admin/range?${query}`, request.url), 303)
}

export async function POST(request: Request) {
  const { supabase, user } = await requireAdmin()
  const form = await request.formData()
  const rowId = String(form.get('session_id') || '').trim()
  if (!rowId) return back(request, 'erro=' + encodeURIComponent('Sessão inválida.'))

  const { data: session, error } = await supabase
    .from('lab_sessions')
    .select('id,user_id,lab_id,provider_session_id,status')
    .eq('id', rowId)
    .maybeSingle()

  if (error || !session) return back(request, 'erro=' + encodeURIComponent('Sessão não encontrada.'))

  const providerSessionId = String(session.provider_session_id || '')
  const provider = String(process.env.LAB_PROVIDER_API_URL || '').replace(/\/$/, '')
  if (provider && providerSessionId) {
    try {
      const response = await fetch(`${provider}/sessions/${encodeURIComponent(providerSessionId)}`, {
        method: 'DELETE',
        cache: 'no-store',
        headers: process.env.LAB_PROVIDER_API_KEY
          ? { Authorization: `Bearer ${process.env.LAB_PROVIDER_API_KEY}` }
          : {},
      })
      if (!response.ok && response.status !== 404) {
        return back(request, 'erro=' + encodeURIComponent(`Provider respondeu ${response.status}.`))
      }
    } catch (providerError) {
      console.error('[ADMIN_RANGE_STOP_PROVIDER]', providerError)
      return back(request, 'erro=' + encodeURIComponent('Não foi possível falar com o Range Provider.'))
    }
  }

  await supabase
    .from('lab_sessions')
    .update({ status: 'stopped', stopped_at: new Date().toISOString() })
    .eq('id', rowId)

  await supabase.from('range_audit_log').insert({
    event_type: 'admin_stop_session',
    user_id: session.user_id,
    lab_id: session.lab_id,
    provider_session_id: providerSessionId || null,
    details: { admin_user_id: user.id },
  }).then(() => undefined, () => undefined)

  return back(request, 'stopped=1')
}
