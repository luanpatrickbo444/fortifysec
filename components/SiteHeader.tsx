'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { LogOut, UserRound } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { StudentPanelSidebarGuard } from '@/components/StudentPanelSidebarGuard'

type SessionState = {
  authenticated: boolean
  role: 'admin' | 'student' | null
  company: boolean
  ready: boolean
}

export function SiteHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [session, setSession] = useState<SessionState>({
    authenticated: false,
    role: null,
    company: false,
    ready: false,
  })
  const [leaving, setLeaving] = useState(false)

  const studentPanel =
    pathname === '/painel' || pathname.startsWith('/painel/')
  const adminArea = pathname.startsWith('/admin')
  const companyArea = pathname.startsWith('/empresa')

  useEffect(() => {
    let mounted = true

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!mounted) return
      if (!user) {
        setSession({
          authenticated: false,
          role: null,
          company: false,
          ready: true,
        })
        return
      }

      let role: 'admin' | 'student' = 'student'
      const [{ data: profile }, { data: companyMember }] = await Promise.all([
        supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle(),
        supabase
          .from('company_members')
          .select('company_id')
          .eq('user_id', user.id)
          .limit(1)
          .maybeSingle(),
      ])

      if (String(profile?.role) === 'admin') role = 'admin'
      if (mounted) {
        setSession({
          authenticated: true,
          role,
          company: Boolean(companyMember),
          ready: true,
        })
      }
    }

    load()
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, authSession) => {
        if (!mounted) return
        if (!authSession?.user) {
          setSession({
            authenticated: false,
            role: null,
            company: false,
            ready: true,
          })
        } else {
          load()
        }
      },
    )

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [supabase])

  async function signOut() {
    if (leaving) return
    setLeaving(true)
    await supabase.auth.signOut()
    setSession({
      authenticated: false,
      role: null,
      company: false,
      ready: true,
    })
    router.push('/')
    router.refresh()
  }

  // /painel/* must always have one student sidebar.
  // The guard stays invisible when DashboardShell already rendered one.
  if (studentPanel) return <StudentPanelSidebarGuard />

  // Preserve current internal behavior for admin and company areas.
  if (adminArea || companyArea) return null

  const panelHref =
    session.role === 'admin'
      ? '/admin'
      : session.company
        ? '/empresa'
        : '/painel'

  return (
    <header className="topnav">
      <div className="nav-wrap">
        <Link className="brand" href="/">
          <span className="brand-bracket">[</span>FORTIFY<span>SEC</span>
          <span className="brand-bracket">]</span>
        </Link>

        <nav className="nav-links">
          <Link href="/academy">Academy</Link>
          <Link href={session.authenticated ? '/painel/labs' : '/labs'}>
            Labs
          </Link>
          {session.authenticated && (
            <Link href="/painel/desafios">Challenges</Link>
          )}
          <Link href={session.authenticated ? '/painel/ctf' : '/ctf'}>
            CTF
          </Link>
          <Link href="/planos">Planos</Link>
          <Link href="/talentos">Talentos</Link>
          <Link href="/vagas">Vagas</Link>
          {!session.authenticated && (
            <Link href="/empresa/login">Empresas</Link>
          )}

          {!session.ready ? (
            <span className="nav-session-loading">SESSÃO...</span>
          ) : session.authenticated ? (
            <>
              <Link className="nav-panel-link" href={panelHref}>
                <UserRound size={14} /> PAINEL
              </Link>
              <button
                className="nav-logout"
                type="button"
                onClick={signOut}
                disabled={leaving}
              >
                <LogOut size={14} />
                {leaving ? ' SAINDO...' : ' SAIR'}
              </button>
            </>
          ) : (
            <Link className="nav-cta" href="/login">
              LOGIN
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
