import Link from 'next/link'
import { Activity, Building2, LogOut, ShieldCheck } from 'lucide-react'
import { logoutAction } from '@/app/actions'
import { setPortalOrganizationAction } from '@/app/painel/actions'
import { PortalNav } from '@/components/PortalNav'

export type PortalShellContext = {
  email: string
  fullName: string
  activeOrgId: string | null
  orgName: string | null
  orgPlan: string | null
  orgStatus: string | null
  organizations: Array<{ id: string; name: string; plan: string; status: string }>
  onboardingStatus: string | null
}

function statusLabel(context: PortalShellContext) {
  if (!context.orgName) {
    if (context.onboardingStatus === 'submitted' || context.onboardingStatus === 'reviewing') return 'EM ANÁLISE'
    if (context.onboardingStatus === 'needs_info') return 'AÇÃO NECESSÁRIA'
    return 'ONBOARDING'
  }
  if (context.orgStatus === 'active') return 'OPERACIONAL'
  if (context.orgStatus === 'suspended') return 'SUSPENSO'
  return 'PROVISIONANDO'
}

export function PortalShell({ children, context }: { children: React.ReactNode; context: PortalShellContext }) {
  const enabled = Boolean(context.orgName)
  return <div className="portal-shell enterprise-shell">
    <aside className="portal-side enterprise-sidebar">
      <div className="workspace-brand-block">
        <Link href="/painel" className="workspace-brand"><span className="workspace-brand-mark">F</span><span><b>Fortify Cloud</b><small>Client Protection Portal</small></span></Link>
        <span className="workspace-edition">MANAGED DATA PROTECTION</span>
      </div>

      <div className="enterprise-protection-card">
        <span className="protection-icon"><ShieldCheck size={18}/></span>
        <div><small>STATUS DE PROTEÇÃO</small><strong>{statusLabel(context)}</strong></div>
      </div>

      <div className="enterprise-account-card">
        <span className="account-icon"><Building2 size={17}/></span>
        <div><strong>{context.orgName || context.fullName}</strong><small>{context.orgName ? `${context.orgPlan || 'Plano'} · ${context.email}` : context.email}</small></div>
      </div>

      {context.organizations.length > 1 && <form action={setPortalOrganizationAction} className="organization-switcher">
        <label htmlFor="portal-organization">ORGANIZAÇÃO ATIVA</label>
        <select id="portal-organization" name="organization_id" defaultValue={context.activeOrgId ?? ''}>
          {context.organizations.map((org) => <option key={org.id} value={org.id}>{org.name}</option>)}
        </select>
        <button className="btn secondary" type="submit">Trocar organização</button>
      </form>}

      <PortalNav enabled={enabled}/>

      <div className="workspace-sidebar-footer portal-sidebar-footer">
        <div className="sidebar-connection"><Activity size={15}/><span>{enabled ? 'AMBIENTE CONECTADO' : 'CONTA AUTENTICADA'}</span></div>
        <form action={logoutAction}><button className="sidebar-logout"><LogOut size={16}/><span>Sair do portal</span></button></form>
        <Link className="sidebar-public-link" href="/">fortifysec.com.br</Link>
      </div>
    </aside>

    <div className="portal-workspace">
      <header className="workspace-topbar portal-topbar">
        <div><span className="topbar-dot"/><strong>Proteção gerenciada</strong><small>{context.orgName ? `Ambiente ${context.orgName}` : 'Configuração inicial do ambiente'}</small></div>
        <div className="topbar-status"><span>FORTIFY CLOUD</span><strong>{enabled ? 'CONNECTED' : 'ONBOARDING'}</strong></div>
      </header>
      <main className="portal-main">{children}</main>
    </div>
  </div>
}
