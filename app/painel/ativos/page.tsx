import { PortalHeader } from '@/components/PortalHeader'
import { StatusPill } from '@/components/StatusPill'
import { getAssetsData } from '@/lib/portal-data'

export default async function Page(){
  const assets=await getAssetsData()
  return <>
    <PortalHeader kicker="PROTECTION / ASSETS" title="Ativos protegidos" copy="Inventário real sincronizado dos workloads cobertos pela política de proteção."/>
    {assets.length?<div className="asset-grid">{assets.map((a:any)=><article className="asset-card" key={a.name}>
      <StatusPill tone={a.status==='Atenção'?'warning':a.status==='pending'?'cyan':'green'}>{a.status}</StatusPill>
      <span className="section-index">{a.type}</span><h2>{a.name}</h2>
      <dl>
        <div><dt>Provider</dt><dd>{String(a.provider).toUpperCase()}</dd></div>
        <div><dt>Sistema</dt><dd>{a.os}</dd></div>
        <div><dt>Política</dt><dd>{a.policy}</dd></div>
        <div><dt>CyberFit</dt><dd>{a.cyberfit===null?'—':`${a.cyberfit}/850`}</dd></div>
        <div><dt>Último backup</dt><dd>{a.lastBackup}</dd></div>
        <div><dt>Próximo backup</dt><dd>{a.nextBackup}</dd></div>
        <div><dt>Dados-fonte</dt><dd>{a.protectedBytes>0?a.protectedSize:'não informado pelo workload'}</dd></div>
        <div><dt>Último sync</dt><dd>{a.lastSync}</dd></div>
      </dl>
    </article>)}</div>:<div className="empty-state"><StatusPill tone="cyan">SEM ATIVOS</StatusPill><h2>Inventário ainda vazio.</h2><p>Execute a sincronização Acronis. A V4 também cria o ativo a partir do Resource Status quando o Workload Management não retornar a máquina.</p></div>}
  </>
}
