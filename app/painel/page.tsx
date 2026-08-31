import Link from 'next/link'
import { redirect } from 'next/navigation'
import { AlertTriangle, CheckCircle2, Cloud, HardDrive, RefreshCcw, ShieldCheck } from 'lucide-react'
import { PortalHeader } from '@/components/PortalHeader'
import { StatusPill } from '@/components/StatusPill'
import { getOverviewData } from '@/lib/portal-data'
import { getOnboardingState } from '@/lib/onboarding-data'

export default async function Dashboard() {
  const onboarding = await getOnboardingState()
  if (!onboarding.org) redirect('/painel/onboarding')
  const data = await getOverviewData()
  if (!data.org) redirect('/painel/onboarding')
  const { org, backups, recovery, automation } = data
  const provisioning = onboarding.org.status !== 'active'
  const hasAssets = Number(org.assets) > 0
  const protectionTone = provisioning || !hasAssets ? 'cyan' : org.health < 100 ? 'warning' : 'green'
  const protectionLabel = provisioning ? 'PROVISIONANDO' : !hasAssets ? 'AGUARDANDO SYNC' : org.health < 100 ? 'ATENÇÃO' : 'PROTEÇÃO ATIVA'

  return <>
    <PortalHeader
      kicker="FORTIFY CLOUD / OVERVIEW"
      title={`Proteção — ${org.name}`}
      copy={`Plano ${org.plan}. Acompanhe a condição operacional do ambiente protegido.`}
      action={<StatusPill tone={protectionTone}>{protectionLabel}</StatusPill>}
    />
    {(provisioning || !hasAssets) && <div className="provisioning-banner"><ShieldCheck/><div><strong>{provisioning ? 'Organização criada. Integração técnica em andamento.' : 'Nenhum ativo sincronizado ainda.'}</strong><p>{provisioning ? 'A equipe Fortify está cadastrando ativos, políticas e integrações.' : 'Execute a sincronização Acronis no admin. O painel só considera proteção ativa depois que um workload real é identificado.'}</p></div></div>}

    <section className="portal-metrics">
      <article><ShieldCheck/><span>HEALTH SCORE</span><strong>{org.health}%</strong><small>{hasAssets ? 'ativos protegidos / inventário' : 'aguardando inventário'}</small></article>
      <article><Cloud/><span>STORAGE BACKUP</span><strong>{org.storage}</strong><small>{String(org.provider).toLowerCase()==='acronis' ? 'uso reportado pela Acronis' : 'uso no provider'}</small></article>
      <article><HardDrive/><span>ATIVOS</span><strong>{org.assets}</strong><small>workloads sincronizados</small></article>
      <article><AlertTriangle/><span>INCIDENTES</span><strong>{org.incidents}</strong><small>abertos agora</small></article>
    </section>

    {automation && <section className="portal-card" style={{marginBottom:16}}>
      <div className="card-head"><div><span className="section-index">BACKUP AUTOMATION</span><h2>Agendamento e sincronização</h2></div><StatusPill tone={automation.tone}>{automation.label}</StatusPill></div>
      <div className="ticket-meta-grid">
        <span><small>Último backup</small><strong>{automation.lastBackup}</strong></span>
        <span><small>Próximo backup</small><strong>{automation.nextBackup}</strong></span>
        <span><small>Último sync Fortify</small><strong>{automation.lastSync}</strong></span>
        <span><small>Timezone</small><strong>{automation.timezone}</strong></span>
      </div>
      <p className="table-subtext" style={{marginTop:12}}>{automation.message}</p>
    </section>}

    <section className="portal-card" style={{marginBottom:16}}>
      <div className="card-head"><div><span className="section-index">STORAGE TELEMETRY</span><h2>Uso do provider</h2></div><span className="table-subtext">Atualizado: {org.storageUpdated}</span></div>
      <div className="ticket-meta-grid">
        <span><small>Cloud storage</small><strong>{org.storage}</strong></span>
        <span><small>Immutable storage</small><strong>{org.immutable}</strong></span>
        <span><small>Dados-fonte identificados</small><strong>{org.protected}</strong></span>
        <span><small>Provider</small><strong>{String(org.provider).toUpperCase()}</strong></span>
      </div>
      <p className="table-subtext" style={{marginTop:12}}>{org.telemetryReady===false ? 'Telemetria de storage ainda não está habilitada no banco. A equipe Fortify precisa aplicar a migration 006 e executar uma nova sincronização.' : 'Storage do provider e tamanho lógico dos dados-fonte são métricas diferentes. A Fortify não estima uma pela outra.'}</p>
    </section>

    <section className="portal-grid">
      <article className="portal-card wide"><div className="card-head"><div><span className="section-index">BACKUP STATUS</span><h2>Últimas execuções</h2></div><Link href="/painel/backups">VER TODOS →</Link></div><div className="data-table"><div className="table-row head"><span>Fonte</span><span>Destino</span><span>Último backup</span><span>Status</span></div>{backups.length ? backups.map((b: any) => <div className="table-row" key={b.externalId??b.source+b.last}><strong>{b.source}</strong><span>{b.target}</span><span>{b.last}</span><StatusPill tone={b.status === 'Atenção' ? 'warning' : b.status==='Executando'?'cyan':'green'}>{b.status}</StatusPill></div>) : <div className="table-empty">Nenhuma execução recebida ainda.</div>}</div></article>
      <article className="portal-card"><span className="section-index">RECOVERY CHECK</span><div className="big-icon"><RefreshCcw/></div><h2>{recovery.length ? 'Recuperação validada' : 'Teste pendente'}</h2><p>Último teste: <strong>{org.recovery}</strong></p><div className="mini-list">{recovery.slice(0, 2).map((r: any) => <span key={r.date + r.asset}><CheckCircle2 size={15}/>{r.asset} — {r.rto}</span>)}</div><Link className="btn secondary full" href="/painel/recuperacao">VER TESTES</Link></article>
    </section>
  </>
}
