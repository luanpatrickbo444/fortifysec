'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { LogOut, UserRound } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { hasSupabasePublicConfig } from '@/lib/supabase/config'

type SessionState = {
  authenticated: boolean
  role: 'admin' | 'student' | null
  company: boolean
  ready: boolean
}

export function SiteHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = useMemo(() => {
    if (!hasSupabasePublicConfig()) return null
    try {
      return createClient()
    } catch {
      return null
    }
  }, [])
  const [session, setSession] = useState<SessionState>({ authenticated: false, role: null, company: false, ready: false })
  const [leaving, setLeaving] = useState(false)

  const internal = pathname === '/dashboard' || pathname === '/painel' || pathname.startsWith('/painel/') || pathname.startsWith('/curso/') || pathname.startsWith('/admin') || pathname.startsWith('/empresa')

  useEffect(() => {
    let mounted = true

    if (!supabase) {
      setSession({ authenticated: false, role: null, company: false, ready: true })
      return () => { mounted = false }
    }

    // Capture the narrowed client so TypeScript can safely use it inside async closures.
    const client = supabase

    async function load() {
      try {
        const { data: { user } } = await client.auth.getUser()
        if (!mounted) return
        if (!user) {
          setSession({ authenticated: false, role: null, company: false, ready: true })
          return
        }

        let role: 'admin' | 'student' = 'student'
        const [{ data: profile }, { data: companyMember }] = await Promise.all([
          client.from('profiles').select('role').eq('id', user.id).maybeSingle(),
          client.from('company_members').select('company_id').eq('user_id', user.id).limit(1).maybeSingle(),
        ])
        if (String(profile?.role) === 'admin') role = 'admin'
        if (mounted) setSession({ authenticated: true, role, company: Boolean(companyMember), ready: true })
      } catch {
        if (mounted) setSession({ authenticated: false, role: null, company: false, ready: true })
      }
    }

    void load()
    const { data: listener } = client.auth.onAuthStateChange((_event, authSession) => {
      if (!mounted) return
      if (!authSession?.user) setSession({ authenticated: false, role: null, company: false, ready: true })
      else void load()
    })

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [supabase])

  async function signOut() {
    if (leaving) return
    setLeaving(true)
    if (supabase) await supabase.auth.signOut()
    setSession({ authenticated: false, role: null, company: false, ready: true })
    router.push('/')
    router.refresh()
  }

  if (internal) return null

  const panelHref = '/painel'

  return (
    <header className="topnav">
      <div className="nav-wrap">
        <Link className="brand" href="/">
          <span className="brand-bracket">[</span>FORTIFY<span>SEC</span>
          <span className="brand-bracket">]</span>
        </Link>
        <nav className="nav-links">
          <Link href="/academy">Academy</Link>
          {session.authenticated ? <a href="/painel/labs">Labs</a> : <Link href="/labs">Labs</Link>}
          {session.authenticated && <a href="/painel/desafios">Challenges</a>}
          {session.authenticated ? <a href="/painel/ctf">CTF</a> : <Link href="/ctf">CTF</Link>}
          <Link href="/planos">Planos</Link>
          <Link href="/talentos">Talentos</Link>
          <Link href="/vagas">Vagas</Link>
          {!session.authenticated && <Link href="/empresa/login">Empresas</Link>}
          {!session.ready ? (
            <span className="nav-session-loading">SESSÃO...</span>
          ) : session.authenticated ? (
            <>
              <Link className="nav-panel-link" href={panelHref}><UserRound size={14}/> PAINEL</Link>
              <button className="nav-logout" type="button" onClick={signOut} disabled={leaving}>
                <LogOut size={14}/>{leaving ? ' SAINDO...' : ' SAIR'}
              </button>
            </>
          ) : (
            <Link className="nav-cta" href="/login">LOGIN</Link>
          )}
        </nav>
      </div>
    </header>
  )
}
