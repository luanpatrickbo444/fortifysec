import Link from 'next/link'
import { CheckCircle2, LockKeyhole, Swords, Trophy } from 'lucide-react'
import { DashboardShell } from '@/components/DashboardShell'
import { DifficultyMeter } from '@/components/ui/DifficultyMeter'
import { requireUser } from '@/lib/auth'

export default async function Challenges(){
 const {supabase,user}=await requireUser()
 const [{data:p},{data:challenges},{data:solves},{data:access}]=await Promise.all([
  supabase.from('profiles').select('role').eq('id',user.id).single(),
  supabase.from('challenges').select('id,title,slug,description,category,difficulty,xp_reward').eq('published',true).order('created_at',{ascending:false}),
  supabase.from('challenge_solves').select('challenge_id').eq('user_id',user.id),
  supabase.from('enrollments').select('id').eq('user_id',user.id).eq('status','active').limit(1).maybeSingle()
 ])
 const solved=new Set((solves||[]).map((s:any)=>s.challenge_id));
 return <DashboardShell admin={p?.role==='admin'}>
   <div className="page-head internal-page-head"><div><div className="kicker">CYBER RANGE / CHALLENGES</div><h1>Challenges</h1><p>Resolva missões, envie flags e acumule XP comprovado.</p></div><div className="head-stats"><span className={`pill ${access?'active':'locked'}`}>{access?'ACCESS ACTIVE':'LOCKED'}</span><span className="pill"><Trophy size={12}/>{solved.size} PWNED</span></div></div>
   <div className="challenge-grid enhanced-grid">{(challenges||[]).map((c:any)=><article className={`challenge-card product-card ${solved.has(c.id)?'is-solved':''}`} key={c.id}><div className="challenge-top"/><div className="challenge-body"><div className="panel-head"><span className={`pill ${solved.has(c.id)?'active':''}`}>{solved.has(c.id)?<><CheckCircle2 size={12}/> PWNED</>:c.category}</span><DifficultyMeter difficulty={c.difficulty}/></div><h3>{c.title}</h3><p className="muted card-copy">{c.description}</p><div className="challenge-reward"><span>REWARD</span><strong>+{c.xp_reward} XP</strong></div><div className="card-actions"><Link className={`btn ${!access?'secondary':''}`} href={access?`/painel/desafios/${c.slug}`:'/painel/cursos'}>{access?(solved.has(c.id)?'REVISAR MISSÃO':'ABRIR CHALLENGE'):<><LockKeyhole size={14}/> LIBERAR ACESSO</>} →</Link></div></div></article>)}</div>
   {!challenges?.length&&<div className="empty-state">Nenhum Challenge publicado.</div>}
 </DashboardShell>
}
