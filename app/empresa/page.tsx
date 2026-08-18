import Link from 'next/link'
import { Bookmark, BookmarkCheck, BriefcaseBusiness, Github, Linkedin, Search, ShieldCheck, SlidersHorizontal, Target, TerminalSquare, UsersRound } from 'lucide-react'
import { CompanyShell } from '@/components/CompanyShell'
import { requireCompany } from '@/lib/auth'
import { companyRemoveTalentAction, companySaveTalentAction } from '@/app/actions'
import { SubmitButton } from '@/components/ui/SubmitButton'

type SearchParams={q?:string;availability?:string;minxp?:string;sort?:string;saved?:string}

export default async function CompanyTalents({searchParams}:{searchParams:Promise<SearchParams>}){
  const params=await searchParams
  const {supabase,company}=await requireCompany()
  const [talentResult,shortlistResult]=await Promise.all([
    supabase.from('profiles').select('id,name,headline,xp,open_to_work,github_url,linkedin_url').eq('profile_public',true).eq('blocked',false).order('xp',{ascending:false}).limit(100),
    supabase.from('company_talent_shortlist').select('talent_user_id').eq('company_id',company.id),
  ])
  const {data:talentRows}=talentResult
  const {data:savedRows,error:shortlistError}=shortlistResult

  const savedIds=new Set((savedRows||[]).map((row:any)=>row.talent_user_id))
  const q=String(params.q||'').trim().toLowerCase()
  const minXp=Math.max(0,Number(params.minxp||0)||0)
  const onlyOpen=params.availability==='open'
  const onlySaved=params.saved==='1'
  const sort=params.sort==='name'?'name':'xp'

  let talents=(talentRows||[]).filter((t:any)=>{
    const matchesText=!q||`${t.name||''} ${t.headline||''}`.toLowerCase().includes(q)
    return matchesText && (!onlyOpen||t.open_to_work) && Number(t.xp||0)>=minXp && (!onlySaved||savedIds.has(t.id))
  })
  talents=[...talents].sort((a:any,b:any)=>sort==='name'?String(a.name||'').localeCompare(String(b.name||''),'pt-BR'):Number(b.xp||0)-Number(a.xp||0))

  const ids=talents.map((t:any)=>t.id)
  const [{data:solves},{data:sessions}]=ids.length?await Promise.all([
    supabase.from('challenge_solves').select('user_id').in('user_id',ids),
    supabase.from('lab_sessions').select('user_id').in('user_id',ids).eq('status','stopped'),
  ]):[{data:[]},{data:[]}]
  const solveCount=new Map<string,number>()
  const sessionCount=new Map<string,number>()
  for(const row of solves||[])solveCount.set((row as any).user_id,(solveCount.get((row as any).user_id)||0)+1)
  for(const row of sessions||[])sessionCount.set((row as any).user_id,(sessionCount.get((row as any).user_id)||0)+1)

  return (
    <CompanyShell companyName={company.name} verified={company.verified}>
      <div className="page-head internal-page-head employer-page-head">
        <div><div className="kicker">EMPLOYER / TALENT SEARCH</div><h1>Encontrar talentos</h1><p>Pesquise profissionais com perfil público e sinais de evolução prática dentro da FortifySec.</p></div>
        <span className="pill active"><UsersRound size={13}/>{talents.length} RESULTADOS</span>
      </div>

      {shortlistError&&<div className="alert employer-review-alert"><Bookmark size={15}/> O Talent Search está ativo. Para habilitar shortlist, aplique a migration 007_employer_console.sql.</div>}

      <form method="get" className="card talent-search-toolbar">
        <div className="talent-search-main">
          <Search size={17}/><input name="q" defaultValue={params.q||''} placeholder="Buscar por nome ou headline: AppSec, Pentester, Cloud..."/>
        </div>
        <div className="talent-search-filters">
          <div className="field"><label>Disponibilidade</label><select name="availability" defaultValue={params.availability||'all'}><option value="all">Todos os perfis</option><option value="open">Somente Open to Work</option></select></div>
          <div className="field"><label>XP mínimo</label><select name="minxp" defaultValue={params.minxp||'0'}><option value="0">Qualquer XP</option><option value="500">500+ XP</option><option value="1000">1.000+ XP</option><option value="2500">2.500+ XP</option><option value="5000">5.000+ XP</option></select></div>
          <div className="field"><label>Ordenar</label><select name="sort" defaultValue={sort}><option value="xp">Maior XP</option><option value="name">Nome</option></select></div>
          <div className="field"><label>Lista</label><select name="saved" defaultValue={params.saved||'0'}><option value="0">Todos</option><option value="1">Minha shortlist</option></select></div>
        </div>
        <div className="talent-filter-actions"><button className="btn" type="submit"><SlidersHorizontal size={14}/> APLICAR FILTROS</button><Link className="btn secondary" href="/empresa/talentos">LIMPAR</Link></div>
      </form>

      <div className="employer-talent-grid">
        {talents.map((t:any,i:number)=>{
          const saved=savedIds.has(t.id)
          const level=Math.max(1,Math.floor(Number(t.xp||0)/1000)+1)
          return <article className="employer-talent-card" key={t.id}>
            <div className="employer-talent-top">
              <div className="talent-avatar large">{String(t.name||'?').slice(0,1).toUpperCase()}</div>
              <div className="talent-rank"><span>RANK</span><strong>#{String(i+1).padStart(2,'0')}</strong></div>
              {t.open_to_work?<span className="pill active">OPEN TO WORK</span>:<span className="pill">PUBLIC PROFILE</span>}
            </div>
            <div className="employer-talent-body">
              <span className="section-index">OPERATOR // LEVEL {level}</span>
              <h2>{t.name}</h2>
              <p>{t.headline||'Cybersecurity professional'}</p>
              <div className="talent-proof-grid">
                <div><ShieldCheck size={15}/><span>XP SCORE</span><strong>{Number(t.xp||0).toLocaleString('pt-BR')}</strong></div>
                <div><Target size={15}/><span>CHALLENGES</span><strong>{solveCount.get(t.id)||0}</strong></div>
                <div><TerminalSquare size={15}/><span>LAB SESSIONS</span><strong>{sessionCount.get(t.id)||0}</strong></div>
              </div>
              <div className="talent-card-actions">
                {t.github_url&&<a className="btn secondary small" href={t.github_url} target="_blank" rel="noreferrer"><Github size={13}/> GITHUB</a>}
                {t.linkedin_url&&<a className="btn secondary small" href={t.linkedin_url} target="_blank" rel="noreferrer"><Linkedin size={13}/> LINKEDIN</a>}
                {!shortlistError&&(saved?
                  <form action={companyRemoveTalentAction}><input type="hidden" name="talent_id" value={t.id}/><SubmitButton className="btn secondary small talent-save-btn saved" idleLabel="REMOVER DA LISTA" pendingLabel="REMOVENDO..."/></form>:
                  <form action={companySaveTalentAction}><input type="hidden" name="talent_id" value={t.id}/><SubmitButton className="btn secondary small talent-save-btn" idleLabel="SALVAR TALENTO" pendingLabel="SALVANDO..."/></form>
                )}
              </div>
              {saved&&<div className="talent-saved-indicator"><BookmarkCheck size={13}/> SALVO NA SHORTLIST DA EMPRESA</div>}
            </div>
          </article>
        })}
      </div>

      {!talents.length&&<div className="empty-state employer-talent-empty"><BriefcaseBusiness size={22}/><h3>Nenhum talento encontrado</h3><p>Ajuste os filtros ou remova o XP mínimo para ampliar a busca.</p></div>}
    </CompanyShell>
  )
}
