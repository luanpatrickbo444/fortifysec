import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, BriefcaseBusiness, Info } from 'lucide-react'
import { CompanyShell } from '@/components/CompanyShell'
import { requireCompany } from '@/lib/auth'
import { companyUpdateJobAction } from '@/app/actions'
import { SubmitButton } from '@/components/ui/SubmitButton'

export default async function EditJob({params,searchParams}:{params:Promise<{id:string}>,searchParams:Promise<{erro?:string}>}){
  const {id}=await params
  const q=await searchParams
  const {supabase,company}=await requireCompany()
  const {data:job}=await supabase.from('jobs').select('id,title,status,work_mode,employment_type,seniority,location,salary_min,salary_max,description,requirements').eq('id',id).eq('company_id',company.id).maybeSingle()
  if(!job)notFound()

  return <CompanyShell companyName={company.name} verified={company.verified}>
    <div className="page-head internal-page-head employer-page-head"><div><Link prefetch={false} className="employer-back-link" href="/empresa/job-console"><ArrowLeft size={13}/> VOLTAR ÀS VAGAS</Link><div className="kicker">EMPLOYER / JOB EDITOR</div><h1>Editar vaga</h1><p>Atualize as informações e o status da oportunidade.</p></div><div className="employer-head-icon"><BriefcaseBusiness size={25}/></div></div>
    {q.erro&&<div className="alert danger-alert">{q.erro}</div>}

    <form action={companyUpdateJobAction} className="employer-job-editor">
      <input type="hidden" name="job_id" value={job.id}/>
      <section className="card employer-editor-section">
        <div className="employer-editor-head"><span>01</span><div><h2>Informações principais</h2><p>Dados visíveis no catálogo público de vagas.</p></div></div>
        <div className="two-col"><div className="field"><label>Título da vaga *</label><input name="title" required defaultValue={job.title}/></div><div className="field"><label>Senioridade</label><input name="seniority" defaultValue={job.seniority||''}/></div><div className="field"><label>Modelo de trabalho</label><select name="work_mode" defaultValue={job.work_mode}><option value="remote">Remoto</option><option value="hybrid">Híbrido</option><option value="onsite">Presencial</option></select></div><div className="field"><label>Tipo de contrato</label><select name="employment_type" defaultValue={job.employment_type}><option value="full_time">Tempo integral</option><option value="part_time">Meio período</option><option value="contract">Contrato / PJ</option><option value="internship">Estágio</option></select></div><div className="field"><label>Localização</label><input name="location" defaultValue={job.location||''}/></div><div className="field"><label>Status</label><select name="status" defaultValue={job.status}><option value="published">Publicada</option><option value="draft">Rascunho</option><option value="closed">Encerrada</option></select></div></div>
      </section>

      <section className="card employer-editor-section">
        <div className="employer-editor-head"><span>02</span><div><h2>Faixa salarial</h2><p>Opcional. Valores mensais em reais.</p></div></div>
        <div className="two-col"><div className="field"><label>Salário mínimo (R$)</label><input name="salary_min" type="number" min="0" defaultValue={job.salary_min||''}/></div><div className="field"><label>Salário máximo (R$)</label><input name="salary_max" type="number" min="0" defaultValue={job.salary_max||''}/></div></div>
        <div className="company-form-hint"><Info size={13}/> A faixa máxima deve ser igual ou maior que a mínima.</div>
      </section>

      <section className="card employer-editor-section">
        <div className="employer-editor-head"><span>03</span><div><h2>Descrição e requisitos</h2><p>Mantenha o contexto técnico e as expectativas atualizadas.</p></div></div>
        <div className="field"><label>Descrição da vaga *</label><textarea name="description" rows={9} required defaultValue={job.description}/></div>
        <div className="field"><label>Requisitos</label><textarea name="requirements" rows={9} defaultValue={job.requirements}/></div>
      </section>

      <div className="employer-editor-footer"><Link prefetch={false} className="btn secondary" href="/empresa/job-console">CANCELAR</Link><SubmitButton idleLabel="SALVAR ALTERAÇÕES →" pendingLabel="SALVANDO..."/></div>
    </form>
  </CompanyShell>
}
