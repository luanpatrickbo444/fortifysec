import Link from 'next/link'
import { ticketAction } from '@/app/actions'
import { PortalHeader } from '@/components/PortalHeader'
import { StatusPill } from '@/components/StatusPill'
import { getTicketsData } from '@/lib/portal-data'

function ticketStatus(status:string){
  const map:Record<string,{label:string,tone:'green'|'warning'|'danger'|'cyan'}>={
    open:{label:'ABERTO',tone:'cyan'},
    in_progress:{label:'EM ATENDIMENTO',tone:'warning'},
    waiting_customer:{label:'AGUARDANDO VOCÊ',tone:'warning'},
    resolved:{label:'RESOLVIDO',tone:'green'},
    closed:{label:'FECHADO',tone:'green'},
  }
  return map[status]??{label:String(status).toUpperCase(),tone:'cyan' as const}
}

export default async function Page({searchParams}:{searchParams:Promise<{ok?:string,error?:string}>}){
  const q=await searchParams
  const tickets=await getTicketsData()
  const open=tickets.filter((t:any)=>!['resolved','closed'].includes(t.status)).length
  const waiting=tickets.filter((t:any)=>t.status==='waiting_customer').length
  const resolved=tickets.filter((t:any)=>['resolved','closed'].includes(t.status)).length

  return <>
    <PortalHeader kicker="OPS / SUPPORT" title="Suporte Fortify" copy="Abra chamados, acompanhe o atendimento e confirme quando a solução estiver validada."/>

    <section className="portal-metrics support-metrics">
      <article><span>CHAMADOS ATIVOS</span><strong>{open}</strong><small>em acompanhamento</small></article>
      <article><span>AGUARDANDO VOCÊ</span><strong>{waiting}</strong><small>precisam de retorno</small></article>
      <article><span>RESOLVIDOS</span><strong>{resolved}</strong><small>histórico concluído</small></article>
      <article><span>CANAL</span><strong>24×7</strong><small>registro pelo portal</small></article>
    </section>

    <div className="portal-grid support-grid">
      <form className="portal-card support-form" action={ticketAction}>
        <span className="section-index">NOVO CHAMADO</span><h2>Como podemos ajudar?</h2>
        {q.ok&&<div className="form-success">Chamado registrado. Você pode acompanhar o status abaixo.</div>}
        {q.error&&<div className="form-error">Não foi possível registrar o chamado: {q.error}.</div>}
        <label>Categoria<select name="category" defaultValue="support"><option value="support">Suporte operacional</option><option value="backup">Backup</option><option value="recovery">Recuperação</option><option value="security">Segurança / alerta</option><option value="access">Acesso</option><option value="billing">Contrato / administrativo</option></select></label>
        <label>Assunto<input name="subject" required placeholder="Ex.: restaurar arquivo do financeiro"/></label>
        <label>Prioridade<select name="priority" defaultValue="normal"><option value="normal">Normal</option><option value="high">Alta</option><option value="critical">Crítica / indisponibilidade</option></select></label>
        <label>Descrição<textarea name="description" required rows={6} placeholder="Explique o que aconteceu, qual ativo está envolvido e desde quando."/></label>
        <button className="btn full">ABRIR CHAMADO →</button>
      </form>

      <article className="portal-card support-info"><span className="section-index">COMO FUNCIONA</span><h2>Ciclo do chamado</h2><p>O status deixa claro em qual etapa o atendimento está. Quando a Fortify marcar como resolvido, você ainda pode validar a solução antes do fechamento definitivo.</p><div className="support-check"><span>1. Aberto — recebemos a solicitação</span><span>2. Em atendimento — técnico atuando</span><span>3. Aguardando você — precisamos de informação/validação</span><span>4. Resolvido — solução aplicada</span><span>5. Fechado — solução confirmada</span></div></article>
    </div>

    <section className="portal-card ticket-history"><div className="card-head"><h2>Chamados</h2><StatusPill tone={open?'warning':'green'}>{open} ATIVOS</StatusPill></div>
      <div className="data-table"><div className="table-row head ticket-table-row"><span>Chamado</span><span>Prioridade</span><span>Atualizado</span><span>Status</span><span>Ação</span></div>
        {tickets.length?tickets.map((t:any)=>{const st=ticketStatus(t.status);return <div className="table-row ticket-table-row" key={t.id}><div><strong>{t.subject}</strong><small className="table-subtext">#{String(t.id).slice(0,8)} · {t.category||'support'}</small></div><StatusPill tone={t.priority==='critical'?'danger':t.priority==='high'?'warning':'cyan'}>{t.priority}</StatusPill><span>{new Date(t.updated_at??t.created_at).toLocaleString('pt-BR')}</span><StatusPill tone={st.tone}>{st.label}</StatusPill><Link className="text-link" href={`/painel/suporte/${t.id}`}>ACOMPANHAR →</Link></div>})
        :<div className="table-empty">Nenhum chamado aberto até agora.</div>}
      </div>
    </section>
  </>
}
