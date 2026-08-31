import Link from 'next/link'
import { notFound } from 'next/navigation'
import { confirmSupportTicketResolutionAction, replySupportTicketAction } from '@/app/painel/actions'
import { PortalHeader } from '@/components/PortalHeader'
import { StatusPill } from '@/components/StatusPill'
import { getTicketDetail } from '@/lib/portal-data'

function statusMeta(status:string){
  const map:Record<string,{label:string,tone:'green'|'warning'|'danger'|'cyan',copy:string}>={
    open:{label:'ABERTO',tone:'cyan',copy:'Chamado recebido e aguardando triagem.'},
    in_progress:{label:'EM ATENDIMENTO',tone:'warning',copy:'A equipe Fortify está atuando neste chamado.'},
    waiting_customer:{label:'AGUARDANDO VOCÊ',tone:'warning',copy:'Precisamos de uma informação ou validação sua.'},
    resolved:{label:'RESOLVIDO',tone:'green',copy:'A Fortify aplicou uma solução. Confirme se ficou tudo certo.'},
    closed:{label:'FECHADO',tone:'green',copy:'Atendimento encerrado após resolução.'},
  }
  return map[status]??{label:String(status).toUpperCase(),tone:'cyan' as const,copy:'Status operacional do atendimento.'}
}

export default async function Page({params,searchParams}:{params:Promise<{id:string}>,searchParams:Promise<Record<string,string|undefined>>}){
  const {id}=await params;const q=await searchParams;const data=await getTicketDetail(id);if(!data)notFound()
  const {ticket,messages}=data;const st=statusMeta(ticket.status)
  return <>
    <PortalHeader kicker="OPS / SUPPORT / TICKET" title={ticket.subject} copy={`Chamado #${String(ticket.id).slice(0,8)} · aberto em ${new Date(ticket.created_at).toLocaleString('pt-BR')}`} action={<StatusPill tone={st.tone}>{st.label}</StatusPill>}/>
    {q.sent&&<div className="form-success">Mensagem enviada para a equipe Fortify.</div>}{q.closed&&<div className="form-success">Resolução confirmada. Chamado encerrado.</div>}{q.error&&<div className="form-error">Não foi possível concluir: {q.error}.</div>}

    <div className="ticket-detail-grid">
      <section className="portal-card"><div className="card-head"><div><span className="section-index">STATUS DO ATENDIMENTO</span><h2>{st.label}</h2></div><StatusPill tone={ticket.priority==='critical'?'danger':ticket.priority==='high'?'warning':'cyan'}>{ticket.priority}</StatusPill></div><p>{st.copy}</p><div className="ticket-meta-grid"><span><small>Categoria</small><strong>{ticket.category||'support'}</strong></span><span><small>Última atualização</small><strong>{new Date(ticket.updated_at).toLocaleString('pt-BR')}</strong></span><span><small>Resolvido em</small><strong>{ticket.resolved_at?new Date(ticket.resolved_at).toLocaleString('pt-BR'):'—'}</strong></span><span><small>Fechado em</small><strong>{ticket.closed_at?new Date(ticket.closed_at).toLocaleString('pt-BR'):'—'}</strong></span></div>{ticket.resolution_note&&<div className="resolution-box"><span className="section-index">SOLUÇÃO / PARECER FORTIFY</span><strong>{ticket.resolution_note}</strong></div>}</section>

      <section className="portal-card"><span className="section-index">SOLICITAÇÃO ORIGINAL</span><h2>Descrição</h2><p className="ticket-description">{ticket.description}</p></section>
    </div>

    <section className="portal-card ticket-conversation"><div className="card-head"><h2>Histórico do atendimento</h2><span className="section-index">{messages.length} MENSAGENS</span></div><div className="ticket-thread"><article className="ticket-message customer"><div><strong>Você</strong><span>{new Date(ticket.created_at).toLocaleString('pt-BR')}</span></div><p>{ticket.description}</p></article>{messages.map((m:any)=><article className={`ticket-message ${m.author_role==='staff'?'staff':'customer'}`} key={m.id}><div><strong>{m.author_role==='staff'?'FORTIFY OPS':'Você'}</strong><span>{new Date(m.created_at).toLocaleString('pt-BR')}</span></div><p>{m.body}</p></article>)}</div>

      {ticket.status!=='closed'&&<form className="ticket-reply-form" action={replySupportTicketAction}><input type="hidden" name="ticket_id" value={ticket.id}/><label>{ticket.status==='resolved'?'A solução ainda não resolveu? Responda e o chamado será reaberto.':'Responder ao chamado'}<textarea name="body" required rows={4} placeholder="Adicione informações, testes realizados ou dúvidas para a equipe Fortify."/></label><button className="btn" type="submit">ENVIAR RESPOSTA →</button></form>}

      {ticket.status==='resolved'&&<div className="ticket-resolution-actions"><div><strong>Funcionou?</strong><p>Confirme a resolução para encerrar o atendimento. Se ainda houver problema, responda acima e o chamado volta para a fila.</p></div><form action={confirmSupportTicketResolutionAction}><input type="hidden" name="ticket_id" value={ticket.id}/><button className="btn" type="submit">CONFIRMAR RESOLUÇÃO</button></form></div>}
    </section>

    <Link className="text-link" href="/painel/suporte">← VOLTAR PARA CHAMADOS</Link>
  </>
}
