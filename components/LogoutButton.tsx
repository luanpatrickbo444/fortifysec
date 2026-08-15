'use client'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
export default function LogoutButton(){const router=useRouter();return <button className="btn secondary" onClick={async()=>{await createClient().auth.signOut();router.push('/login');router.refresh()}}>Sair</button>}
