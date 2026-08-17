'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { LogOut, UserRound } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type SessionState = {
  authenticated: boolean
  role: 'admin' | 'student' | null
  company: boolean
  ready: boolean
}

export function SiteHeader() {
  const pathname = usePathname()
  const supabase = useMemo(() => createClient(), [])
  const [session, setSession] = useState<SessionState>({ authenticated: false, role: null, company: false, ready: false })
  const [leaving, setLeaving] = useState(false)

  const internal = pathname === '/dashboard' || pathname === '/painel' || pathname.startsWith('/painel/') || pathname.startsWith('/curso/') || pathname.startsWith('/admin') || pathname.startsWith('/empresa')

  useEffect(() => {
    let mounted = true

    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!mounted) return
      if (!user) {
        setSession({ authenticated: false, role: null, company: false, ready: true })
        return
      }

      let role: 'admin' | 'student' = 'student'
      const [{ data: profile }, { data: companyMember }] = await Promise.all([
        supabase.from('profiles').select('role').eq('id', user.id).maybeSingle(),
        supabase.from('company_members').select('company_id').eq('user_id', user.id).limit(1).maybeSingle(),
      ])
      if (String(profile?.role) === 'admin') role = 'admin'
      if (mounted) setSession({ authenticated: true, role, company: Boolean(companyMember), ready: true })
    }

    load()
    const { data: listener } = supabase.auth.onAuthStateChange((_event, authSession) => {
      if (!mounted) return
      if (!authSession?.user) setSession({ authenticated: false, role: null, company: false, ready: true })
      else load()
    })

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [supabase])

  async function signOut() {
    if (leaving) return
    setLeaving(true)
    await supabase.auth.signOut()
    setSession({ authenticated: false, role: null, company: false, ready: true })
    window.location.assign('/')
  }

  if (internal) return null

  const panelHref = session.role === 'admin' ? '/admin' : session.company ? '/empresa' : '/painel'

  return (
    <header className="topnav">
      <div className="nav-wrap">
        <a className="brand" href="/">
          <span className="brand-bracket">[</span>FORTIFY<span>SEC</span>
          <span className="brand-bracket">]</span>
        </a>
        <nav className="nav-links">
          <a href="/academy">Academy</a>
          <a href={session.authenticated ? '/painel/labs' : '/labs'}>Labs</a>
          {session.authenticated && <a href="/painel/desafios">Challenges</a>}
          <a href={session.authenticated ? '/painel/ctf' : '/ctf'}>CTF</a>
          <a href="/planos">Planos</a>
          <a href="/talentos">Talentos</a>
          <a href="/vagas">Vagas</a>
          {!session.authenticated && <a href="/empresa/login">Empresas</a>}
          {!session.ready ? (
            <span className="nav-session-loading">SESSÃO...</span>
          ) : session.authenticated ? (
            <>
              <a className="nav-panel-link" href={panelHref}><UserRound size={14}/> PAINEL</a>
              <button className="nav-logout" type="button" onClick={signOut} disabled={leaving}>
                <LogOut size={14}/>{leaving ? ' SAINDO...' : ' SAIR'}
              </button>
            </>
          ) : (
            <a className="nav-cta" href="/login">LOGIN</a>
          )}
        </nav>
      </div>
    </header>
  )
}
