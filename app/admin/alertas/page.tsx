import Link from 'next/link'
import { PortalHeader } from '@/components/PortalHeader'
import { StatusPill } from '@/components/StatusPill'
import { getAdminAlerts } from '@/lib/admin-data'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const alerts = await getAdminAlerts()
  const open = alerts.filter((alert: any) => alert.status !== 'resolved')
  const critical = open.filter((alert: any) => alert.severity === 'critical')
  const acronis = alerts.filter((alert: any) => alert.provider === 'acronis')

  return <>
    <PortalHeader kicker="ADMIN / ALERTS" title="Alertas e incidentes" copy="Ocorrências importadas dos provedores e incidentes operacionais de todos os clientes."/>

    <section className="portal-metrics admin-metrics">
      <article><span>ABERTOS</span><strong>{open.length}</strong><small>exigem acompanhamento</small></article>
      <article><span>CRÍTICOS</span><strong>{critical.length}</strong><small>prioridade máxima</small></article>
      <article><span>ACRONIS</span><strong>{acronis.length}</strong><small>alertas sincronizados</small></article>
      <article><span>TOTAL</span><strong>{alerts.length}</strong><small>histórico carregado</small></article>
    </section>

    <section className="portal-card">
      <div className="section-head"><div><div className="kicker">CENTRAL DE ALERTAS</div><h2>Eventos que exigem ação</h2></div></div>
      <div className="data-table team-table">
        <div className="table-row head" style={{gridTemplateColumns:'1fr .8fr .55fr 1.4fr .6fr .45fr',minWidth:980}}><span>Cliente</span><span>Ativo</span><span>Severidade</span><span>Ocorrência</span><span>Status</span><span>Ação</span></div>
        {alerts.length ? alerts.map((alert: any) => <div className="table-row" style={{gridTemplateColumns:'1fr .8fr .55fr 1.4fr .6fr .45fr',minWidth:980}} key={alert.id}>
          <strong>{alert.organization_name}</strong>
          <span>{alert.asset_name}</span>
          <StatusPill tone={alert.severity === 'critical' ? 'danger' : alert.severity === 'high' ? 'warning' : 'cyan'}>{String(alert.severity).toUpperCase()}</StatusPill>
          <span><strong>{alert.title}</strong><small style={{display:'block',opacity:.65,marginTop:4}}>{new Date(alert.opened_at).toLocaleString('pt-BR')} · {alert.provider ?? 'fortify'}</small></span>
          <StatusPill tone={alert.status === 'resolved' ? 'green' : 'warning'}>{String(alert.status).toUpperCase()}</StatusPill>
          <Link className="text-link" href={`/admin/clientes/${alert.organization_id}`}>OPERAR →</Link>
        </div>) : <div className="table-empty">Nenhum alerta registrado. Quando a Acronis retornar warning/error/critical, ele aparece aqui após o sync.</div>}
      </div>
    </section>

    <div className="info-callout"><strong>Regra do fluxo</strong><p>A Acronis é a fonte técnica do alerta. A Fortify transforma alertas relevantes em incidentes operacionais, associa ao cliente/ativo e acompanha até a resolução.</p></div>
  </>
}
