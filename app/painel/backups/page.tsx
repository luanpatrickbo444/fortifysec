import { Clock3, RefreshCcw, ShieldCheck } from 'lucide-react'
import { PortalHeader } from '@/components/PortalHeader'
import { StatusPill } from '@/components/StatusPill'
import { getBackupsPageData } from '@/lib/portal-data'

export default async function Page(){
  const { rows, automation } = await getBackupsPageData()
  return <>
    <PortalHeader kicker="PROTECTION / BACKUPS" title="Backups monitorados" copy="Execuções recentes, política de retenção e condição de cada fonte."/>

    <section className="portal-metrics" style={{marginBottom:16}}>
      <article><ShieldCheck/><span>AUTOMAÇÃO</span><strong style={{fontSize:16}}>{automation.label}</strong><small>política controlada pela Acronis</small></article>
      <article><Clock3/><span>ÚLTIMO BACKUP</span><strong style={{fontSize:16}}>{automation.lastBackup}</strong><small>timezone {automation.timezone}</small></article>
      <article><RefreshCcw/><span>PRÓXIMO BACKUP</span><strong style={{fontSize:16}}>{automation.nextBackup}</strong><small>horário informado pela política</small></article>
      <article><RefreshCcw/><span>ÚLTIMO SYNC</span><strong style={{fontSize:16}}>{automation.lastSync}</strong><small>Fortify ↔ Acronis</small></article>
    </section>

    <section className="portal-card" style={{marginBottom:16}}>
      <div className="card-head">
        <div><span className="section-index">BACKUP AUTOMATION</span><h2>Diagnóstico do agendamento</h2></div>
        <StatusPill tone={automation.tone}>{automation.label}</StatusPill>
      </div>
      <p className="section-copy" style={{marginBottom:0}}>{automation.message}</p>
      <p className="table-subtext" style={{marginTop:10}}>O agendamento e a execução do backup são controlados pelo Acronis Cyber Protect Cloud. O Fortify sincroniza o resultado, inventário, próxima execução e alertas para o portal.</p>
    </section>

    <div className="portal-card">
      <div className="data-table backup-table">
        <div className="table-row head"><span>Fonte</span><span>Destino</span><span>Última execução</span><span>Retenção</span><span>Status</span></div>
        {rows.length?rows.map((b:any)=><div className="table-row" key={b.externalId??b.source+b.last}><strong>{b.source}</strong><span>{b.target}</span><span>{b.last}</span><span>{b.retention}</span><StatusPill tone={b.status==='Atenção'?'warning':b.status==='Executando'?'cyan':'green'}>{b.status}</StatusPill></div>):<div className="table-empty">Nenhum backup recebido para esta organização.</div>}
      </div>
    </div>
  </>
}
