import Link from 'next/link'
import { ArrowRight, BriefcaseBusiness, CheckCircle2, Clock3, Eye, Search, UserCheck, UsersRound } from 'lucide-react'
import { CompanyShell } from '@/components/CompanyShell'
import { requireCompany } from '@/lib/auth'
import { companyUpdateProfileAction } from '@/app/actions'
import { SubmitButton } from '@/components/ui/SubmitButton'

function statusLabel(status:string){
  return ({submitted:'RECEBIDA',viewed:'VISUALIZADA',interview:'ENTREVISTA',rejected:'RECUSADA',hired:'CONTRATADA'} as Record<string,string>)[status]||status.toUpperCase()
}

export default async function CompanyHome({searchParams}:{searchParams:Promise<{salvo?:string}>}){
  const query=await searchParams
  const {supabase,company}=await requireCompany()

  const [
    {data:jobs},
    {data:applications},
    {data:companyRow},
    {data:talents},
  ]=await Promise.all([
    supabase.from('jobs').select('id,title,status,created_at,job_applications(id)').eq('company_id',company.id).order('created_at',{ascending:false}),
    supabase.from('job_applications').select('id,status,created_at,jobs!inner(id,title,company_id),profiles(id,name,headline,xp)').eq('jobs.company_id',company.id).order('created_at',{ascending:false}).limit(6),
    supabase.from('companies').select('id,name,description,website,location,verified,active').eq('id',company.id).single(),
    supabase.from('profiles').select('id,name,headline,xp,open_to_work,github_url,linkedin_url').eq('profile_public',true).eq('blocked',false).order('xp',{ascending:false}).limit(100),
  ])

  const allJobs=jobs||[]
  const publishedJobs=allJobs.filter((j:any)=>j.status==='published').length
  const totalApplications=allJobs.reduce((sum:number,j:any)=>sum+(j.job_applications?.length||0),0)
  const openTalents=(talents||[]).filter((t:any)=>t.open_to_work).length

  return (
    <CompanyShell companyName={company.name} verified={company.verified}>
      <section className="employer-dashboard-hero">
        <div>
          <div className="kicker">EMPLOYER / COMMAND CENTER</div>
          <h1>Olá, {company.name}.</h1>
          <p>Gerencie sua operação de recrutamento e encontre talentos validados pela atividade prática na FortifySec.</p>
          <div className="hero-actions employer-hero-actions">
            <Link prefetch={false} className={`btn ${company.verified?'':'secondary'}`} href="/empresa/job-console/nova"><BriefcaseBusiness size={15}/> NOVA VAGA</Link>
            <Link className="btn secondary" href="/empresa/talentos"><Search size={15}/> BUSCAR TALENTOS</Link>
          </div>
        </div>
        <div className={`employer-verification-card ${company.verified?'verified':'pending'}`}>
          {company.verified?<CheckCircle2 size={24}/>:<Clock3 size={24}/>} 
          <span>STATUS DA EMPRESA</span>
          <strong>{company.verified?'VALIDADA':'EM ANÁLISE'}</strong>
          <p>{company.verified?'Publicação de vagas liberada.':'Você já pode configurar o perfil; vagas serão liberadas após a validação.'}</p>
        </div>
      </section>

      {query.salvo&&<div className="alert success-alert">Perfil da empresa atualizado.</div>}
      {!company.verified&&<div className="alert employer-review-alert"><Clock3 size={15}/> Sua empresa está cadastrada e em análise. Você pode preparar vagas em rascunho; a publicação fica bloqueada até a validação da FortifySec.</div>}

      <section className="employer-metrics-grid">
        <Link prefetch={false} href="/empresa/job-console" className="employer-metric-card">
          <BriefcaseBusiness size={18}/><small>VAGAS ATIVAS</small><strong>{publishedJobs}</strong><span>{allJobs.length} no total</span>
        </Link>
        <Link href="/empresa/candidatos" className="employer-metric-card">
          <UsersRound size={18}/><small>CANDIDATURAS</small><strong>{totalApplications}</strong><span>pipeline da empresa</span>
        </Link>
        <Link href="/empresa/talentos" className="employer-metric-card accent">
          <Search size={18}/><small>OPEN TO WORK</small><strong>{openTalents}</strong><span>talentos disponíveis</span>
        </Link>
        <Link href="/empresa/talentos?sort=xp" className="employer-metric-card">
          <UserCheck size={18}/><small>TALENT NETWORK</small><strong>{talents?.length||0}</strong><span>perfis públicos</span>
        </Link>
      </section>

      <section className="employer-dashboard-grid">
        <div className="card employer-panel">
          <div className="employer-panel-head">
            <div><span className="section-index">RECENT PIPELINE</span><h2>Candidaturas recentes</h2></div>
            <Link href="/empresa/candidatos">VER TODAS <ArrowRight size={13}/></Link>
          </div>
          <div className="employer-application-list">
            {(applications||[]).map((a:any)=>{
              const p=Array.isArray(a.profiles)?a.profiles[0]:a.profiles
              const job=Array.isArray(a.jobs)?a.jobs[0]:a.jobs
              return <article key={a.id} className="employer-application-row">
                <div className="talent-avatar">{String(p?.name||'?').slice(0,1).toUpperCase()}</div>
                <div className="employer-application-copy"><strong>{p?.name||'Talento'}</strong><span>{job?.title||'Vaga'} · {p?.xp||0} XP</span></div>
                <span className={`application-status ${a.status}`}>{statusLabel(a.status)}</span>
              </article>
            })}
            {!applications?.length&&<div className="employer-empty-mini"><Eye size={18}/><span>Ainda não há candidaturas. Publique uma vaga para iniciar o pipeline.</span></div>}
          </div>
        </div>

        <div className="card employer-panel employer-quick-panel">
          <div className="employer-panel-head"><div><span className="section-index">QUICK ACTIONS</span><h2>Ações rápidas</h2></div></div>
          <Link prefetch={false} href="/empresa/job-console/nova"><BriefcaseBusiness size={18}/><div><strong>Publicar uma vaga</strong><span>Crie uma nova oportunidade para a rede.</span></div><ArrowRight size={15}/></Link>
          <Link href="/empresa/talentos"><Search size={18}/><div><strong>Encontrar talentos</strong><span>Filtre por XP, headline e disponibilidade.</span></div><ArrowRight size={15}/></Link>
          <Link href="/empresa/candidatos"><UsersRound size={18}/><div><strong>Revisar candidatos</strong><span>Atualize o estágio de cada candidatura.</span></div><ArrowRight size={15}/></Link>
        </div>
      </section>

      <form action={companyUpdateProfileAction} className="card employer-company-profile">
        <div className="employer-panel-head">
          <div><span className="section-index">COMPANY PROFILE</span><h2>Perfil da empresa</h2><p>Essas informações aparecem nas oportunidades publicadas.</p></div>
          <span className="mono employer-saved-state">SERVER SAVED</span>
        </div>
        <div className="two-col">
          <div className="field"><label>Site</label><input name="website" defaultValue={companyRow?.website||''} placeholder="https://empresa.com.br"/></div>
          <div className="field"><label>Localização</label><input name="location" defaultValue={companyRow?.location||''} placeholder="Cuiabá, MT / Remoto"/></div>
        </div>
        <div className="field"><label>Sobre a empresa</label><textarea name="description" rows={6} defaultValue={companyRow?.description||''} placeholder="Conte sobre a empresa, cultura, atuação e oportunidades..."/></div>
        <div className="employer-form-footer"><p>Um perfil completo aumenta a confiança do candidato ao visualizar suas vagas.</p><SubmitButton idleLabel="SALVAR EMPRESA" pendingLabel="SALVANDO..."/></div>
      </form>
    </CompanyShell>
  )
}
