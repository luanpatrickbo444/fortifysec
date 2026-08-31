import { updateLeadStatusAction } from '@/app/admin/actions'
import { PortalHeader } from '@/components/PortalHeader'
import { StatusPill } from '@/components/StatusPill'
import { getAdminLeads } from '@/lib/admin-data'

export default async function Page() {
  const leads = await getAdminLeads()
  return <><PortalHeader kicker="ADMIN / SALES" title="Leads e diagnósticos" copy="Solicitações recebidas pelo site público."/><div className="lead-grid">{leads.map((lead: any) => <article className="portal-card" key={lead.id}><div className="card-head"><div><span className="section-index">{new Date(lead.created_at).toLocaleDateString('pt-BR')}</span><h2>{lead.company}</h2></div><StatusPill tone={lead.status === 'new' ? 'cyan' : lead.status === 'won' ? 'green' : 'warning'}>{lead.status}</StatusPill></div><p><strong>{lead.name}</strong> · {lead.email} · {lead.phone || 'sem telefone'}</p><div className="admin-request-meta"><span><small>Equipe</small><strong>{lead.employees || '—'}</strong></span><span><small>Volume</small><strong>{lead.data_volume || '—'}</strong></span></div>{lead.message && <p>{lead.message}</p>}<form className="lead-status-form" action={updateLeadStatusAction}><input type="hidden" name="id" value={lead.id}/><select name="status" defaultValue={lead.status}><option value="new">Novo</option><option value="contacted">Contatado</option><option value="qualified">Qualificado</option><option value="proposal">Proposta</option><option value="won">Ganho</option><option value="lost">Perdido</option></select><button className="btn secondary" type="submit">SALVAR</button></form></article>)}</div></>
}
