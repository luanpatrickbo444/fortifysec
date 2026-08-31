'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  AlertTriangle,
  BarChart3,
  ClipboardCheck,
  DatabaseBackup,
  HardDrive,
  Headphones,
  LayoutDashboard,
  RotateCcw,
  Users,
} from 'lucide-react'

const fullNav = [
  ['/painel', LayoutDashboard, 'Visão geral'],
  ['/painel/backups', DatabaseBackup, 'Backups'],
  ['/painel/ativos', HardDrive, 'Ativos protegidos'],
  ['/painel/recuperacao', RotateCcw, 'Recuperação'],
  ['/painel/incidentes', AlertTriangle, 'Incidentes'],
  ['/painel/equipe', Users, 'Acessos'],
  ['/painel/relatorios', BarChart3, 'Relatórios'],
  ['/painel/suporte', Headphones, 'Suporte'],
] as const

const onboardingNav = [['/painel/onboarding', ClipboardCheck, 'Onboarding']] as const

function active(pathname: string, href: string) {
  if (href === '/painel') return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function PortalNav({ enabled }: { enabled: boolean }) {
  const pathname = usePathname()
  const nav = enabled ? fullNav : onboardingNav
  return <nav className="workspace-nav portal-workspace-nav" aria-label="Navegação do portal">
    <div className="workspace-nav-group">
      <span className="workspace-nav-label">{enabled ? 'AMBIENTE' : 'CONFIGURAÇÃO'}</span>
      <div className="workspace-nav-links">
        {nav.map(([href, Icon, label]) => <Link className={active(pathname, href) ? 'active' : ''} key={href} href={href}>
          <Icon size={18}/><span>{label}</span>{active(pathname, href) && <i/>}
        </Link>)}
      </div>
    </div>
  </nav>
}
