'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function leadEnglishAction(formData: FormData) {
  const payload = {
    name: String(formData.get('name') ?? '').trim(),
    company: String(formData.get('company') ?? '').trim(),
    email: String(formData.get('email') ?? '').trim().toLowerCase(),
    phone: String(formData.get('phone') ?? '').trim(),
    employees: String(formData.get('employees') ?? '').trim(),
    data_volume: String(formData.get('data_volume') ?? '').trim(),
    message: String(formData.get('message') ?? '').trim(),
  }

  if (!payload.name || !payload.email || !payload.company) redirect('/en/contact?error=fields')
  const supabase = await createClient()
  if (supabase) {
    const { error } = await supabase.from('cloud_leads').insert(payload)
    if (error) redirect('/en/contact?error=send')
  }
  redirect('/en/contact?ok=1')
}
