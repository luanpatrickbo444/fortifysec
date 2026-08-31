import Link from 'next/link'
import { PortalHeader } from '@/components/PortalHeader'
import { StatusPill } from '@/components/StatusPill'
import { getAdminReports } from '@/lib/admin-data'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const reports = await getAdminReports()
  const published = reports.filter((report: any) => report.report_url || report.generation_status === 'ready')
  const avgHealth = reports.length ? reports.reduce((sum: number, report: any) => sum + Number(report.health_score ?? 0), 0) / reports.length : 0
  const avgBackup = reports.length ? reports.reduce((sum: number, report: any) => sum + Number(report.backup_success_rate ?? 0), 0) / reports.length : 0

  return <>
    <PortalHeader kicker="ADMIN / REPORTS" title="Relatórios de proteção" copy="Relatórios mensais publicados para os clientes e indicadores consolidados da operação."/>

    <section className="portal-metrics admin-metrics">
      <article><span>RELATÓRIOS</span><strong>{reports.length}</strong><small>registros mensais</small></article>
      <article><span>PUBLICADOS</span><strong>{published.length}</strong><small>online ou publicado</small></article>
      <article><span>HEALTH MÉDIO</span><strong>{reports.length ? `${avgHealth.toFixed(0)}%` : '—'}</strong><small>histórico publicado</small></article>
      <article><span>BACKUP SUCCESS</span><strong>{reports.length ? `${avgBackup.toFixed(1)}%` : '—'}</strong><small>histórico publicado</small></article>
    </section>

    <section className="portal-card">
      <div className="section-head"><div><div className="kicker">MONTHLY REPORTS</div><h2>Relatórios por cliente</h2></div></div>
      <div className="data-table team-table">
        <div className="table-row head" style={{gridTemplateColumns:'1fr 1fr .55fr .65fr .55fr .55fr .5fr',minWidth:1050}}><span>Cliente</span><span>Referência</span><span>Health</span><span>Backups</span><span>Recovery</span><span>Incidentes</span><span>Ação</span></div>
        {reports.length ? reports.map((report: any) => <div className="table-row" style={{gridTemplateColumns:'1fr 1fr .55fr .65fr .55fr .55fr .5fr',minWidth:1050}} key={report.id}>
          <strong>{report.organization?.name ?? 'Cliente'}</strong>
          <span>{new Date(`${report.reference_month}T12:00:00`).toLocaleDateString('pt-BR',{month:'long',year:'numeric'})}</span>
          <StatusPill tone={Number(report.health_score ?? 0) >= 90 ? 'green' : 'warning'}>{Number(report.health_score ?? 0).toFixed(0)}%</StatusPill>
          <span>{Number(report.backup_success_rate ?? 0).toFixed(1)}%</span>
          <span>{report.recovery_tests_passed ?? 0}</span>
          <span>{report.incidents_count ?? 0}</span>
          <span><Link className="text-link" href={`/admin/relatorios/${report.id}`}>ABRIR →</Link></span>
        </div>) : <div className="table-empty">Nenhum relatório mensal gerado ainda. O cliente pode gerar pelo portal ou a Fortify pode publicar pelo painel administrativo.</div>}
      </div>
    </section>

    <div className="info-callout"><strong>Regra do relatório</strong><p>O sync traz telemetria e eventos. O cliente pode gerar um relatório online com os dados reais do mês; a Fortify também pode revisar e publicar um arquivo externo quando necessário.</p></div>
  </>
}
