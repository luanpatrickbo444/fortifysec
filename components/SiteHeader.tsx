'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'

export function SiteHeader() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  if (pathname.startsWith('/painel') || pathname.startsWith('/admin') || ['/acesso', '/cadastro', '/recuperar-senha', '/atualizar-senha'].includes(pathname)) return null
  const close = () => setOpen(false)
  return <header className="topnav enterprise-public-nav"><div className="nav-wrap">
    <Link className="public-brand" href="/" onClick={close} aria-label="Fortify Cloud">
      <span className="public-brand-mark">F</span>
      <span className="public-brand-copy"><b>Fortify Cloud</b><small>Managed Data Protection</small></span>
    </Link>
    <button className="mobile-menu" onClick={() => setOpen(!open)} aria-label="Abrir menu">{open ? <X/> : <Menu/>}</button>
    <nav className={`nav-links ${open ? 'open' : ''}`}>
      <Link href="/solucoes" onClick={close}>Soluções</Link>
      <Link href="/como-funciona" onClick={close}>Como funciona</Link>
      <Link href="/planos" onClick={close}>Planos</Link>
      <Link href="/contato" onClick={close}>Contato</Link>
      <span className="language-switch"><Link href="/" onClick={close}>PT</Link><i/> <Link href="/en" onClick={close}>EN</Link></span>
      <Link className="nav-login" href="/acesso" onClick={close}>Portal</Link>
      <Link className="nav-cta" href="/cadastro" onClick={close}>Avaliação 30 dias</Link>
    </nav>
  </div></header>
}
