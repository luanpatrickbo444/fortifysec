import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

function companyLoginUrl(request: Request, message: string) {
  const url = new URL('/empresa/login', request.url)
  url.searchParams.set('erro', message)
  return url
}

export async function POST(request: Request) {
  const formData = await request.formData()
  const email = String(formData.get('email') || '').trim().toLowerCase()
  const password = String(formData.get('password') || '')

  if (!email || !password) {
    return NextResponse.redirect(companyLoginUrl(request, 'Informe e-mail e senha.'), 303)
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error || !data.user) {
    return NextResponse.redirect(companyLoginUrl(request, 'Credenciais inválidas.'), 303)
  }

  let admin
  try {
    admin = createAdminClient()
  } catch {
    await supabase.auth.signOut()
    return NextResponse.redirect(
      companyLoginUrl(request, 'Configuração empresarial do servidor ausente.'),
      303,
    )
  }

  const { data: member, error: memberError } = await admin
    .from('company_members')
    .select('company_id,companies(id,active)')
    .eq('user_id', data.user.id)
    .limit(1)
    .maybeSingle()

  const company = Array.isArray((member as any)?.companies)
    ? (member as any).companies[0]
    : (member as any)?.companies

  if (memberError || !member || !company?.active) {
    await supabase.auth.signOut()
    return NextResponse.redirect(
      companyLoginUrl(request, 'Conta sem empresa ativa vinculada.'),
      303,
    )
  }

  // Normal HTTP redirect: forces a fresh document request instead of reusing
  // a possibly stale App Router tree from a tab opened before the latest deploy.
  return NextResponse.redirect(new URL('/empresa', request.url), 303)
}
