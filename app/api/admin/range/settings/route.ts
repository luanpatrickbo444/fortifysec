import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'

export async function POST(request: Request) {
  const { supabase } = await requireAdmin()
  const form = await request.formData()
  const code = String(form.get('code') || '').trim()
  const maxConcurrent = Number(form.get('max_concurrent_sessions') || 1)
  const maxTtl = Number(form.get('max_ttl_minutes') || 60)
  const monthly = Number(form.get('monthly_minutes') || 0)

  const url = new URL('/admin/range', request.url)
  if (!code || !Number.isFinite(maxConcurrent) || !Number.isFinite(maxTtl) || !Number.isFinite(monthly)) {
    url.searchParams.set('erro', 'Configuração de plano inválida.')
    return NextResponse.redirect(url, 303)
  }

  const { error } = await supabase.from('range_plan_limits').upsert({
    code,
    max_concurrent_sessions: Math.max(0, Math.min(50, Math.trunc(maxConcurrent))),
    max_ttl_minutes: Math.max(15, Math.min(720, Math.trunc(maxTtl))),
    monthly_minutes: Math.max(0, Math.trunc(monthly)),
    updated_at: new Date().toISOString(),
  }, { onConflict: 'code' })

  if (error) url.searchParams.set('erro', error.message)
  else url.searchParams.set('salvo', '1')
  return NextResponse.redirect(url, 303)
}
