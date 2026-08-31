import { redirect } from 'next/navigation'
import { Building2, CheckCircle2, ClipboardCheck, CloudCog, DatabaseBackup, ShieldCheck } from 'lucide-react'
import { saveOnboardingAction } from '@/app/actions'
import { PortalHeader } from '@/components/PortalHeader'
import { StatusPill } from '@/components/StatusPill'
import { getOnboardingState } from '@/lib/onboarding-data'

const statusCopy: Record<string, { label: string; title: string; copy: string; tone: 'green'|'cyan'|'warning'|'danger' }> = {
  submitted: { label: 'ENVIADO', title: 'Diagnóstico recebido', copy: 'A equipe Fortify já pode analisar os dados do seu ambiente e preparar o provisionamento.', tone: 'cyan' },
  reviewing: { label: 'EM ANÁLISE', title: 'Ambiente em análise técnica', copy: 'Estamos validando escopo, criticidade, volume, RPO/RTO e o plano mais adequado.', tone: 'cyan' },
  needs_info: { label: 'AÇÃO NECESSÁRIA', title: 'Precisamos de mais informações', copy: 'Revise a observação da equipe e atualize os dados abaixo para continuar.', tone: 'warning' },
  rejected: { label: 'REVISÃO NECESSÁRIA', title: 'Solicitação precisa ser ajustada', copy: 'Você pode corrigir os dados e enviar novamente para uma nova análise.', tone: 'danger' },
  approved: { label: 'APROVADO', title: 'Provisionamento autorizado', copy: 'O próximo passo é criar sua organização e vincular os serviços de proteção.', tone: 'green' },
  provisioned: { label: 'PROVISIONADO', title: 'Organização criada', copy: 'Seu ambiente foi criado. Atualize a página ou acesse a visão geral do portal.', tone: 'green' },
}

export default async function Onboarding({ searchParams }: { searchParams: Promise<{ submitted?: string; error?: string }> }) {
  const q = await searchParams
  const state = await getOnboardingState()
  if (state.org) redirect('/painel')
  const request = state.request
  const status = request ? statusCopy[request.status] : null
  const editable = !request || ['draft', 'needs_info', 'rejected'].includes(request.status)

  return <>
    <PortalHeader kicker="FORTIFY CLOUD / ONBOARDING" title="Coloque seu ambiente em proteção" copy="Conte como sua empresa funciona. A Fortify transforma essas informações em um ambiente gerenciado de backup e recuperação." action={<StatusPill tone={status?.tone || 'cyan'}>{status?.label || 'INICIAR'}</StatusPill>}/>

    {request && status && <section className="onboarding-status-card">
      <div className="onboarding-status-icon"><ClipboardCheck/></div>
      <div><span className="section-index">STATUS DA SOLICITAÇÃO</span><h2>{status.title}</h2><p>{status.copy}</p>{request.admin_notes && <div className="admin-note"><strong>Mensagem da Fortify</strong><p>{request.admin_notes}</p></div>}</div>
    </section>}

    {(q.submitted || (request && !editable)) && <div className="onboarding-steps">
      <article className="done"><span>01</span><CheckCircle2/><div><strong>Dados enviados</strong><small>Informações técnicas e comerciais recebidas.</small></div></article>
      <article className={['reviewing','approved','provisioned'].includes(request?.status || '') ? 'done' : ''}><span>02</span><ShieldCheck/><div><strong>Análise Fortify</strong><small>Validação de escopo, riscos, RPO e RTO.</small></div></article>
      <article className={['approved','provisioned'].includes(request?.status || '') ? 'done' : ''}><span>03</span><CloudCog/><div><strong>Provisionamento</strong><small>Organização, políticas e integrações.</small></div></article>
      <article className={request?.status === 'provisioned' ? 'done' : ''}><span>04</span><DatabaseBackup/><div><strong>Proteção ativa</strong><small>Ativos, backups, testes e relatórios no portal.</small></div></article>
    </div>}

    {editable && <form className="portal-card onboarding-form" action={saveOnboardingAction}>
      <div className="card-head"><div><span className="section-index">ENVIRONMENT DISCOVERY</span><h2>Diagnóstico do ambiente</h2></div><Building2/></div>
      {q.error && <div className="form-error">Não foi possível salvar. Confira os campos obrigatórios e tente novamente.</div>}
      <div className="onboarding-form-grid">
        <label>Nome da empresa<input name="organization_name" required defaultValue={request?.organization_name || ''} placeholder="Ex.: Grupo Boraschi"/></label>
        <label>Razão social<input name="legal_name" defaultValue={request?.legal_name || ''} placeholder="Razão social"/></label>
        <label>CNPJ<input name="cnpj" defaultValue={request?.cnpj || ''} placeholder="00.000.000/0000-00"/></label>
        <label>Responsável técnico/comercial<input name="contact_name" required defaultValue={request?.contact_name || state.profile?.full_name || ''} placeholder="Nome do responsável"/></label>
        <label>Telefone / WhatsApp<input name="contact_phone" defaultValue={request?.contact_phone || ''} placeholder="(65) 99999-9999"/></label>
        <label>Plano desejado<select name="plan" defaultValue={request?.plan || 'Business'}><option>Essencial</option><option>Business</option><option>Enterprise</option></select></label>
        <label>Colaboradores<select name="employees" defaultValue={request?.employees || ''}><option value="">Selecione</option><option>1–20</option><option>21–50</option><option>51–200</option><option>201–500</option><option>500+</option></select></label>
        <label>Volume aproximado<select name="data_volume" defaultValue={request?.data_volume || ''}><option value="">Selecione</option><option>Até 500 GB</option><option>500 GB–2 TB</option><option>2–10 TB</option><option>10–50 TB</option><option>50 TB+</option><option>Não sei</option></select></label>
        <label>RPO desejado<select name="rpo_target" defaultValue={request?.rpo_target || ''}><option value="">Não definido</option><option>15 minutos</option><option>1 hora</option><option>4 horas</option><option>12 horas</option><option>24 horas</option></select></label>
        <label>RTO desejado<select name="rto_target" defaultValue={request?.rto_target || ''}><option value="">Não definido</option><option>1 hora</option><option>4 horas</option><option>8 horas</option><option>24 horas</option><option>48 horas</option></select></label>
      </div>
      <label>Infraestrutura atual<textarea name="infrastructure" rows={4} defaultValue={request?.infrastructure || ''} placeholder="Servidores Windows/Linux, VMs, Microsoft 365, NAS, cloud, banco de dados..."/></label>
      <label>Como o backup é feito hoje?<textarea name="current_backup" rows={3} defaultValue={request?.current_backup || ''} placeholder="Ferramenta atual, destino, frequência, retenção, quem acompanha..."/></label>
      <label>Sistemas e dados críticos<textarea name="critical_systems" rows={4} defaultValue={request?.critical_systems || ''} placeholder="ERP, banco SQL, arquivos financeiros, documentos, sistemas de produção..."/></label>
      <label>Observações<textarea name="notes" rows={3} defaultValue={request?.notes || ''} placeholder="Requisitos específicos, janelas de backup, restrições, compliance..."/></label>
      <button className="btn" type="submit">ENVIAR PARA ANÁLISE →</button>
    </form>}
  </>
}
