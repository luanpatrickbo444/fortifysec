import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/login', request.url), 303)

  const form = await request.formData()
  const courseId = String(form.get('course_id') || '')
  const admin = createAdminClient()

  const [{ data: course }, { data: profile }, { data: existing }] = await Promise.all([
    admin.from('courses').select('id,title,slug,price_cents,published,billing_type').eq('id', courseId).eq('published', true).maybeSingle(),
    admin.from('profiles').select('name,email,blocked').eq('id', user.id).single(),
    admin.from('enrollments').select('id,status').eq('user_id', user.id).eq('course_id', courseId).maybeSingle(),
  ])

  if (!course || profile?.blocked) return NextResponse.redirect(new URL('/painel/cursos?erro=acesso', request.url), 303)
  if (existing?.status === 'active') return NextResponse.redirect(new URL('/painel/cursos', request.url), 303)

  const amountCents = course.slug === 'formacao-fortifysec' ? 9990 : Number(course.price_cents || 0)
  if (amountCents <= 0) return NextResponse.redirect(new URL('/painel/cursos?erro=preco', request.url), 303)

  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN
  if (!token) return NextResponse.json({ error: 'MERCADO_PAGO_ACCESS_TOKEN não configurado' }, { status: 500 })

  const site = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin
  const externalReference = `${user.id}:${course.id}`
  const payerEmail = profile?.email || user.email

  // Assinatura mensal recorrente (ex: Formação FortifySec R$ 99,90/mês)
  if (course.billing_type === 'subscription') {
    const mp = await fetch('https://api.mercadopago.com/preapproval', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reason: course.title,
        external_reference: externalReference,
        payer_email: payerEmail,
        back_url: `${site}/painel/cursos?assinatura=sucesso`,
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          transaction_amount: amountCents / 100,
          currency_id: 'BRL',
        },
      }),
    })

    if (!mp.ok) return NextResponse.json({ error: 'Falha ao criar assinatura', details: await mp.text() }, { status: 502 })
    const pref = await mp.json()

    await admin.from('subscriptions').upsert({
      user_id: user.id,
      course_id: course.id,
      provider: 'mercadopago',
      preapproval_id: pref.id,
      external_reference: externalReference,
      status: String(pref.status || 'pending'),
      amount_cents: amountCents,
      next_payment_date: pref.next_payment_date || null,
      raw: pref,
    }, { onConflict: 'user_id,course_id' })

    await admin.from('enrollments').upsert(
      { user_id: user.id, course_id: course.id, status: 'pending', source: 'payment' },
      { onConflict: 'user_id,course_id' }
    )

    return NextResponse.redirect(pref.init_point, 303)
  }

  // Pagamento único (cursos avulsos que não são assinatura)
  const mp = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: [{ id: course.id, title: course.title, quantity: 1, currency_id: 'BRL', unit_price: amountCents / 100 }],
      payer: { email: payerEmail },
      external_reference: externalReference,
      back_urls: {
        success: `${site}/painel/cursos?pagamento=sucesso`,
        pending: `${site}/painel/cursos?pagamento=pendente`,
        failure: `${site}/painel/cursos?pagamento=falhou`,
      },
      auto_return: 'approved',
      notification_url: `${site}/api/webhooks/mercadopago`,
    }),
  })

  if (!mp.ok) return NextResponse.json({ error: 'Falha ao criar pagamento', details: await mp.text() }, { status: 502 })
  const pref = await mp.json()

  await admin.from('payments').insert({ user_id: user.id, course_id: course.id, provider: 'mercadopago', preference_id: pref.id, status: 'pending', amount_cents: amountCents, external_reference: externalReference })
  await admin.from('enrollments').upsert({ user_id: user.id, course_id: course.id, status: 'pending', source: 'payment' }, { onConflict: 'user_id,course_id' })

  return NextResponse.redirect(pref.init_point, 303)
}
