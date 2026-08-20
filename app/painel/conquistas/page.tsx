import { Award, ShieldCheck, Sparkles, Trophy } from 'lucide-react'
import { requireUser } from '@/lib/auth'

export const dynamic='force-dynamic'
export const revalidate=0

export default async function ConquistasPage(){
 const {supabase,user}=await requireUser()
 const [skillsResult,badgesResult,solvesResult]=await Promise.all([
  supabase.from('user_skill_xp').select('skill_code,xp,skills(name,category)').eq('user_id',user.id).order('xp',{ascending:false}),
  supabase.from('user_badges').select('badge_code,awarded_at,badges(name,description,threshold_solves)').eq('user_id',user.id).order('awarded_at',{ascending:false}),
  supabase.from('challenge_solves').select('id',{count:'exact',head:true}).eq('user_id',user.id),
 ])
 const skills=skillsResult.data||[]
 const badges=badgesResult.data||[]
 const solves=solvesResult.count||0
 const totalSkillXp=skills.reduce((sum:number,row:any)=>sum+Number(row.xp||0),0)
 return <>
  <div className="page-head internal-page-head"><div><div className="kicker">OPERATOR / VERIFIED PROGRESS</div><h1>Skills & Conquistas</h1><p>Progresso técnico calculado a partir de Challenges realmente resolvidos.</p></div><span className="pill active"><ShieldCheck size={13}/> VERIFIED</span></div>

  <div className="profile-stats-grid">
   <div className="stat-card accent"><Trophy size={18}/><small>CHALLENGES</small><div className="stat">{solves}</div></div>
   <div className="stat-card"><Sparkles size={18}/><small>SKILL XP</small><div className="stat">{totalSkillXp}</div></div>
   <div className="stat-card"><Award size={18}/><small>BADGES</small><div className="stat">{badges.length}</div></div>
   <div className="stat-card"><ShieldCheck size={18}/><small>SKILLS</small><div className="stat">{skills.length}</div></div>
  </div>

  <div className="admin-live-grid" style={{marginTop:22}}>
   <section className="card"><div className="panel-head"><div><span className="section-index">VERIFIED SKILLS</span><h3>Competências validadas</h3></div><ShieldCheck size={18}/></div><div className="activity-list">{skills.map((row:any)=>{const skill=Array.isArray(row.skills)?row.skills[0]:row.skills;return <div className="activity-row" key={row.skill_code}><span className="pill active">{String(row.skill_code).toUpperCase()}</span><div><strong>{skill?.name||row.skill_code}</strong><span>{skill?.category||'Cybersecurity'}</span></div><strong>{row.xp} XP</strong></div>})}{!skills.length&&<div className="empty-state">Resolva Challenges mapeados para começar a construir suas Skills verificadas.</div>}</div></section>

   <section className="card"><div className="panel-head"><div><span className="section-index">BADGES</span><h3>Conquistas</h3></div><Award size={18}/></div><div className="activity-list">{badges.map((row:any)=>{const badge=Array.isArray(row.badges)?row.badges[0]:row.badges;return <div className="activity-row" key={row.badge_code}><span className="pill active"><Award size={12}/> BADGE</span><div><strong>{badge?.name||row.badge_code}</strong><span>{badge?.description||'Conquista verificada'} · {new Date(row.awarded_at).toLocaleDateString('pt-BR')}</span></div></div>})}{!badges.length&&<div className="empty-state">Sua primeira badge é liberada ao concluir o primeiro Challenge verificado.</div>}</div></section>
  </div>
 </>
}
