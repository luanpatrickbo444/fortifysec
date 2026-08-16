import Link from 'next/link'
import { Github, Linkedin, Search, UserCheck, UsersRound } from 'lucide-react'
import { CompanyShell } from '@/components/CompanyShell'
import { requireCompany } from '@/lib/auth'
import { companyUpdateApplicationStatusAction } from '@/app/actions'
import { SubmitButton } from '@/components/ui/SubmitButton'

function statusLabel(status:string){return ({submitted:'RECEBIDA',viewed:'VISUALIZADA',interview:'ENTREVISTA',rejected:'RECUSADA',hired:'CONTRATADA'} as Record<string,string>)[status]||status.toUpperCase()}

export default async function CompanyCandidates({searchParams}:{searchParams:Promise<{q?:string;status?:string;job?:string}>}){
  const params=await searchParams
  const {supabase,company}=await requireCompany()
  const [{data:apps},{data:jobs}]=await Promise.all([
    supabase.from('job_applications').select('id,status,cover_note,created_at,jobs!inner(id,title,company_id),profiles(id,name,email,headline,xp,github_url,linkedin_url,open_to_work)').eq('jobs.company_id',company.id).order('created_at',{ascending:false}),
    supabase.from('jobs').select('id,title').eq('company_id',company.id).order('created_at',{ascending:false}),
  ])
  const text=String(params.q||'').trim().toLowerCase()
  const status=String(params.status||'all')
  const jobFilter=String(params.job||'all')
  const filtered=(apps||[]).filter((a:any)=>{
    const p=Array.isArray(a.profiles)?a.profiles[0]:a.profiles
    const job=Array.isArray(a.jobs)?a.jobs[0]:a.jobs
    return (!text||`${p?.name||''} ${p?.headline||''} ${p?.email||''}`.toLowerCase().includes(text)) && (status==='all'||a.status===status) && (jobFilter==='all'||job?.id===jobFilter)
  })

  return <CompanyShell companyName={company.name} verified={company.verified}>
    <div className="page-head internal-page-head employer-page-head"><div><div className="kicker">EMPLOYER / CANDIDATES</div><h1>Candidatos</h1><p>Organize candidaturas, revise sinais técnicos e acompanhe cada etapa do processo.</p></div><span className="pill active"><UsersRound size={13}/>{filtered.length} CANDIDATOS</span></div>

    <form method="get" className="card candidate-filter-bar">
      <div className="candidate-search"><Search size={16}/><input name="q" defaultValue={params.q||''} placeholder="Buscar candidato..."/></div>
      <select name="job" defaultValue={jobFilter}><option value="all">Todas as vagas</option>{(jobs||[]).map((j:any)=><option key={j.id} value={j.id}>{j.title}</option>)}</select>
      <select name="status" defaultValue={status}><option value="all">Todos os status</option><option value="submitted">Recebida</option><option value="viewed">Visualizada</option><option value="interview">Entrevista</option><option value="hired">Contratada</option><option value="rejected">Recusada</option></select>
      <button className="btn" type="submit">FILTRAR</button>
      <Link className="btn secondary" href="/empresa/candidatos">LIMPAR</Link>
    </form>

    <div className="employer-candidate-grid">{filtered.map((a:any)=>{
      const p=Array.isArray(a.profiles)?a.profiles[0]:a.profiles
      const job=Array.isArray(a.jobs)?a.jobs[0]:a.jobs
      const level=Math.max(1,Math.floor(Number(p?.xp||0)/1000)+1)
      return <article className="employer-candidate-card" key={a.id}>
        <div className="candidate-card-head"><div className="talent-avatar large">{String(p?.name||'?').slice(0,1).toUpperCase()}</div><div><span className="section-index">CANDIDATE // LEVEL {level}</span><h2>{p?.name||'Candidato'}</h2><p>{p?.headline||p?.email}</p></div><span className={`application-status ${a.status}`}>{statusLabel(a.status)}</span></div>
        <div className="candidate-job-line"><span>VAGA</span><strong>{job?.title}</strong></div>
        <div className="candidate-proof-row"><div><small>XP SCORE</small><strong>{Number(p?.xp||0).toLocaleString('pt-BR')}</strong></div><div><small>DISPONIBILIDADE</small><strong>{p?.open_to_work?'OPEN TO WORK':'CANDIDATO ATIVO'}</strong></div><div><small>APLICAÇÃO</small><strong>{new Date(a.created_at).toLocaleDateString('pt-BR')}</strong></div></div>
        {a.cover_note&&<div className="candidate-note"><span>MENSAGEM DO CANDIDATO</span><p>{a.cover_note}</p></div>}
        <div className="candidate-links">{p?.github_url&&<a className="btn secondary small" href={p.github_url} target="_blank" rel="noreferrer"><Github size={13}/> GITHUB</a>}{p?.linkedin_url&&<a className="btn secondary small" href={p.linkedin_url} target="_blank" rel="noreferrer"><Linkedin size={13}/> LINKEDIN</a>}<a className="btn secondary small" href={`mailto:${p?.email}`}><UserCheck size={13}/> CONTATAR</a></div>
        <form action={companyUpdateApplicationStatusAction} className="candidate-status-form"><input type="hidden" name="application_id" value={a.id}/><div className="field"><label>Etapa do processo</label><select name="status" defaultValue={a.status}><option value="submitted">Recebida</option><option value="viewed">Visualizada</option><option value="interview">Entrevista</option><option value="rejected">Recusada</option><option value="hired">Contratada</option></select></div><SubmitButton className="btn secondary" idleLabel="ATUALIZAR STATUS" pendingLabel="SALVANDO..."/></form>
      </article>
    })}</div>
    {!filtered.length&&<div className="empty-state"><UsersRound size={22}/><h3>Nenhum candidato encontrado</h3><p>Ajuste os filtros ou aguarde novas candidaturas.</p></div>}
  </CompanyShell>
}
