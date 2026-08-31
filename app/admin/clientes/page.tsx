import Link from 'next/link'
import { PortalHeader } from '@/components/PortalHeader'
import { StatusPill } from '@/components/StatusPill'
import { getAdminClients } from '@/lib/admin-data'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const clients = await getAdminClients()
  const mapped = clients.filter((client: any) => client.provider === 'acronis' && client.provider_tenant_id)
  const active = clients.filter((client: any) => client.status === 'active')
  return <>
    <PortalHeader kicker="ADMIN / CLIENTS" title="Clientes Fortify Cloud" copy="Organizações comerciais da Fortify, vínculo com provedores e estado operacional atual."/>

    <section className="portal-metrics admin-metrics">
      <article><span>CLIENTES</span><strong>{clients.length}</strong><small>organizações cadastradas</small></article>
      <article><span>ATIVOS</span><strong>{active.length}</strong><small>operação liberada</small></article>
      <article><span>ACRONIS</span><strong>{mapped.length}</strong><small>tenants mapeados</small></article>
      <article><span>SEM PROVIDER</span><strong>{clients.length - mapped.length}</strong><small>sem vínculo técnico</small></article>
    </section>

    <div className="info-callout" style={{marginBottom:16}}><strong>Importante</strong><p>Cliente Fortify e tenant Acronis são objetos diferentes. O cliente é a organização comercial no nosso sistema; o tenant é o ambiente técnico no provedor. O mapeamento liga os dois.</p></div>

    <section className="portal-card">
      <div className="data-table">
        <div className="table-row head" style={{gridTemplateColumns:'1.15fr .65fr .65fr .7fr 1fr .45fr',minWidth:920}}><span>Cliente</span><span>Plano</span><span>Status</span><span>Provider</span><span>Último sync</span><span>Ação</span></div>
        {clients.length ? clients.map((c: any) => <div className="table-row" style={{gridTemplateColumns:'1.15fr .65fr .65fr .7fr 1fr .45fr',minWidth:920}} key={c.id || c.name}>
          <strong>{c.name}</strong>
          <span>{c.plan}</span>
          <StatusPill tone={c.status === 'active' ? 'green' : c.status === 'suspended' ? 'danger' : 'cyan'}>{c.status}</StatusPill>
          <span>{c.provider === 'acronis' ? <StatusPill tone="cyan">ACRONIS</StatusPill> : '—'}</span>
          <span>{c.last_provider_sync_at ? new Date(c.last_provider_sync_at).toLocaleString('pt-BR') : 'Não sincronizado'}</span>
          <Link className="text-link" href={`/admin/clientes/${c.id}`}>OPERAR →</Link>
        </div>) : <div className="table-empty">Nenhum cliente provisionado.</div>}
      </div>
    </section>
  </>
}
