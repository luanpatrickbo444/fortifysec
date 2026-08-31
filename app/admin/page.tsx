import Link from 'next/link'
import {
  Activity,
  ArrowUpRight,
  BellRing,
  Building2,
  FileBarChart,
  Gauge,
  Headphones,
  Network,
  ScanSearch,
  ShieldCheck,
  UsersRound,
} from 'lucide-react'
import { PortalHeader } from '@/components/PortalHeader'
import { StatusPill } from '@/components/StatusPill'
import { getAdminOverview } from '@/lib/admin-data'

const actions = [
  ['/admin/onboarding', ScanSearch, 'Onboarding', 'Analise solicitações e libere novos ambientes.'],
  ['/admin/clientes', Building2, 'Clientes', 'Abra a visão operacional de cada organização.'],
  ['/admin/chamados', Headphones, 'Service desk', 'Priorize chamados, respostas e resolução.'],
  ['/admin/alertas', BellRing, 'Central de alertas', 'Concentre incidentes Acronis e ocorrências abertas.'],
  ['/admin/relatorios', FileBarChart, 'Relatórios', 'Acompanhe evidências e relatórios mensais.'],
  ['/admin/leads', UsersRound, 'Pipeline comercial', 'Converta diagnósticos e avaliações em clientes.'],
  ['/admin/eventos', Activity, 'Eventos', 'Audite eventos recebidos dos provedores.'],
  ['/admin/integracoes/acronis', Network, 'Acronis Cloud', 'Mapeie tenants e valide a sincronização técnica.'],
] as const

export default async function Page({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const q = await searchParams
  const d = await getAdminOverview()
  const attention = d.alerts + d.tickets + d.onboarding
  return <>
    <PortalHeader
      kicker="OPERATIONS / COMMAND CENTER"
      title="Central de operações"
      copy="Visão executiva e operacional dos clientes Fortify Cloud, com proteção, atendimento, onboarding e integrações em um único workspace."
      action={<StatusPill tone={attention ? 'warning' : 'green'}>{attention ? `${attention} ITENS EM FILA` : 'OPERAÇÃO NORMAL'}</StatusPill>}
    />
    {q.error && <div className="form-error">Configure SUPABASE_SERVICE_ROLE_KEY para habilitar as operações administrativas.</div>}

    <section className="admin-command-summary">
      <article className="admin-command-primary">
        <div className="admin-command-icon"><Gauge size={22}/></div>
        <div><span>POSTURA OPERACIONAL</span><strong>{attention ? 'REQUER ACOMPANHAMENTO' : 'ESTÁVEL'}</strong><p>{attention ? `${attention} itens entre alertas, chamados e onboarding aguardam tratamento.` : 'Nenhum item crítico na fila operacional.'}</p></div>
      </article>
      <article><span>CLIENTES ATIVOS</span><strong>{d.clients}</strong><small>organizações gerenciadas</small></article>
      <article><span>SUCESSO 24H</span><strong>{d.jobs ? `${d.successRate.toFixed(1)}%` : '—'}</strong><small>{d.successCount} de {d.jobs} jobs</small></article>
      <article><span>RECOVERY TESTS</span><strong>{d.tests}</strong><small>executados neste mês</small></article>
    </section>

    <section className="portal-metrics admin-metrics enterprise-metrics">
      <article><Building2/><span>CLIENTES</span><strong>{d.clients}</strong><small>organizações</small></article>
      <article><ScanSearch/><span>ONBOARDING</span><strong>{d.onboarding}</strong><small>aguardando ação</small></article>
      <article><Activity/><span>JOBS 24H</span><strong>{d.jobs}</strong><small>{d.successCount} com sucesso</small></article>
      <article><BellRing/><span>ALERTAS</span><strong>{d.alerts}</strong><small>em acompanhamento</small></article>
      <article><Headphones/><span>CHAMADOS</span><strong>{d.tickets}</strong><small>ativos no service desk</small></article>
      <article><ShieldCheck/><span>RECOVERY TESTS</span><strong>{d.tests}</strong><small>este mês</small></article>
      <article><UsersRound/><span>LEADS NOVOS</span><strong>{d.leads}</strong><small>oportunidades</small></article>
    </section>

    <div className="admin-section-title"><div><span>WORKSPACES</span><h2>Operação e gestão</h2></div><p>Acesse diretamente a área responsável por cada etapa do serviço gerenciado.</p></div>
    <div className="admin-action-grid enterprise-action-grid">
      {actions.map(([href, Icon, title, copy]) => <Link href={href} key={href}>
        <div className="admin-action-icon"><Icon size={20}/></div>
        <div className="admin-action-copy"><strong>{title}</strong><span>{copy}</span></div>
        <ArrowUpRight className="admin-action-arrow" size={17}/>
      </Link>)}
    </div>
  </>
}
