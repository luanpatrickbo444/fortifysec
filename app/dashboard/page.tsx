import Link from 'next/link'
import { Activity, ArrowRight, Boxes, CheckCircle2, Flag, GraduationCap, RadioTower, Swords, Trophy, Zap } from 'lucide-react'
import { DashboardShell } from '@/components/DashboardShell'
import LogoutButton from '@/components/LogoutButton'
import { requireUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

type Related<T> = T | T[] | null | undefined

function firstRelated<T>(value: Related<T>): T | null {
  if (Array.isArray(value)) return value[0] ?? null
  return value ?? null
}

async function safeData<T>(label: string, operation: () => PromiseLike<{ data: T | null; error?: unknown }>, fallback: T): Promise<T> {
  try {
    const result = await operation()
    if (result?.error) {
      console.error(`[dashboard:${label}]`, result.error)
      return fallback
    }
    return result?.data ?? fallback
  } catch (error) {
    console.error(`[dashboard:${label}]`, error)
    return fallback
  }
}

type CourseRelation = { title: string; slug: string; description?: string | null }
type EnrollmentRow = { id: string; course_id: string; status: string; courses: Related<CourseRelation> }
type ProgressRow = { lesson_id: string; completed: boolean; completed_at?: string | null }
type ChallengeRelation = { title: string; xp_reward: number }
type SolveRow = { id: string; solved_at: string; challenge_id: string; challenges: Related<ChallengeRelation> }
type LabRelation = { title: string; slug: string }
type SessionRow = { id: string; status: string; started_at: string; expires_at?: string | null; lab_id: string; labs: Related<LabRelation> }
type LabRow = { id: string; title: string; slug: string; difficulty: string; estimated_minutes: number }
type ChallengeRow = { id: string; title: string; slug: string; category: string; difficulty: string; xp_reward: number }
type EventRow = { id: string; title: string; starts_at: string; ends_at: string; prize_text?: string | null; status: string }
type RankingRow = { id: string; name: string; headline?: string | null; xp: number }
type ProfileRow = { name: string; role: string; xp: number; headline?: string | null }

export default async function DashboardPage(){
  const { supabase, user } = await requireUser()

  // Dashboard resiliente: uma área opcional nunca derruba o Command Center inteiro.
  const [profile, enrollmentsRaw, progress, solvesRaw, sessionsRaw, labs, challenges, events, ranking] = await Promise.all([
    safeData<ProfileRow | null>('profile', () => supabase.from('profiles').select('name,role,xp,headline').eq('id',user.id).maybeSingle(), null),
    safeData<EnrollmentRow[]>('enrollments', () => supabase.from('enrollments').select('id,course_id,status,courses(title,slug,description)').eq('user_id',user.id).eq('status','active'), []),
    safeData<ProgressRow[]>('progress', () => supabase.from('lesson_progress').select('lesson_id,completed,completed_at').eq('user_id',user.id).eq('completed',true).order('completed_at',{ascending:false}), []),
    safeData<SolveRow[]>('solves', () => supabase.from('challenge_solves').select('id,solved_at,challenge_id,challenges(title,xp_reward)').eq('user_id',user.id).order('solved_at',{ascending:false}).limit(5), []),
    safeData<SessionRow[]>('sessions', () => supabase.from('lab_sessions').select('id,status,started_at,expires_at,lab_id,labs(title,slug)').eq('user_id',user.id).order('started_at',{ascending:false}).limit(5), []),
    safeData<LabRow[]>('labs', () => supabase.from('labs').select('id,title,slug,difficulty,estimated_minutes').eq('published',true).limit(4), []),
    safeData<ChallengeRow[]>('challenges', () => supabase.from('challenges').select('id,title,slug,category,difficulty,xp_reward').eq('published',true).limit(4), []),
    safeData<EventRow[]>('ctf', () => supabase.from('ctf_events').select('id,title,starts_at,ends_at,prize_text,status').in('status',['scheduled','live']).order('starts_at').limit(2), []),
    safeData<RankingRow[]>('ranking', () => supabase.rpc('get_leaderboard',{limit_count:100}), []),
  ])

  const enrollments = enrollmentsRaw.map((row) => ({ ...row, course: firstRelated(row.courses) }))
  const solves = solvesRaw.map((row) => ({ ...row, challenge: firstRelated(row.challenges) }))
  const sessions = sessionsRaw.map((row) => ({ ...row, lab: firstRelated(row.labs) }))

  const courseIds = enrollments.map((e) => e.course_id).filter(Boolean)
  const courseLessons = courseIds.length
    ? await safeData<{id:string;course_id:string}[]>('course-lessons', () => supabase.from('lessons').select('id,course_id').in('course_id',courseIds), [])
    : []

  const completed = new Set(progress.map((p) => p.lesson_id))
  const totalLessons = courseLessons.length
  const pct = totalLessons ? Math.min(100, Math.round((completed.size / totalLessons) * 100)) : 0
  const running = sessions.find((session) => session.status === 'running') ?? null
  const rankIndex = ranking.findIndex((row) => row.id === user.id)
  const rank = rankIndex >= 0 ? rankIndex + 1 : 0
  const liveCtf = events.find((event) => event.status === 'live') ?? events[0] ?? null

  return <DashboardShell admin={profile?.role==='admin'}>
    <div className="page-head command-head"><div><div className="kicker">OPERATOR / COMMAND CENTER</div><h1>Bem-vindo ao range, {profile?.name||user.email}</h1><p>{profile?.headline||'Continue sua formação, entre no range e acumule experiência prática.'}</p></div><div className="hero-actions">{profile?.role==='admin'&&<Link className="btn secondary" href="/admin">OPERATIONS CONSOLE</Link>}<LogoutButton/></div></div>

    <section className="operator-command-banner">
      <div className="command-progress"><div><span className="section-index">FORMAÇÃO ATUAL</span><strong>{pct}%</strong><small>{completed.size} de {totalLessons} aulas concluídas</small></div><div className="progress"><span style={{width:`${pct}%`}}/></div></div>
      <div className="command-next">
        {running?.lab ? <><span className="status-orb online"/><div><small>LAB EM EXECUÇÃO</small><strong>{running.lab.title}</strong></div><Link className="btn" href={`/painel/labs/${running.lab.slug}`}>RETOMAR LAB →</Link></>
        : enrollments.length ? <><GraduationCap size={22}/><div><small>PRÓXIMA AÇÃO</small><strong>Continue sua formação</strong></div><Link className="btn" href="/painel/cursos">ABRIR ACADEMY →</Link></>
        : <><GraduationCap size={22}/><div><small>COMECE AQUI</small><strong>Escolha sua formação</strong></div><Link className="btn" href="/painel/cursos">VER CURSOS →</Link></>}
      </div>
    </section>

    <div className="dashboard-grid command-stats"><div className="stat-card accent"><Zap size={18}/><small>XP TOTAL</small><div className="stat">{profile?.xp||0}</div></div><div className="stat-card"><Trophy size={18}/><small>RANK GLOBAL</small><div className="stat">{rank>0?`#${rank}`:'—'}</div></div><div className="stat-card"><CheckCircle2 size={18}/><small>AULAS</small><div className="stat">{completed.size}</div></div><div className="stat-card"><Swords size={18}/><small>CHALLENGES</small><div className="stat">{solves.length}</div></div></div>

    <section className="command-grid">
      <article className="card command-panel"><div className="panel-head"><div><span className="section-index">ACADEMY</span><h2>Minha formação</h2></div><Link className="tag green" href="/painel/cursos">TODOS →</Link></div>{enrollments.length?<div className="command-course-list">{enrollments.slice(0,3).map((e)=><Link href={e.course?.slug?`/curso/${e.course.slug}`:'/painel/cursos'} className="command-course" key={e.id}><div className="activity-icon"><GraduationCap size={17}/></div><div><strong>{e.course?.title||'Curso ativo'}</strong><span>{e.course?.description||'Continuar formação'}</span></div><ArrowRight size={16}/></Link>)}</div>:<div className="empty-state">Sua formação aparecerá aqui quando você escolher um curso.</div>}</article>

      <article className="card command-panel"><div className="panel-head"><div><span className="section-index">CYBER RANGE</span><h2>Labs disponíveis</h2></div><Link className="tag green" href="/painel/labs">RANGE →</Link></div><div className="command-mini-grid">{labs.slice(0,4).map((l)=><Link href={`/painel/labs/${l.slug}`} className="command-mini-card" key={l.id}><Boxes size={17}/><div><strong>{l.title}</strong><span>{l.difficulty} · {l.estimated_minutes} min</span></div></Link>)}{!labs.length&&<div className="empty-inline">Nenhum Lab publicado.</div>}</div></article>

      <article className="card command-panel"><div className="panel-head"><div><span className="section-index">MISSIONS</span><h2>Challenges</h2></div><Link className="tag green" href="/painel/desafios">TODOS →</Link></div><div className="command-mini-grid">{challenges.slice(0,4).map((c)=><Link href={`/painel/desafios/${c.slug}`} className="command-mini-card" key={c.id}><Swords size={17}/><div><strong>{c.title}</strong><span>{c.category} · {c.difficulty} · +{c.xp_reward} XP</span></div></Link>)}{!challenges.length&&<div className="empty-inline">Nenhum Challenge publicado.</div>}</div></article>

      <article className="card command-panel ctf-command-panel"><div className="panel-head"><div><span className="section-index">COMPETE</span><h2>CTF</h2></div><RadioTower size={18}/></div>{liveCtf?<><span className={`pill ${liveCtf.status==='live'?'active':''}`}>{liveCtf.status==='live'?'AO VIVO':'PRÓXIMO EVENTO'}</span><h3>{liveCtf.title}</h3><div className="meta-row"><span>{new Date(liveCtf.starts_at).toLocaleString('pt-BR')}</span><span>{liveCtf.prize_text||'PRÊMIO A DEFINIR'}</span></div><Link className="btn secondary" href="/painel/ctf"><Flag size={15}/> ABRIR CTF →</Link></>:<div className="empty-state">Nenhum evento anunciado.</div>}</article>
    </section>

    <section className="card activity-console"><div className="panel-head"><div><span className="section-index">ACTIVITY FEED</span><h3>Atividade recente</h3></div><Activity size={18}/></div><div className="activity-list">{solves.map((s)=><div className="activity-row" key={s.id}><div className="activity-icon"><Trophy size={16}/></div><div><strong>{s.challenge?.title||'Challenge'}</strong><span>Challenge resolvido</span></div><span className="xp-score">+{s.challenge?.xp_reward||0} XP</span></div>)}{sessions.slice(0,3).map((s)=><div className="activity-row" key={s.id}><div className="activity-icon"><Boxes size={16}/></div><div><strong>{s.lab?.title||'Cyber Lab'}</strong><span>Sessão {s.status}</span></div><span className="mono">LAB</span></div>)}{!solves.length&&!sessions.length&&<div className="empty-state">Sua atividade aparecerá aqui conforme você usa a plataforma.</div>}</div></section>
  </DashboardShell>
}
