import Link from 'next/link'
import { PortalHeader } from '@/components/PortalHeader'
import { StatusPill } from '@/components/StatusPill'
import { requireAdmin } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { hasAcronisConfig } from '@/lib/acronis/config'
import { getAcronisCustomerTenants, getAcronisPartnerTenant } from '@/lib/acronis/tenants'
import { formatDateTimePtBr } from '@/lib/datetime'
import {
  createFortifyOrgFromAcronisTenantAction,
  grantAdminPortalAccessAction,
  linkAcronisTenantAction,
  revokeAdminPortalAccessAction,
  syncAcronisAction,
  unlinkAcronisTenantAction,
} from './actions'

export const dynamic = 'force-dynamic'

type Search = {
  mapped?: string
  unmapped?: string
  created?: string
  synced?: string
  portal_access?: string
  portal_access_removed?: string
  error?: string
  sync_error?: string
  existing?: string
}

function isStarterTenant(name: string) {
  return name.trim().toLowerCase() === 'my first customer'
}

function tenantLabel(name: string) {
  if (isStarterTenant(name)) return 'TENANT PADRÃO DO TRIAL'
  if (name.trim().toLowerCase() === 'fortify-lab') return 'LAB RECOMENDADO'
  return 'CLIENTE ACRONIS'
}

function formatBytes(value: unknown) {
  const bytes = Number(value)
  if (!Number.isFinite(bytes) || bytes < 0) return '—'
  if (bytes === 0) return '0 B'
  const units = ['B','KB','MB','GB','TB','PB']
  let n = bytes, i = 0
  while (n >= 1024 && i < units.length - 1) { n /= 1024; i++ }
  return `${n >= 10 || i < 3 ? n.toFixed(0) : n.toFixed(1)} ${units[i]}`
}

