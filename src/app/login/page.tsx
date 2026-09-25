
'use client'

import { useState } from 'react'

export default function LoginPage() {
  const [email,setEmail] = useState('')
  const [password,setPassword] = useState('')
  const [error,setError] = useState('')

  function handleLogin(e:any){
    e.preventDefault()

    const validEmail = 'aluno@fortifysec.com.br'
    const validPassword = 'Fortify@2026'

    if(email === validEmail && password === validPassword){
      window.location.href='https://classroom.google.com/u/1/c/ODY5ODYxNjA3NDA2'
      return
    }

    setError('Usuário ou senha inválidos')
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold">Fortify Academy</h1>
          <p className="mt-2 opacity-80">Área exclusiva para alunos</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            className="w-full rounded-xl p-3 bg-black/20 border border-white/10"
            placeholder="E-mail"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
          />

          <input
            type="password"
            className="w-full rounded-xl p-3 bg-black/20 border border-white/10"
            placeholder="Senha"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
          />

          {error && <p>{error}</p>}

          <button className="w-full rounded-xl p-3 font-semibold">
            Entrar
          </button>
        </form>
      </div>
    </main>
  )
}
