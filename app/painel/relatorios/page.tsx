import Link from 'next/link'
import { generateMonthlyReportAction } from '@/app/painel/actions'
import { PortalHeader } from '@/components/PortalHeader'
import { StatusPill } from '@/components/StatusPill'
import { getReportsData } from '@/lib/portal-data'

export default async function Page({searchParams}:{searchParams:Promise<{error?:string}>}){
  const q=await searchParams;const reports=await getReportsData();const now=new Date();const currentMonth=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`
  return <>
    <PortalHeader kicker="GOVERNANCE / REPORTS" title="Relatórios de proteção" copy="Gere uma visão executiva usando os dados reais já sincronizados de ativos, backups, recovery tests e incidentes."/>
    {q.error&&<div className="form-error">Não foi possível gerar o relatório: {q.error}.</div>}

    <section className="portal-card report-generator"><div><span className="section-index">SELF-SERVICE REPORT</span><h2>Gerar relatório do mês atual</h2><p>O relatório não inventa indicadores: ele calcula automaticamente os números a partir dos dados operacionais disponíveis no Fortify Cloud.</p><div className="report-formula"><span>50% ativos protegidos</span><span>40% sucesso de backup</span><span>10% higiene de incidentes</span></div></div><form action={generateMonthlyReportAction} className="report-generate-form"><label>Mês de referência<input type="month" name="reference_month" max={currentMonth} defaultValue={currentMonth}/></label><button className="btn" type="submit">GERAR / ATUALIZAR RELATÓRIO →</button></form></section>

    {reports.length?<div className="report-grid">{reports.map((r:any)=><article className="report-card" key={r.id??r.month}><div><span className="section-index">MONTHLY PROTECTION REPORT</span><StatusPill tone="green">{r.status}</StatusPill></div><h2>{r.month}</h2><div className="report-stats"><span><small>Health</small><strong>{r.score}</strong></span><span><small>Backups</small><strong>{r.backups}</strong></span><span><small>Testes</small><strong>{r.tests}</strong></span><span><small>Incidentes</small><strong>{r.incidents}</strong></span></div><div className="report-origin">Origem: {r.source==='client'?'gerado pelo portal':'Fortify Ops'} · {r.generatedAt?new Date(r.generatedAt).toLocaleString('pt-BR'):'—'}</div>{r.id&&<Link className="btn secondary full" href={`/painel/relatorios/${r.id}`}>VER RELATÓRIO ONLINE</Link>}{r.url&&<a className="text-link report-external-link" href={r.url} target="_blank" rel="noreferrer">ABRIR ARQUIVO PUBLICADO →</a>}</article>)}</div>:<div className="empty-state"><StatusPill tone="cyan">SEM RELATÓRIOS</StatusPill><h2>Gere o primeiro relatório.</h2><p>Assim que houver telemetria sincronizada, você pode criar um resumo executivo do mês diretamente pelo portal.</p></div>}
  </>
}
