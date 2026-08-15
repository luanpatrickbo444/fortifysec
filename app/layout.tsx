import './globals.css'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { hasSupabasePublicConfig } from '@/lib/supabase/config'

export const metadata = {
  title: 'FortifySec — Learn. Hack. Prove.',
  description:
    'Academy, cyber labs, challenges, CTF e ranking técnico em uma única plataforma.',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let authenticated = false

  if (hasSupabasePublicConfig()) {
    try {
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      authenticated = Boolean(user)
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
              <Link href="/#academy">Academy</Link>
              <Link href="/#labs">Labs</Link>
              <Link href="/#ctf">CTF</Link>
              <Link href="/talentos">Talentos</Link>
              {authenticated ? (
                <Link className="nav-cta" href="/painel">
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
        {children}
      </body>
    </html>
  )
}
