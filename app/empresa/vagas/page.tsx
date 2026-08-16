import Link from 'next/link'
import { BriefcaseBusiness, CalendarDays, Edit3, MapPin, PlusCircle, UsersRound } from 'lucide-react'
import { CompanyShell } from '@/components/CompanyShell'
import { requireCompany } from '@/lib/auth'
import { companySetJobStatusAction } from '@/app/actions'
import { SubmitButton } from '@/components/ui/SubmitButton'

function workMode(value:string){return ({remote:'REMOTO',hybrid:'HÍBRIDO',onsite:'PRESENCIAL'} as Record<string,string>)[value]||value.toUpperCase()}
function contract(value:string){return ({full_time:'TEMPO INTEGRAL',part_time:'MEIO PERÍODO',contract:'CONTRATO / PJ',internship:'ESTÁGIO'} as Record<string,string>)[value]||value.toUpperCase()}

export default async function CompanyJobs({searchParams}:{searchParams:Promise<{status?:string;erro?:string;criada?:string;salvo?:string}>}){
  const params=await searchParams
  const {supabase,company}=await requireCompany()
  const {data:jobs}=await supabase.from('jobs').select('id,title,slug,status,work_mode,employment_type,seniority,location,published_at,created_at,job_applications(id)').eq('company_id',company.id).order('created_at',{ascending:false})
  const activeFilter=['draft','published','closed'].includes(String(params.status))?String(params.status):'all'
  const filtered=(jobs||[]).filter((j:any)=>activeFilter==='all'||j.status===activeFilter)
  const counts={all:jobs?.length||0,published:(jobs||[]).filter((j:any)=>j.status==='published').length,draft:(jobs||[]).filter((j:any)=>j.status==='draft').length,closed:(jobs||[]).filter((j:any)=>j.status==='closed').length}

  return <CompanyShell companyName={company.name} verified={company.verified}>
    <div className="page-head internal-page-head employer-page-head"><div><div className="kicker">EMPLOYER / JOBS</div><h1>Vagas</h1><p>Crie oportunidades, acompanhe candidaturas e controle o ciclo de publicação.</p></div><Link className={`btn ${company.verified?'':'secondary'}`} href="/empresa/vagas/nova"><PlusCircle size={15}/> NOVA VAGA</Link></div>

    {params.criada&&<div className="alert success-alert">Vaga criada com sucesso.</div>}
    {params.salvo&&<div className="alert success-alert">Alterações da vaga salvas.</div>}
    {params.erro==='validacao'&&<div className="alert employer-review-alert">Sua empresa ainda está em validação. Mantenha a vaga como rascunho até a publicação ser liberada.</div>}

    <div className="job-filter-tabs">
      <Link className={activeFilter==='all'?'active':''} href="/empresa/vagas">TODAS <b>{counts.all}</b></Link>
      <Link className={activeFilter==='published'?'active':''} href="/empresa/vagas?status=published">PUBLICADAS <b>{counts.published}</b></Link>
      <Link className={activeFilter==='draft'?'active':''} href="/empresa/vagas?status=draft">RASCUNHOS <b>{counts.draft}</b></Link>
      <Link className={activeFilter==='closed'?'active':''} href="/empresa/vagas?status=closed">ENCERRADAS <b>{counts.closed}</b></Link>
    </div>

    <section className="employer-job-grid">{filtered.map((j:any)=><article className="employer-job-card" key={j.id}>
      <div className="employer-job-card-head"><div className="employer-job-icon"><BriefcaseBusiness size={18}/></div><span className={`pill ${j.status==='published'?'active':j.status==='closed'?'danger':'locked'}`}>{String(j.status).toUpperCase()}</span></div>
      <h2>{j.title}</h2>
      <p className="employer-job-location"><MapPin size={13}/>{j.location||'Localização não informada'}</p>
      <div className="job-data-row"><span>{workMode(j.work_mode)}</span><span>{contract(j.employment_type)}</span><span>{j.seniority||'NÍVEL ABERTO'}</span></div>
      <div className="employer-job-stats"><div><UsersRound size={14}/><strong>{j.job_applications?.length||0}</strong><span>CANDIDATOS</span></div><div><CalendarDays size={14}/><strong>{new Date(j.created_at).toLocaleDateString('pt-BR')}</strong><span>CRIADA EM</span></div></div>
      <div className="employer-job-actions"><Link className="btn secondary small" href={`/empresa/vagas/${j.id}/editar`}><Edit3 size={13}/> EDITAR</Link><Link className="btn secondary small" href="/empresa/candidatos">CANDIDATOS</Link></div>
      <form action={companySetJobStatusAction} className="job-status-form"><input type="hidden" name="job_id" value={j.id}/><select name="status" defaultValue={j.status}><option value="draft">Rascunho</option><option value="published">Publicada</option><option value="closed">Encerrada</option></select><SubmitButton className="btn secondary small" idleLabel="ATUALIZAR" pendingLabel="SALVANDO..."/></form>
    </article>)}</section>
    {!filtered.length&&<div className="empty-state"><BriefcaseBusiness size={21}/><h3>Nenhuma vaga neste status</h3><p>Crie uma nova oportunidade ou selecione outro filtro.</p></div>}
  </CompanyShell>
}
