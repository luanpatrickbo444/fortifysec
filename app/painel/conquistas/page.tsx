import { Award, BadgeCheck, ShieldCheck, Sparkles } from 'lucide-react'
import { requireUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function Conquistas() {
  const { supabase, user } = await requireUser()
  const [skillResult, badgeResult, solveResult] = await Promise.all([
    supabase.from('user_skill_xp').select('skill_code,xp,skills(name,category)').eq('user_id', user.id).order('xp', { ascending: false }),
    supabase.from('user_badges').select('badge_code,awarded_at,badges(name,description)').eq('user_id', user.id).order('awarded_at', { ascending: false }),
    supabase.from('challenge_solves').select('challenge_id', { count: 'exact', head: true }).eq('user_id', user.id),
  ])

  const skills = skillResult.data || []
  const badges = badgeResult.data || []
  const missing = Boolean(skillResult.error || badgeResult.error)

  return <>
    <div className="page-head internal-page-head">
      <div><div className="kicker">PROFILE / VERIFIED SKILLS</div><h1>Conquistas</h1><p>Skills e badges calculados a partir de Challenges realmente resolvidos.</p></div>
      <span className="pill active"><BadgeCheck size={13}/>{solveResult.count || 0} SOLVES</span>
    </div>

    {missing && <div className="alert danger-alert">As tabelas de Skills ainda não estão disponíveis. O administrador precisa aplicar a migration do Cyber Range.</div>}

    <section className="stats-grid">
      <article className="stat-card"><ShieldCheck size={18}/><span>Skills verificadas</span><strong>{skills.length}</strong><small>áreas com XP técnico</small></article>
      <article className="stat-card"><Award size={18}/><span>Badges</span><strong>{badges.length}</strong><small>conquistas liberadas</small></article>
      <article className="stat-card"><Sparkles size={18}/><span>Skill XP</span><strong>{(skills as any[]).reduce((sum: number, s: any) => sum + Number(s.xp || 0), 0)}</strong><small>progresso verificado</small></article>
    </section>

    <div className="two-col">
      <section className="card">
        <div className="panel-head"><div><span className="section-index">SKILL MATRIX</span><h3>Competências verificadas</h3></div></div>
        {(skills as any[]).map((s: any) => {
          const skill = Array.isArray(s.skills) ? s.skills[0] : s.skills
          return <div className="ctf-linked-row" key={s.skill_code}>
            <ShieldCheck size={16}/><div><strong>{skill?.name || s.skill_code}</strong><small>{skill?.category || 'Cybersecurity'}</small></div><span className="xp-score">{s.xp} XP</span>
          </div>
        })}
        {!skills.length && !missing && <div className="empty-inline">Resolva Challenges mapeados para começar sua Skill Matrix.</div>}
      </section>

      <section className="card">
        <div className="panel-head"><div><span className="section-index">BADGES</span><h3>Conquistas</h3></div></div>
        {(badges as any[]).map((b: any) => {
          const badge = Array.isArray(b.badges) ? b.badges[0] : b.badges
          return <div className="ctf-linked-row" key={b.badge_code}>
            <Award size={17}/><div><strong>{badge?.name || b.badge_code}</strong><small>{badge?.description || ''}</small></div><span className="tag green">UNLOCKED</span>
          </div>
        })}
        {!badges.length && !missing && <div className="empty-inline">Seu primeiro badge chega com o primeiro Challenge resolvido.</div>}
      </section>
    </div>
  </>
}
