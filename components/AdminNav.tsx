'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Activity,
  BellRing,
  Building2,
  FileBarChart,
  Gauge,
  Headphones,
  Network,
  RadioTower,
  ScanSearch,
  UsersRound,
} from 'lucide-react'

const sections = [
  {
    label: 'OPERAÇÃO',
    items: [
      ['/admin', Gauge, 'Visão operacional'],
      ['/admin/clientes', Building2, 'Clientes'],
      ['/admin/alertas', BellRing, 'Alertas'],
      ['/admin/chamados', Headphones, 'Service desk'],
    ],
  },
  {
    label: 'GESTÃO',
    items: [
      ['/admin/onboarding', ScanSearch, 'Onboarding'],
      ['/admin/relatorios', FileBarChart, 'Relatórios'],
      ['/admin/leads', UsersRound, 'Leads'],
    ],
  },
  {
    label: 'PLATAFORMA',
    items: [
      ['/admin/eventos', Activity, 'Eventos'],
      ['/admin/integracoes/acronis', Network, 'Acronis Cloud'],
    ],
  },
] as const

function active(pathname: string, href: string) {
  if (href === '/admin') return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function AdminNav() {
  const pathname = usePathname()
  return <nav className="workspace-nav admin-workspace-nav" aria-label="Navegação administrativa">
    {sections.map((section) => <div className="workspace-nav-group" key={section.label}>
      <span className="workspace-nav-label">{section.label}</span>
      <div className="workspace-nav-links">
        {section.items.map(([href, Icon, label]) => <Link className={active(pathname, href) ? 'active' : ''} key={href} href={href}>
          <Icon size={18}/><span>{label}</span>{active(pathname, href) && <i/>}
        </Link>)}
      </div>
    </div>)}
    <div className="workspace-nav-health"><RadioTower size={17}/><div><small>CONTROL PLANE</small><strong>ONLINE</strong></div></div>
  </nav>
}
