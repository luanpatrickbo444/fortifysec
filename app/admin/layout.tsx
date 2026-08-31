import Link from 'next/link'
import { ArrowUpRight, ExternalLink, ShieldCheck } from 'lucide-react'
import { requireAdmin } from '@/lib/auth'
import { AdminNav } from '@/components/AdminNav'

export const metadata = { title: 'Fortify Cloud | Operations Center' }

export default async function Layout({ children }: { children: React.ReactNode }) {
  await requireAdmin()
  return <div className="admin-shell enterprise-shell">
    <aside className="admin-sidebar">
      <div className="workspace-brand-block">
        <Link href="/admin" className="workspace-brand"><span className="workspace-brand-mark">F</span><span><b>Fortify Cloud</b><small>Operations Center</small></span></Link>
        <span className="workspace-edition">ENTERPRISE CONTROL PLANE</span>
      </div>
      <AdminNav/>
      <div className="workspace-sidebar-footer">
        <Link href="/painel"><ShieldCheck size={16}/><span>Portal do cliente</span><ArrowUpRight size={14}/></Link>
        <Link href="/"><ExternalLink size={16}/><span>Site institucional</span><ArrowUpRight size={14}/></Link>
      </div>
    </aside>
    <div className="admin-workspace">
      <header className="workspace-topbar admin-topbar">
        <div><span className="topbar-dot"/><strong>Fortify Operations</strong><small>Monitoramento e gestão de ambientes protegidos</small></div>
        <div className="topbar-status"><span>PLATAFORMA</span><strong>OPERACIONAL</strong></div>
      </header>
      <main className="admin-main">{children}</main>
    </div>
  </div>
}
