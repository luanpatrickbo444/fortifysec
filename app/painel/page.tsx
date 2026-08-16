import Link from 'next/link'
import { CheckCircle2, GraduationCap, LockKeyhole, Swords, Trophy, Zap, Flag, Target, ArrowRight } from 'lucide-react'
import { DifficultyMeter } from '@/components/ui/DifficultyMeter'
import { requireUser } from '@/lib/auth'
import { getPlatformAccess } from '@/lib/platform-access'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type Challenge = {
  id: string
  title: string
  slug: string
  description: string
  category: string
  difficulty: string
  xp_reward: number
}

function ChallengeEmpty() {
  return (
    <section className="range-empty-panel">
      <div className="range-empty-icon"><Flag size={30} /></div>
      <div>
        <span className="section-index">MISSION QUEUE</span>
        <h2>Nenhum Challenge publicado ainda</h2>
        <p>Seu acesso está ativo. Novas missões aparecerão aqui quando forem liberadas pelo administrador.</p>
      </div>
      <div className="range-empty-steps">
        <div><strong>01</strong><span>Leia o briefing</span></div>
        <div><strong>02</strong><span>Encontre a flag</span></div>
        <div><strong>03</strong><span>Envie e receba XP</span></div>
      </div>
    </section>
  )
}

export default async function ChallengesPage() {
  const { user, supabase } = await requireUser()
  const access = await getPlatformAccess(user.id)

  if (!access.canAccessCyberRange) {
    return (
      <div className="internal-route-page" data-route="painel-desafios-locked">
        <section className="internal-hero challenge-hero">
          <div>
            <div className="kicker">CYBER RANGE / CHALLENGES</div>
            <h1>Challenges</h1>
            <p>Missões técnicas para validar conhecimento, capturar flags e construir seu ranking.</p>
          </div>
          <div className="internal-hero-badge locked"><LockKeyhole size={18} /><span>STATUS</span><strong>LOCKED</strong></div>
        </section>
        <div className="range-overview-strip">
          <div><small>MISSIONS</small><strong>LOCKED</strong></div>
          <div><small>REWARD</small><strong>XP + RANKING</strong></div>
          <div><small>ACCESS</small><strong>MATRÍCULA NECESSÁRIA</strong></div>
        </div>
        <section className="range-access-gate compact-gate">
          <div className="range-gate-icon"><Swords size={28} /></div>
          <div className="kicker">CHALLENGE ACCESS</div>
          <h2>Missões vinculadas à sua formação</h2>
          <p>Ative sua formação para liberar Challenges, submissão de flags e progressão técnica.</p>
          <div className="range-gate-features"><span><Zap size={15} /> XP por solução</span><span><Trophy size={15} /> Ranking técnico</span></div>
          <Link className="btn" href="/painel/cursos"><GraduationCap size={16} /> VER MINHA FORMAÇÃO →</Link>
        </section>
      </div>
    )
  }

  const [{ data: challengeData, error: challengeError }, { data: solveData, error: solveError }] = await Promise.all([
    supabase.from('challenges').select('id,title,slug,description,category,difficulty,xp_reward').eq('published', true).order('created_at', { ascending: false }),
    supabase.from('challenge_solves').select('challenge_id').eq('user_id', user.id),
  ])

  const challenges = (challengeData || []) as Challenge[]
  const solved = new Set((solveData || []).map((row: { challenge_id: string }) => row.challenge_id))

  return (
    <div className="internal-route-page" data-route="painel-desafios">
      <section className="internal-hero challenge-hero">
        <div>
          <div className="kicker">CYBER RANGE / CHALLENGES</div>
          <h1>Challenges</h1>
          <p>Resolva missões, capture flags e transforme prática em XP e posição no ranking.</p>
        </div>
        <div className="internal-hero-badge online"><Target size={18} /><span>MISSIONS</span><strong>ACTIVE</strong></div>
      </section>

      <div className="range-overview-strip challenge-overview">
        <div><small>AVAILABLE</small><strong>{challenges.length} MISSÕES</strong></div>
        <div><small>PWNED</small><strong>{solved.size} SOLVED</strong></div>
        <div><small>PROGRESSION</small><strong>XP + RANKING</strong></div>
      </div>

      {(challengeError || solveError) && (
        <div className="inline-diagnostic">
          <strong>Não foi possível carregar todos os dados dos Challenges.</strong>
          <span>{challengeError?.message || solveError?.message}</span>
        </div>
      )}

      {challenges.length > 0 ? (
        <section className="challenge-grid enhanced-grid">
          {challenges.map((challenge) => {
            const done = solved.has(challenge.id)
            return (
              <article className={`challenge-card product-card ${done ? 'is-solved' : ''}`} key={challenge.id}>
                <div className="challenge-top" />
                <div className="challenge-body">
                  <div className="panel-head"><span className={`pill ${done ? 'active' : ''}`}>{done ? <><CheckCircle2 size={12} /> PWNED</> : challenge.category}</span><DifficultyMeter difficulty={challenge.difficulty} /></div>
                  <h3>{challenge.title}</h3>
                  <p className="muted card-copy">{challenge.description || 'Missão prática FortifySec.'}</p>
                  <div className="challenge-reward"><span>REWARD</span><strong>+{challenge.xp_reward} XP</strong></div>
                  <Link className="btn full-btn" href={`/painel/desafios/${challenge.slug}`}>{done ? 'REVISAR MISSÃO' : 'ABRIR CHALLENGE'} <ArrowRight size={14} /></Link>
                </div>
              </article>
            )
          })}
        </section>
      ) : <ChallengeEmpty />}

      <section className="range-help-grid">
        <article><Flag size={18} /><strong>Capture a flag</strong><span>Cada missão possui um objetivo técnico específico.</span></article>
        <article><Zap size={18} /><strong>Ganhe XP</strong><span>Soluções válidas aumentam sua progressão.</span></article>
        <article><Trophy size={18} /><strong>Suba no ranking</strong><span>Seu desempenho vira evidência técnica.</span></article>
      </section>
    </div>
  )
}
