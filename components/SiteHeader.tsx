'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { LogOut, UserRound } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type SessionState = {
  authenticated: boolean
  role: 'admin' | 'student' | null
  ready: boolean
}

export function SiteHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [session, setSession] = useState<SessionState>({ authenticated: false, role: null, ready: false })
  const [leaving, setLeaving] = useState(false)

  const internal = pathname === '/dashboard' || pathname.startsWith('/painel') || pathname.startsWith('/admin')

  useEffect(() => {
    let mounted = true

    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!mounted) return
      if (!user) {
        setSession({ authenticated: false, role: null, ready: true })
        return
      }

      let role: 'admin' | 'student' = 'student'
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
      if (String(profile?.role) === 'admin') role = 'admin'
      if (mounted) setSession({ authenticated: true, role, ready: true })
    }

    load()
    const { data: listener } = supabase.auth.onAuthStateChange((_event, authSession) => {
      if (!mounted) return
      if (!authSession?.user) setSession({ authenticated: false, role: null, ready: true })
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
    setSession({ authenticated: false, role: null, ready: true })
    router.push('/')
    router.refresh()
  }

  if (internal) return null

  const panelHref = session.role === 'admin' ? '/admin' : '/dashboard'

  return (
    <header className="topnav">
      <div className="nav-wrap">
        <Link className="brand" href="/">
          <span className="brand-bracket">[</span>FORTIFY<span>SEC</span>
          <span className="brand-bracket">]</span>
        </Link>
        <nav className="nav-links">
          <Link href="/academy">Academy</Link>
          <Link href="/labs">Labs</Link>
          <Link href="/ctf">CTF</Link>
          <Link href="/planos">Planos</Link>
          <Link href="/talentos">Talentos</Link>
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
