import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PortalHeader } from '@/components/PortalHeader'
import { StatusPill } from '@/components/StatusPill'
import { getReportDetail } from '@/lib/portal-data'

export default async function Page({params,searchParams}:{params:Promise<{id:string}>,searchParams:Promise<{generated?:string}>}){
  const {id}=await params;const q=await searchParams;const report=await getReportDetail(id);if(!report)notFound()
  const summary=(report.summary??{}) as Record<string,any>
  const health=Number(report.health_score??0);const backup=Number(report.backup_success_rate??0)
  return <>
    <PortalHeader kicker="GOVERNANCE / MONTHLY REPORT" title={`Relatório ${new Date(`${report.reference_month}T12:00:00`).toLocaleDateString('pt-BR',{month:'long',year:'numeric'})}`} copy="Visão consolidada da operação de proteção desta organização." action={<StatusPill tone={health>=90?'green':health>=70?'warning':'danger'}>{health.toFixed(0)}% HEALTH</StatusPill>}/>
    {q.generated&&<div className="form-success">Relatório gerado com os dados operacionais mais recentes.</div>}

    <section className="portal-metrics report-detail-metrics"><article><span>HEALTH SCORE</span><strong>{health.toFixed(0)}%</strong><small>indicador consolidado</small></article><article><span>BACKUP SUCCESS</span><strong>{backup.toFixed(1)}%</strong><small>{summary.backup_jobs_success??0} de {summary.backup_jobs_total??0} jobs</small></article><article><span>RECOVERY TESTS</span><strong>{report.recovery_tests_passed??0}</strong><small>aprovados no mês</small></article><article><span>INCIDENTES</span><strong>{report.incidents_count??0}</strong><small>{summary.incidents_open??0} ainda abertos</small></article></section>

    <div className="report-detail-grid"><section className="portal-card"><span className="section-index">PROTECTION COVERAGE</span><h2>Ativos protegidos</h2><div className="big-report-number">{summary.assets_protected??0}<small> / {summary.assets_total??0}</small></div><p>O health usa a cobertura de ativos como o componente de maior peso, porque equipamento sem política aplicada não está dentro da proteção gerenciada.</p></section><section className="portal-card"><span className="section-index">BACKUP OPERATIONS</span><h2>Execuções do mês</h2><div className="big-report-number">{summary.backup_jobs_success??0}<small> / {summary.backup_jobs_total??0}</small></div><p>São considerados os jobs registrados no Fortify Cloud para a organização durante o mês de referência.</p></section></div>

    <section className="portal-card report-method"><div className="card-head"><div><span className="section-index">METODOLOGIA</span><h2>Como o Health é calculado</h2></div><StatusPill tone="cyan">TRANSPARENTE</StatusPill></div><div className="report-formula"><span>Ativos protegidos × 50%</span><span>Sucesso de backup × 40%</span><span>Higiene de incidentes × 10%</span></div><p>{summary.formula||'Indicador calculado com dados operacionais do ambiente.'}</p></section>

    <section className="portal-card"><div className="card-head"><div><span className="section-index">EVIDÊNCIA</span><h2>Origem do relatório</h2></div></div><div className="ticket-meta-grid"><span><small>Fonte</small><strong>{report.source==='client'?'Portal do cliente':'Fortify Ops'}</strong></span><span><small>Gerado em</small><strong>{report.generated_at?new Date(report.generated_at).toLocaleString('pt-BR'):new Date(report.created_at).toLocaleString('pt-BR')}</strong></span><span><small>Status</small><strong>{report.generation_status??'ready'}</strong></span><span><small>Dados</small><strong>{summary.generated_from??'Fortify Cloud'}</strong></span></div>{report.report_url&&<a className="btn secondary" href={report.report_url} target="_blank" rel="noreferrer">ABRIR ARQUIVO PUBLICADO</a>}</section>

    <Link className="text-link" href="/painel/relatorios">← VOLTAR PARA RELATÓRIOS</Link>
  </>
}
