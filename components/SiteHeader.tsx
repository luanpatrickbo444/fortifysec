'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

function isInternalPath(pathname: string) {
  return (
    pathname === '/dashboard' ||
    pathname === '/painel' ||
    pathname.startsWith('/painel/') ||
    pathname.startsWith('/curso/') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/empresa')
  )
}

/**
 * Public navigation only.
 *
 * Deliberately contains no authentication client or session observer.
 * Authentication is owned by server actions and protected areas.
 */
export function SiteHeader() {
  const pathname = usePathname()
  if (isInternalPath(pathname)) return null

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
          <Link href="/vagas">Vagas</Link>
          <Link href="/empresa/login">Empresas</Link>
          <Link className="nav-cta" href="/login">LOGIN</Link>
        </nav>
      </div>
    </header>
  )
}
