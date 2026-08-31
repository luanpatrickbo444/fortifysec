'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { hasSupabaseConfig } from '@/lib/supabase/config'
import { resolvePortalOrganization } from '@/lib/portal-org'

export async function loginAction(formData: FormData) {
  if (!hasSupabaseConfig()) redirect('/painel')
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')
  if (!email || !password) redirect('/acesso?error=campos')
  const supabase = await createClient()
  const { data, error } = await supabase!.auth.signInWithPassword({ email, password })
  if (error) redirect('/acesso?error=credenciais')
  const allowList = (process.env.FORTIFY_ADMIN_EMAILS ?? '').split(',').map((item) => item.trim().toLowerCase()).filter(Boolean)
  if (data.user && allowList.includes((data.user.email ?? '').toLowerCase())) redirect('/admin')
  if (data.user) {
    const { data: profile } = await supabase!.from('cloud_profiles').select('role').eq('id', data.user.id).maybeSingle()
    if (profile?.role === 'admin') redirect('/admin')
  }
  redirect('/painel')
}

export async function signupAction(formData: FormData) {
  if (!hasSupabaseConfig()) redirect('/painel/onboarding')
  const fullName = String(formData.get('full_name') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')
  const confirmPassword = String(formData.get('confirm_password') ?? '')
  if (!fullName || !email || password.length < 8) redirect('/cadastro?error=campos')
  if (password !== confirmPassword) redirect('/cadastro?error=senhas')

  const supabase = await createClient()
  const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.fortifysec.com.br'
  const { data, error } = await supabase!.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${site}/auth/callback?next=/painel/onboarding`,
    },
  })
  if (error) redirect('/cadastro?error=conta')
  if (data.session) redirect('/painel/onboarding')
  redirect('/acesso?created=1')
}

export async function logoutAction() {
  const supabase = await createClient()
  if (supabase) await supabase.auth.signOut()
  redirect('/')
}

export async function leadAction(formData: FormData) {
  const payload = {
    name: String(formData.get('name') ?? '').trim(),
    company: String(formData.get('company') ?? '').trim(),
    email: String(formData.get('email') ?? '').trim().toLowerCase(),
    phone: String(formData.get('phone') ?? '').trim(),
    employees: String(formData.get('employees') ?? '').trim(),
    data_volume: String(formData.get('data_volume') ?? '').trim(),
    message: String(formData.get('message') ?? '').trim(),
  }
  if (!payload.name || !payload.email || !payload.company) redirect('/contato?error=campos')
  const supabase = await createClient()
  if (supabase) {
    const { error } = await supabase.from('cloud_leads').insert(payload)
    if (error) redirect('/contato?error=envio')
  }
  redirect('/contato?ok=1')
}

export async function requestPasswordResetAction(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  if (!email) redirect('/recuperar-senha?error=email')
  const supabase = await createClient()
  if (!supabase) redirect('/recuperar-senha?ok=1')
  const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.fortifysec.com.br'
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${site}/auth/callback?next=/atualizar-senha` })
  if (error) redirect('/recuperar-senha?error=envio')
  redirect('/recuperar-senha?ok=1')
}

export async function updatePasswordAction(formData: FormData) {
  const password = String(formData.get('password') ?? '')
  if (password.length < 8) redirect('/atualizar-senha?error=senha')
  const supabase = await createClient()
  if (!supabase) redirect('/painel')
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/acesso')
  const { error } = await supabase.auth.updateUser({ password })
  if (error) redirect('/atualizar-senha?error=envio')
  redirect('/painel')
}

export async function saveOnboardingAction(formData: FormData) {
  const supabase = await createClient()
  if (!supabase) redirect('/painel/onboarding?submitted=1')
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/acesso')

  const payload = {
    user_id: user.id,
    organization_name: String(formData.get('organization_name') ?? '').trim(),
    legal_name: String(formData.get('legal_name') ?? '').trim() || null,
    cnpj: String(formData.get('cnpj') ?? '').trim() || null,
    contact_name: String(formData.get('contact_name') ?? '').trim(),
    contact_phone: String(formData.get('contact_phone') ?? '').trim() || null,
    plan: String(formData.get('plan') ?? 'Business'),
    employees: String(formData.get('employees') ?? '').trim() || null,
    data_volume: String(formData.get('data_volume') ?? '').trim() || null,
    infrastructure: String(formData.get('infrastructure') ?? '').trim() || null,
    current_backup: String(formData.get('current_backup') ?? '').trim() || null,
    critical_systems: String(formData.get('critical_systems') ?? '').trim() || null,
    rpo_target: String(formData.get('rpo_target') ?? '').trim() || null,
    rto_target: String(formData.get('rto_target') ?? '').trim() || null,
    notes: String(formData.get('notes') ?? '').trim() || null,
    status: 'submitted',
    admin_notes: null,
    updated_at: new Date().toISOString(),
  }

  if (!payload.organization_name || !payload.contact_name) redirect('/painel/onboarding?error=campos')
  if (!['Essencial', 'Business', 'Enterprise'].includes(payload.plan)) redirect('/painel/onboarding?error=plano')

  const { error } = await supabase.from('cloud_onboarding_requests').upsert(payload, { onConflict: 'user_id' })
  if (error) redirect('/painel/onboarding?error=envio')
  redirect('/painel/onboarding?submitted=1')
}

export async function ticketAction(formData: FormData) {
  const supabase = await createClient()
  if (!supabase) redirect('/painel/suporte?ok=1')
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/acesso')

  // Usa a mesma organização ativa escolhida no portal. Isso evita que um usuário
  // com acesso a várias empresas abra um chamado no tenant errado.
  const portal = await resolvePortalOrganization(supabase, user.id)
  if (!portal.org) redirect('/painel/onboarding')

  const subject = String(formData.get('subject') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()
  const priority = String(formData.get('priority') ?? 'normal')
  const category = String(formData.get('category') ?? 'support')
  if (!subject || !description) redirect('/painel/suporte?error=campos')
  if (!['normal', 'high', 'critical'].includes(priority)) redirect('/painel/suporte?error=prioridade')

  const { error } = await supabase.from('cloud_support_tickets').insert({
    organization_id: portal.org.id,
    opened_by: user.id,
    subject,
    priority,
    category,
    description,
    status: 'open',
    last_reply_at: new Date().toISOString(),
  })
  if (error) redirect('/painel/suporte?error=envio')
  redirect('/painel/suporte?ok=1')
}
