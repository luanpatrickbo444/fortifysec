import Link from 'next/link'
import { ArrowLeft, BriefcaseBusiness, Info, ShieldCheck } from 'lucide-react'
import { CompanyShell } from '@/components/CompanyShell'
import { requireCompany } from '@/lib/auth'
import { companyCreateJobAction } from '@/app/actions'
import { SubmitButton } from '@/components/ui/SubmitButton'

export default async function NewJob({searchParams}:{searchParams:Promise<{erro?:string}>}){
  const q=await searchParams
  const {company}=await requireCompany()

  return <CompanyShell companyName={company.name} verified={company.verified}>
    <div className="page-head internal-page-head employer-page-head"><div><Link prefetch={false} className="employer-back-link" href="/empresa/job-console"><ArrowLeft size={13}/> VOLTAR ÀS VAGAS</Link><div className="kicker">EMPLOYER / NEW JOB</div><h1>Nova vaga</h1><p>Cadastre uma oportunidade com contexto suficiente para atrair os profissionais certos.</p></div><div className="employer-head-icon"><BriefcaseBusiness size={25}/></div></div>
    {q.erro&&<div className="alert danger-alert">{q.erro}</div>}
    {!company.verified&&<div className="alert employer-review-alert"><ShieldCheck size={15}/> A empresa ainda está em validação. Você pode montar e salvar a vaga como rascunho; a publicação será liberada após a aprovação.</div>}

    <form action={companyCreateJobAction} className="employer-job-editor">
      <section className="card employer-editor-section">
        <div className="employer-editor-head"><span>01</span><div><h2>Informações principais</h2><p>Defina como a oportunidade será identificada na plataforma.</p></div></div>
        <div className="two-col"><div className="field"><label>Título da vaga *</label><input name="title" required placeholder="Analista de Segurança Jr."/></div><div className="field"><label>Senioridade</label><input name="seniority" placeholder="Júnior / Pleno / Sênior"/></div><div className="field"><label>Modelo de trabalho</label><select name="work_mode"><option value="remote">Remoto</option><option value="hybrid">Híbrido</option><option value="onsite">Presencial</option></select></div><div className="field"><label>Tipo de contrato</label><select name="employment_type"><option value="full_time">Tempo integral</option><option value="part_time">Meio período</option><option value="contract">Contrato / PJ</option><option value="internship">Estágio</option></select></div><div className="field"><label>Localização</label><input name="location" placeholder="São Paulo, SP / Brasil"/></div><div className="field"><label>Status inicial</label><select name="status" defaultValue={company.verified?'published':'draft'}>{company.verified&&<option value="published">Publicar agora</option>}<option value="draft">Salvar como rascunho</option></select></div></div>
      </section>

      <section className="card employer-editor-section">
        <div className="employer-editor-head"><span>02</span><div><h2>Faixa salarial</h2><p>Opcional. Informe valores mensais em reais.</p></div></div>
        <div className="two-col"><div className="field"><label>Salário mínimo (R$)</label><input name="salary_min" type="number" min="0" placeholder="5000"/></div><div className="field"><label>Salário máximo (R$)</label><input name="salary_max" type="number" min="0" placeholder="8000"/></div></div>
        <div className="company-form-hint"><Info size={13}/> A faixa máxima deve ser igual ou maior que a mínima.</div>
      </section>

      <section className="card employer-editor-section">
        <div className="employer-editor-head"><span>03</span><div><h2>Descrição e requisitos</h2><p>Seja claro sobre responsabilidades, contexto técnico e conhecimentos esperados.</p></div></div>
        <div className="field"><label>Descrição da vaga *</label><textarea name="description" rows={9} required placeholder="Contexto da posição, responsabilidades, time, rotina e desafios..."/></div>
        <div className="field"><label>Requisitos</label><textarea name="requirements" rows={9} placeholder={'Ex.:\n• Fundamentos de redes e Linux\n• Conhecimento em segurança de aplicações\n• Experiência com ferramentas de análise...'}/></div>
      </section>

      <div className="employer-editor-footer"><Link prefetch={false} className="btn secondary" href="/empresa/job-console">CANCELAR</Link><SubmitButton idleLabel="SALVAR VAGA →" pendingLabel="SALVANDO VAGA..."/></div>
    </form>
  </CompanyShell>
}
