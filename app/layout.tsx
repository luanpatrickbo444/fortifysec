import './globals.css'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { hasSupabasePublicConfig } from '@/lib/supabase/config'
import { getPlatformSettings } from '@/lib/site-settings'

export const metadata = {
  title: 'FortifySec — Learn. Hack. Prove.',
  description:
    'Academy, cyber labs, challenges, CTF e ranking técnico em uma única plataforma.',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let authenticated = false
  let authenticatedDestination = '/dashboard'
  const platform = await getPlatformSettings()

  if (hasSupabasePublicConfig()) {
    try {
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      authenticated = Boolean(user)
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('role,blocked').eq('id', user.id).maybeSingle()
        authenticatedDestination = profile?.blocked ? '/bloqueado' : profile?.role === 'admin' ? '/admin' : '/dashboard'
      }
    } catch (error) {
      console.error('[FortifySec] Supabase auth check failed in root layout:', error)
    }
  }

  return (
    <html lang="pt-BR">
      <body>
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
              {authenticated ? (
                <Link className="nav-cta" href={authenticatedDestination}>
                  ENTRAR NO RANGE
                </Link>
              ) : (
                <Link className="nav-cta" href="/login">
                  LOGIN
                </Link>
              )}
            </nav>
          </div>
        </header>
        {platform.announcement && <div className="announcement-bar"><span>FORTIFYSEC // NOTICE</span>{platform.announcement}</div>}
        {platform.maintenance_mode && <div className="maintenance-bar">PLATAFORMA EM MANUTENÇÃO PROGRAMADA</div>}
        {children}
      </body>
    </html>
  )
}
