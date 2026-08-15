import './globals.css'
import Link from 'next/link'
import { getPlatformSettings } from '@/lib/site-settings'

export const metadata = {
  title: 'FortifySec — Learn. Hack. Prove.',
  description:
    'Academy, cyber labs, challenges, CTF e ranking técnico em uma única plataforma.',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const platform = await getPlatformSettings()

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
              <Link className="nav-cta" href="/login">LOGIN</Link>
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
