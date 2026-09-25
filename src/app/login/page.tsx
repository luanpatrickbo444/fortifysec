
'use client'
import { useState } from 'react'

export default function LoginPage(){
 const [email,setEmail]=useState('')
 const [password,setPassword]=useState('')
 const [error,setError]=useState('')

 const login=(e:any)=>{
  e.preventDefault()
  if(email==='aluno@fortifysec.com.br' && password==='Fortify@2026'){
    window.location.href='https://classroom.google.com/u/1/c/ODY5ODYxNjA3NDA2'
  } else setError('Credenciais inválidas')
 }

 return (
 <main className="min-h-screen hero-wash flex items-center justify-center px-6">
  <div className="absolute inset-0 opacity-30" style={{background:'radial-gradient(circle at 50% 20%, rgba(167,139,250,.25), transparent 40%)'}} />
  <div className="relative w-full max-w-lg rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-2xl p-8 shadow-2xl">
   <div className="text-center mb-8">
    <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10">🛡️</div>
    <h1 className="display text-5xl font-bold one-title mt-4">Fortify Academy</h1>
    <p className="text-muted mt-3">Acesse seus cursos, labs e certificações.</p>
   </div>

   <form onSubmit={login} className="space-y-5">
    <input className="w-full rounded-2xl border border-white/10 bg-black/20 p-4" placeholder="E-mail" value={email} onChange={e=>setEmail(e.target.value)} />
    <input type="password" className="w-full rounded-2xl border border-white/10 bg-black/20 p-4" placeholder="Senha" value={password} onChange={e=>setPassword(e.target.value)} />
    {error && <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm">{error}</div>}
    <button className="w-full rounded-2xl bg-gradient-to-r from-violet-500 to-cyan-400 p-4 font-bold text-black">
      Entrar na Plataforma
    </button>
   </form>
  </div>
 </main>)
}