export default async function Page({ searchParams }: { searchParams: Promise<Search> }) {
  const q = await searchParams
  const currentUser = await requireAdmin()
  const configured = hasAcronisConfig()
  const admin = createAdminClient()
  const cronConfigured = Boolean(process.env.CRON_SECRET)

  let partner: Awaited<ReturnType<typeof getAcronisPartnerTenant>> | null = null
  let tenants: Awaited<ReturnType<typeof getAcronisCustomerTenants>> = []
  let connectionError = ''

  if (configured) {
    try {
      ;[partner, tenants] = await Promise.all([getAcronisPartnerTenant(), getAcronisCustomerTenants()])
    } catch (error) {
      connectionError = error instanceof Error ? error.message : String(error)
    }
  }

  const { data: organizations, error: orgError } = admin
    ? await admin.from('cloud_organizations').select('id,name,plan,status,provider,provider_tenant_id,last_provider_sync_at').order('name')
    : { data: [], error: null }
  const { data: syncRuns } = admin && !orgError
    ? await admin.from('cloud_provider_sync_runs').select('id,status,organization_id,provider_tenant_id,summary,error_message,finished_at,created_at').eq('provider', 'acronis').order('created_at', { ascending: false }).limit(10)
    : { data: [] }
  const usageSchemaCheck = admin
    ? await admin.from('cloud_organizations').select('provider_storage_bytes,provider_usage_synced_at').limit(1)
    : { error: null }
  const usageSchemaReady = !usageSchemaCheck.error

  const { data: ownMemberships } = admin
    ? await admin.from('cloud_organization_members').select('organization_id').eq('user_id', currentUser.id)
    : { data: [] }

  const orgs = organizations ?? []
  const ownOrgIds = new Set((ownMemberships ?? []).map((membership: any) => String(membership.organization_id)))
  const mappedTenantIds = new Set(orgs.filter((org: any) => org.provider === 'acronis' && org.provider_tenant_id).map((org: any) => org.provider_tenant_id))
  const starterMapped = tenants.some((tenant) => isStarterTenant(tenant.name) && mappedTenantIds.has(tenant.id))

  const errorText = q.error === 'starter-tenant'
    ? 'O tenant “My first customer” é o tenant inicial criado pelo trial da Acronis. Para mapear esse tenant é necessário usar a ação explícita “MAPEAR MESMO ASSIM”. Para o laboratório, use FORTIFY-LAB.'
    : q.error === 'portal-access'
      ? 'Organização inválida para acesso de teste ao portal.'
      : q.error

  return <>
    <PortalHeader
      kicker="ADMIN / ACRONIS"
      title="Acronis Cyber Protect Cloud"
      copy="Integração MSP com separação clara entre tenant técnico, cliente Fortify, acesso ao portal e sincronização."
      action={<div style={{display:'flex',gap:8,alignItems:'center'}}><Link className="btn secondary" href="/admin/alertas">ALERTAS</Link><Link className="btn secondary" href="/admin/relatorios">RELATÓRIOS</Link><StatusPill tone={configured && !connectionError ? 'green' : 'warning'}>{configured && !connectionError ? 'API ONLINE' : 'CONFIGURAÇÃO'}</StatusPill></div>}
    />

    {q.mapped && <div className="form-success">Tenant Acronis vinculado à organização Fortify. Isso não concede acesso ao portal automaticamente.</div>}
    {q.unmapped && <div className="form-success">Mapeamento Acronis removido. A organização Fortify continua existindo.</div>}
    {q.created && <div className="form-success">Organização Fortify criada e mapeada. Nenhum usuário recebeu acesso ao portal automaticamente.</div>}
    {q.synced && <div className="form-success">Sincronização Acronis concluída.</div>}
    {q.portal_access && <div className="form-success">Acesso de teste ao portal concedido à sua conta administrativa.</div>}
    {q.portal_access_removed && <div className="form-success">Acesso de teste ao portal removido da sua conta administrativa.</div>}
    {(errorText || q.sync_error) && <div className="form-error">{q.sync_error || errorText}</div>}
    {q.existing && <div className="form-error">Esse tenant já está vinculado à organização {q.existing}.</div>}
    {!configured && <div className="form-error">Configure ACRONIS_CLIENT_ID, ACRONIS_CLIENT_SECRET e ACRONIS_DATACENTER_URL na Vercel.</div>}
    {connectionError && <div className="form-error">Acronis API: {connectionError}</div>}
    {orgError && <div className="form-error">Banco ainda não preparado para Acronis. Execute supabase/004_acronis_integration.sql.</div>}
    {starterMapped && <div className="form-error"><strong>Atenção:</strong> “My first customer” está mapeado. Esse nome normalmente é criado automaticamente pelo trial da Acronis. Se nosso cliente de teste é o FORTIFY-LAB, desvincule o tenant padrão e mapeie FORTIFY-LAB.</div>}
    {!usageSchemaReady && <div className="form-error"><strong>Migration 006 pendente:</strong> as colunas de telemetria de storage ainda não existem em cloud_organizations. Execute <code>supabase/006_acronis_usage_assets.sql</code> e sincronize novamente.</div>}
    {!cronConfigured && <div className="form-error"><strong>CRON_SECRET ausente:</strong> o endpoint automático de sincronização recusará a execução do cron até essa variável ser configurada na Vercel.</div>}

    <section className="portal-metrics admin-metrics">
      <article><span>PARTNER</span><strong>{partner?.name ?? '—'}</strong><small>tenant MSP principal</small></article>
      <article><span>TENANTS ACRONIS</span><strong>{tenants.length}</strong><small>clientes técnicos retornados</small></article>
      <article><span>MAPEADOS</span><strong>{mappedTenantIds.size}</strong><small>organizações Fortify ligadas</small></article>
      <article><span>ÚLTIMO SYNC</span><strong>{syncRuns?.[0]?.finished_at ? new Date(syncRuns[0].finished_at).toLocaleDateString('pt-BR') : '—'}</strong><small>{syncRuns?.[0]?.status ?? 'sem execução'}</small></article>
    </section>

    <section className="portal-card" style={{marginBottom:16}}>
      <div className="section-head"><div><div className="kicker">AUTOMAÇÃO FORTIFY</div><h2>Sincronização automática diária</h2></div><StatusPill tone={cronConfigured ? "green" : "warning"}>{cronConfigured ? "CRON 13:00 MT" : "CRON NÃO CONFIGURADO"}</StatusPill></div>
      <p className="section-copy" style={{marginBottom:0}}>A Vercel chama <code>/api/cron/acronis-sync</code> diariamente às 17:00 UTC (13:00 em Mato Grosso). Isso sincroniza ativos, jobs, alertas e storage. O backup em si continua sendo executado pela política configurada na Acronis.</p>
    </section>

    <section className="portal-card" style={{marginBottom:16}}>
      <div className="section-head"><div><div className="kicker">FLUXO CORRETO</div><h2>Quatro conceitos diferentes</h2></div></div>
      <div className="process-grid process-commercial">
        <article><span>01</span><h3>TENANT ACRONIS</h3><p>É o isolamento técnico criado dentro da Acronis para cada cliente.</p></article>
        <article><span>02</span><h3>ORGANIZAÇÃO FORTIFY</h3><p>É o cadastro comercial/operacional do cliente dentro do nosso sistema.</p></article>
        <article><span>03</span><h3>ACESSO AO PORTAL</h3><p>É uma associação de usuário. Mapear tenant não deve dar login a ninguém automaticamente.</p></article>
        <article><span>04</span><h3>SINCRONIZAÇÃO</h3><p>Copia telemetria: ativos, backups e alertas. Não cria usuário e não muda autenticação.</p></article>
      </div>
    </section>

    <section className="portal-card">
      <div className="section-head"><div><div className="kicker">CUSTOMER MAPPING</div><h2>Tenants Acronis ↔ organizações Fortify</h2></div>
        <form action={syncAcronisAction}><button className="btn" type="submit" disabled={!configured || Boolean(connectionError) || Boolean(orgError)}>SINCRONIZAR MAPEADOS</button></form>
      </div>

      <div style={{display:'grid',gap:10}}>
        {tenants.length ? tenants.map((tenant) => {
          const mapped = orgs.find((org: any) => org.provider === 'acronis' && org.provider_tenant_id === tenant.id)
          const starter = isStarterTenant(tenant.name)
          const hasPortalAccess = mapped ? ownOrgIds.has(String(mapped.id)) : false
          return <article className="portal-card" key={tenant.id} style={{padding:16,borderColor:starter?'rgba(255,200,87,.3)':undefined}}>
            <div style={{display:'grid',gridTemplateColumns:'1.1fr 1fr .8fr',gap:16,alignItems:'start'}}>
              <div>
                <StatusPill tone={starter ? 'warning' : tenant.name.toLowerCase()==='fortify-lab' ? 'green' : 'cyan'}>{tenantLabel(tenant.name)}</StatusPill>
                <h3 style={{margin:'10px 0 5px'}}>{tenant.name}</h3>
                <small style={{opacity:.55}}>Acronis ID: {tenant.id}</small>
                {starter && <p style={{color:'#b8a46a',fontSize:10,lineHeight:1.5}}>Criado automaticamente pelo trial. Não confunda com um cliente real.</p>}
              </div>

              <div>
                <small className="section-index">ORGANIZAÇÃO FORTIFY</small>
                <h3 style={{margin:'8px 0'}}>{mapped?.name ?? 'Não mapeado'}</h3>
                <StatusPill tone={mapped ? 'green' : 'cyan'}>{mapped ? 'MAPEADO' : 'DISPONÍVEL'}</StatusPill>
                {mapped && <p style={{fontSize:10,opacity:.6,marginTop:8}}>Último sync: {mapped.last_provider_sync_at ? formatDateTimePtBr(mapped.last_provider_sync_at) : 'ainda não executado'}</p>}
              </div>

              <div>
                <small className="section-index">PORTAL DE TESTE</small>
                <h3 style={{margin:'8px 0'}}>{mapped ? (hasPortalAccess ? 'Sua conta tem acesso' : 'Sem acesso para sua conta') : 'Mapeie primeiro'}</h3>
                {mapped && (hasPortalAccess
                  ? <form action={revokeAdminPortalAccessAction}><input type="hidden" name="organization_id" value={mapped.id}/><button className="btn secondary" type="submit">REMOVER ACESSO TESTE</button></form>
                  : <form action={grantAdminPortalAccessAction}><input type="hidden" name="organization_id" value={mapped.id}/><button className="btn secondary" type="submit">TESTAR NO PORTAL</button></form>)}
              </div>
            </div>

            <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:14,paddingTop:14,borderTop:'1px solid rgba(255,255,255,.06)'}}>
              {mapped ? <>
                <form action={syncAcronisAction}><input type="hidden" name="organization_id" value={mapped.id}/><button className="btn" type="submit">SINCRONIZAR ESTE CLIENTE</button></form>
                <Link className="btn secondary" href={`/admin/clientes/${mapped.id}`}>ABRIR CLIENTE</Link>
                <form action={unlinkAcronisTenantAction}><input type="hidden" name="organization_id" value={mapped.id}/><button className="btn secondary" type="submit">DESVINCULAR</button></form>
              </> : <>
                <form action={linkAcronisTenantAction} className="inline-review-form" style={{display:'flex',gap:8,alignItems:'center'}}>
                  <input type="hidden" name="tenant_id" value={tenant.id}/>
                  {starter && <input type="hidden" name="confirm_starter" value="1"/>}
                  <select name="organization_id" required defaultValue=""><option value="" disabled>Vincular organização existente</option>{orgs.filter((org: any) => !org.provider_tenant_id).map((org: any) => <option key={org.id} value={org.id}>{org.name}</option>)}</select>
                  <button className="btn secondary" type="submit">{starter ? 'MAPEAR MESMO ASSIM' : 'VINCULAR'}</button>
                </form>
                <form action={createFortifyOrgFromAcronisTenantAction}>
                  <input type="hidden" name="tenant_id" value={tenant.id}/>
                  {starter && <input type="hidden" name="confirm_starter" value="1"/>}
                  <button className="btn secondary" type="submit">{starter ? 'CRIAR MESMO ASSIM' : 'CRIAR CLIENTE FORTIFY'}</button>
                </form>
              </>}
            </div>
          </article>
        }) : <div className="table-empty">Nenhum tenant de cliente retornado pela API.</div>}
      </div>
    </section>

    <section className="portal-card" style={{marginTop:16}}>
      <div className="section-head"><div><div className="kicker">SYNC HISTORY</div><h2>Últimas sincronizações</h2></div></div>
      <div className="data-table team-table">
        <div className="table-row head"><span>Horário</span><span>Status</span><span>Resumo</span><span>Erro</span></div>
        {(syncRuns ?? []).length ? (syncRuns ?? []).map((run: any) => <div className="table-row" key={run.id}>
          <span>{formatDateTimePtBr(run.finished_at ?? run.created_at)}</span>
          <StatusPill tone={run.status === 'success' ? 'green' : run.status === 'failed' ? 'danger' : 'warning'}>{String(run.status).toUpperCase()}</StatusPill>
          <span>{run.summary ? `${run.summary.assets ?? 0} ativos / ${run.summary.backupJobs ?? 0} jobs / ${run.summary.incidents ?? 0} alertas / storage ${formatBytes(run.summary.storageBytes)} / ${run.summary.trigger ?? 'manual'}` : '—'}</span>
          <span>{run.error_message ?? '—'}</span>
        </div>) : <div className="table-empty">Nenhuma sincronização registrada.</div>}
      </div>
    </section>
  </>
}
