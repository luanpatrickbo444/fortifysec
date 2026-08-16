import Link from 'next/link'
import { BriefcaseBusiness, PlusCircle } from 'lucide-react'
import { CompanyShell } from '@/components/CompanyShell'
import { requireCompany } from '@/lib/auth'
import { companySetJobStatusAction } from '@/app/actions'
import { SubmitButton } from '@/components/ui/SubmitButton'

export default async function CompanyJobs(){
 const {supabase,company}=await requireCompany();const {data:jobs}=await supabase.from('jobs').select('id,title,slug,status,work_mode,employment_type,seniority,location,published_at,created_at,job_applications(id)').eq('company_id',company.id).order('created_at',{ascending:false})
 return <CompanyShell companyName={company.name}><div className="page-head internal-page-head"><div><div className="kicker">EMPLOYER / JOBS</div><h1>Vagas</h1><p>Gerencie as oportunidades publicadas pela sua empresa.</p></div><Link className={`btn ${company.verified?'':'secondary'}`} href={company.verified?'/empresa/vagas/nova':'/empresa'}><PlusCircle size={15}/> NOVA VAGA</Link></div><section className="admin-resource-grid">{(jobs||[]).map((j:any)=><article className="card admin-resource-card" key={j.id}><div className="panel-head"><span className={`pill ${j.status==='published'?'active':'locked'}`}>{String(j.status).toUpperCase()}</span><BriefcaseBusiness size={17}/></div><h3>{j.title}</h3><p>{j.location||'Localização não informada'} · {j.work_mode} · {j.employment_type}</p><div className="meta-row"><span>{j.seniority||'NÍVEL ABERTO'}</span><span>{j.job_applications?.length||0} CANDIDATOS</span></div><form action={companySetJobStatusAction}><input type="hidden" name="job_id" value={j.id}/><select name="status" defaultValue={j.status}><option value="draft">Rascunho</option><option value="published">Publicada</option><option value="closed">Encerrada</option></select><SubmitButton className="btn secondary" idleLabel="ATUALIZAR STATUS" pendingLabel="ATUALIZANDO..."/></form></article>)}</section>{!jobs?.length&&<div className="empty-state">Nenhuma vaga cadastrada.</div>}</CompanyShell>
}
