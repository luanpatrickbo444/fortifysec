'use client'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { useState } from 'react'

export default function LogoutButton({className='side-logout',label='ENCERRAR SESSÃO'}:{className?:string,label?:string}){
  const router=useRouter()
  const [pending,setPending]=useState(false)
  return <button className={className} disabled={pending} onClick={async()=>{
    if(pending)return
    setPending(true)
    await createClient().auth.signOut()
    router.push('/')
    router.refresh()
  }}><LogOut size={15}/>{pending?' SAINDO...':label}</button>
}
