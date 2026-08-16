import { NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'

function verifySignature(req: Request, dataId: string) {
  const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET
  if (!secret) return false
  const xSignature = req.headers.get('x-signature') || ''
  const xRequestId = req.headers.get('x-request-id') || ''
  const parts = Object.fromEntries(xSignature.split(',').map(x => x.trim().split('=')))
  const ts = parts.ts; const v1 = parts.v1
  if (!ts || !v1) return false
  const manifest = `${dataId ? `id:${dataId.toLowerCase()};` : ''}${xRequestId ? `request-id:${xRequestId};` : ''}ts:${ts};`
  const expected = createHmac('sha256', secret).update(manifest).digest('hex')
  try { return timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(v1, 'hex')) } catch { return false }
}

// status do preapproval na Mercado Pago -> status da matrícula no FortifySec
function enrollmentStatusFor(preapprovalStatus: string) {
  if (preapprovalStatus === 'authorized') return 'active'
  if (preapprovalStatus === 'paused' || preapprovalStatus === 'cancelled') return 'expired'
  return 'pending'
}

// Busca o preapproval atualizado na Mercado Pago e sincroniza subscriptions + enrollments.
// Usado tanto quando a própria assinatura muda de status quanto quando uma cobrança recorrente é processada.
async function syncPreapproval(admin: ReturnType<typeof createAdminClient>, token: string, preapprovalId: string, lastPaymentStatus?: string) {
  const res = await fetch(`https://api.mercadopago.com/preapproval/${encodeURIComponent(preapprovalId)}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })
  if (!res.ok) return false
  const preapproval = await res.json()
  const external = String(preapproval.external_reference || '')
  const [userId, courseId] = external.split(':')
  if (!userId || !courseId) return false

  const status = String(preapproval.status || 'pending')

  await admin.from('subscriptions').upsert({
    user_id: userId,
    course_id: courseId,
    provider: 'mercadopago',
    preapproval_id: preapprovalId,
    external_reference: external,
    status,
    amount_cents: Math.round(Number(preapproval.auto_recurring?.transaction_amount || 0) * 100),
    next_payment_date: preapproval.next_payment_date || null,
    last_payment_status: lastPaymentStatus ?? undefined,
    raw: preapproval,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id,course_id' })

  await admin.from('enrollments').upsert({
    user_id: userId,
    course_id: courseId,
    status: enrollmentStatusFor(status),
    source: 'payment',
    activated_at: status === 'authorized' ? new Date().toISOString() : null,
  }, { onConflict: 'user_id,course_id' })

  return true
}

export async function POST(request: Request) {
  const url = new URL(request.url)
  const body = await request.json().catch(() => ({}))
  const dataId = String(body?.data?.id || url.searchParams.get('data.id') || '')
  const type = String(body?.type || url.searchParams.get('type') || '')

  if (!dataId) return NextResponse.json({ ok: true })
  if (!process.env.MERCADO_PAGO_WEBHOOK_SECRET) return NextResponse.json({ error: 'webhook secret not configured' }, { status: 503 })
  if (!verifySignature(request, dataId)) return NextResponse.json({ error: 'invalid signature' }, { status: 401 })

  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN
  if (!token) return NextResponse.json({ error: 'not configured' }, { status: 500 })

  const admin = createAdminClient()

  // Assinatura criada, pausada, cancelada ou reativada.
  if (type === 'subscription_preapproval') {
    const ok = await syncPreapproval(admin, token, dataId)
    return NextResponse.json({ ok })
  }

  // Uma cobrança recorrente (mensalidade) foi processada — aprovada ou recusada.
  if (type === 'subscription_authorized_payment') {
    const res = await fetch(`https://api.mercadopago.com/authorized_payments/${encodeURIComponent(dataId)}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    if (!res.ok) return NextResponse.json({ error: 'authorized payment lookup failed' }, { status: 502 })
    const authorizedPayment = await res.json()
    const preapprovalId = String(authorizedPayment.preapproval_id || '')
    if (!preapprovalId) return NextResponse.json({ ok: true })
    const ok = await syncPreapproval(admin, token, preapprovalId, String(authorizedPayment.payment?.status || authorizedPayment.status || ''))
    return NextResponse.json({ ok })
  }

  // Pagamento único (cursos que não são assinatura).
  if (type && type !== 'payment') return NextResponse.json({ ok: true })

  const paymentRes = await fetch(`https://api.mercadopago.com/v1/payments/${encodeURIComponent(dataId)}`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' })
  if (!paymentRes.ok) return NextResponse.json({ error: 'payment lookup failed' }, { status: 502 })
  const payment = await paymentRes.json()
  const external = String(payment.external_reference || '')
  const [userId, courseId] = external.split(':')
  if (!userId || !courseId) return NextResponse.json({ ok: true })

  const { data: paymentRow } = await admin.from('payments').select('id,user_id,course_id,amount_cents,status').eq('external_reference', external).order('created_at', { ascending: false }).limit(1).maybeSingle()
  if (!paymentRow || paymentRow.user_id !== userId || paymentRow.course_id !== courseId) return NextResponse.json({ error: 'unknown payment reference' }, { status: 400 })

  const amountCents = Math.round(Number(payment.transaction_amount || 0) * 100)
  const amountMatches = amountCents === paymentRow.amount_cents && String(payment.currency_id || '') === 'BRL'
  const approved = payment.status === 'approved' && amountMatches

  await admin.from('payments').update({ payment_id: String(payment.id), status: approved ? 'approved' : String(payment.status || 'rejected'), raw: payment, updated_at: new Date().toISOString() }).eq('id', paymentRow.id)
  await admin.from('enrollments').upsert({ user_id: userId, course_id: courseId, status: approved ? 'active' : 'pending', source: 'payment', activated_at: approved ? new Date().toISOString() : null }, { onConflict: 'user_id,course_id' })

  return NextResponse.json({ ok: true, approved })
}
