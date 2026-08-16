import Link from 'next/link'
import { Activity, ArrowRight, Boxes, CheckCircle2, Flag, GraduationCap, RadioTower, Swords, Trophy, Zap } from 'lucide-react'
import { DashboardShell } from '@/components/DashboardShell'
import LogoutButton from '@/components/LogoutButton'
import { requireUser } from '@/lib/auth'
import { ensureApplicationProfile } from '@/lib/profile-sync'

export const dynamic = 'force-dynamic'

type ProfileRow = { id?: string; name?: string | null; role?: string | null; xp?: number | null; headline?: string | null }
type EnrollmentRow = { id: string; course_id: string; status: string }
type CourseRow = { id: string; title: string; slug: string; description?: string | null }
type ProgressRow = { lesson_id: string; completed: boolean; completed_at?: string | null }
type SolveRow = { id: string; solved_at?: string | null; challenge_id: string }
type ChallengeRow = { id: string; title: string; slug: string; category: string; difficulty: string; xp_reward: number }
type SessionRow = { id: string; status: string; started_at?: string | null; expires_at?: string | null; lab_id: string }
type LabRow = { id: string; title: string; slug: string; difficulty: string; estimated_minutes: number }
type EventRow = { id: string; title: string; starts_at?: string | null; ends_at?: string | null; prize_text?: string | null; status: string }
type RankingRow = { id: string; name: string; headline?: string | null; xp: number }
type LessonRow = { id: string; course_id: string | null }

type QueryResult<T> = { data: T | null; error?: unknown }

async function safeData<T>(label: string, operation: () => PromiseLike<QueryResult<T>>, fallback: T): Promise<T> {
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

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))]
}

function safeDate(value?: string | null) {
  if (!value) return 'Data a definir'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Data a definir' : date.toLocaleString('pt-BR')
}

async function renderDashboard() {
  const { supabase, user } = await requireUser()

  // Corrige automaticamente contas autenticadas que existam em auth.users mas ainda
  // não tenham sido sincronizadas em public.profiles (cenário comum em banco legado).
  const syncedProfile = await ensureApplicationProfile(user)

  const [profileFromRls, enrollments, progress, solves, sessions, labs, challenges, events, ranking] = await Promise.all([
    safeData<ProfileRow | null>('profile', () => supabase.from('profiles').select('id,name,role,xp,headline').eq('id', user.id).maybeSingle(), null),
    safeData<EnrollmentRow[]>('enrollments', () => supabase.from('enrollments').select('id,course_id,status').eq('user_id', user.id).eq('status', 'active'), []),
    safeData<ProgressRow[]>('progress', () => supabase.from('lesson_progress').select('lesson_id,completed,completed_at').eq('user_id', user.id).eq('completed', true).order('completed_at', { ascending: false }), []),
    safeData<SolveRow[]>('solves', () => supabase.from('challenge_solves').select('id,solved_at,challenge_id').eq('user_id', user.id).order('solved_at', { ascending: false }).limit(5), []),
    safeData<SessionRow[]>('sessions', () => supabase.from('lab_sessions').select('id,status,started_at,expires_at,lab_id').eq('user_id', user.id).order('started_at', { ascending: false }).limit(5), []),
    safeData<LabRow[]>('labs', () => supabase.from('labs').select('id,title,slug,difficulty,estimated_minutes').eq('published', true).limit(4), []),
    safeData<ChallengeRow[]>('challenges', () => supabase.from('challenges').select('id,title,slug,category,difficulty,xp_reward').eq('published', true).limit(4), []),
    safeData<EventRow[]>('ctf', () => supabase.from('ctf_events').select('id,title,starts_at,ends_at,prize_text,status').in('status', ['scheduled', 'live']).order('starts_at').limit(2), []),
    safeData<RankingRow[]>('ranking', () => supabase.rpc('get_leaderboard', { limit_count: 100 }), []),
  ])

  const profile: ProfileRow = profileFromRls ?? syncedProfile ?? {
    id: user.id,
    name: user.user_metadata?.name ? String(user.user_metadata.name) : user.email?.split('@')[0] || 'Aluno',
    role: 'student',
    xp: 0,
  }

  // Relações são montadas manualmente por ID. Não dependemos de FK discovery do
  // PostgREST, que costuma falhar em bancos migrados de versões antigas.
  const courseIds = unique(enrollments.map((row) => row.course_id))
  const solveChallengeIds = unique(solves.map((row) => row.challenge_id))
  const sessionLabIds = unique(sessions.map((row) => row.lab_id))

  const [courses, solvedChallenges, sessionLabs, courseLessons] = await Promise.all([
    courseIds.length
      ? safeData<CourseRow[]>('courses-by-id', () => supabase.from('courses').select('id,title,slug,description').in('id', courseIds), [])
      : Promise.resolve([] as CourseRow[]),
    solveChallengeIds.length
      ? safeData<ChallengeRow[]>('solved-challenges', () => supabase.from('challenges').select('id,title,slug,category,difficulty,xp_reward').in('id', solveChallengeIds), [])
      : Promise.resolve([] as ChallengeRow[]),
    sessionLabIds.length
      ? safeData<LabRow[]>('session-labs', () => supabase.from('labs').select('id,title,slug,difficulty,estimated_minutes').in('id', sessionLabIds), [])
      : Promise.resolve([] as LabRow[]),
    courseIds.length
      ? safeData<LessonRow[]>('course-lessons', () => supabase.from('lessons').select('id,course_id').in('course_id', courseIds), [])
      : Promise.resolve([] as LessonRow[]),
  ])

  const coursesById = new Map(courses.map((row) => [row.id, row]))
  const challengesById = new Map([...challenges, ...solvedChallenges].map((row) => [row.id, row]))
  const labsById = new Map([...labs, ...sessionLabs].map((row) => [row.id, row]))

  const completed = new Set(progress.map((row) => row.lesson_id))
  const totalLessons = courseLessons.length
  const pct = totalLessons ? Math.min(100, Math.round((completed.size / totalLessons) * 100)) : 0
  const runningSession = sessions.find((row) => row.status === 'running') ?? null
  const runningLab = runningSession ? labsById.get(runningSession.lab_id) ?? null : null
  const rankIndex = ranking.findIndex((row) => row.id === user.id)
  const rank = rankIndex >= 0 ? rankIndex + 1 : 0
  const liveCtf = events.find((event) => event.status === 'live') ?? events[0] ?? null

  return <DashboardShell admin={String(profile.role) === 'admin'}>
    <div className="page-head command-head">
      <div>
        <div className="kicker">OPERATOR / COMMAND CENTER</div>
        <h1>Bem-vindo ao range, {profile.name || user.email || 'Aluno'}</h1>
        <p>{profile.headline || 'Continue sua formação, entre no range e acumule experiência prática.'}</p>
      </div>
      <div className="hero-actions">
        {String(profile.role) === 'admin' && <Link className="btn secondary" href="/admin">OPERATIONS CONSOLE</Link>}
        <LogoutButton/>
      </div>
    </div>

    {!syncedProfile && !profileFromRls && <div className="notice warning">Sua conta foi autenticada, mas o perfil da plataforma ainda está sendo sincronizado. O painel continua disponível.</div>}

    <section className="operator-command-banner">
      <div className="command-progress">
        <div><span className="section-index">FORMAÇÃO ATUAL</span><strong>{pct}%</strong><small>{completed.size} de {totalLessons} aulas concluídas</small></div>
        <div className="progress"><span style={{ width: `${pct}%` }}/></div>
      </div>
      <div className="command-next">
        {runningSession && runningLab ? <><span className="status-orb online"/><div><small>LAB EM EXECUÇÃO</small><strong>{runningLab.title}</strong></div><Link className="btn" href={`/painel/labs/${runningLab.slug}`}>RETOMAR LAB →</Link></>
        : enrollments.length ? <><GraduationCap size={22}/><div><small>PRÓXIMA AÇÃO</small><strong>Continue sua formação</strong></div><Link className="btn" href="/painel/cursos">ABRIR ACADEMY →</Link></>
        : <><GraduationCap size={22}/><div><small>COMECE AQUI</small><strong>Escolha sua formação</strong></div><Link className="btn" href="/painel/cursos">VER CURSOS →</Link></>}
      </div>
    </section>

    <div className="dashboard-grid command-stats">
      <div className="stat-card accent"><Zap size={18}/><small>XP TOTAL</small><div className="stat">{Number(profile.xp || 0)}</div></div>
      <div className="stat-card"><Trophy size={18}/><small>RANK GLOBAL</small><div className="stat">{rank > 0 ? `#${rank}` : '—'}</div></div>
      <div className="stat-card"><CheckCircle2 size={18}/><small>AULAS</small><div className="stat">{completed.size}</div></div>
      <div className="stat-card"><Swords size={18}/><small>CHALLENGES</small><div className="stat">{solves.length}</div></div>
    </div>

    <section className="command-grid">
      <article className="card command-panel">
        <div className="panel-head"><div><span className="section-index">ACADEMY</span><h2>Minha formação</h2></div><Link className="tag green" href="/painel/cursos">TODOS →</Link></div>
        {enrollments.length ? <div className="command-course-list">{enrollments.slice(0, 3).map((enrollment) => {
          const course = coursesById.get(enrollment.course_id)
          return <Link href={course?.slug ? `/curso/${course.slug}` : '/painel/cursos'} className="command-course" key={enrollment.id}><div className="activity-icon"><GraduationCap size={17}/></div><div><strong>{course?.title || 'Curso ativo'}</strong><span>{course?.description || 'Continuar formação'}</span></div><ArrowRight size={16}/></Link>
        })}</div> : <div className="empty-state">Sua formação aparecerá aqui quando você escolher um curso.</div>}
      </article>

      <article className="card command-panel">
        <div className="panel-head"><div><span className="section-index">CYBER RANGE</span><h2>Labs disponíveis</h2></div><Link className="tag green" href="/painel/labs">RANGE →</Link></div>
        <div className="command-mini-grid">{labs.slice(0, 4).map((lab) => <Link href={`/painel/labs/${lab.slug}`} className="command-mini-card" key={lab.id}><Boxes size={17}/><div><strong>{lab.title}</strong><span>{lab.difficulty} · {lab.estimated_minutes} min</span></div></Link>)}{!labs.length && <div className="empty-inline">Nenhum Lab publicado.</div>}</div>
      </article>

      <article className="card command-panel">
        <div className="panel-head"><div><span className="section-index">MISSIONS</span><h2>Challenges</h2></div><Link className="tag green" href="/painel/desafios">TODOS →</Link></div>
        <div className="command-mini-grid">{challenges.slice(0, 4).map((challenge) => <Link href={`/painel/desafios/${challenge.slug}`} className="command-mini-card" key={challenge.id}><Swords size={17}/><div><strong>{challenge.title}</strong><span>{challenge.category} · {challenge.difficulty} · +{challenge.xp_reward} XP</span></div></Link>)}{!challenges.length && <div className="empty-inline">Nenhum Challenge publicado.</div>}</div>
      </article>

      <article className="card command-panel ctf-command-panel">
        <div className="panel-head"><div><span className="section-index">COMPETE</span><h2>CTF</h2></div><RadioTower size={18}/></div>
        {liveCtf ? <><span className={`pill ${liveCtf.status === 'live' ? 'active' : ''}`}>{liveCtf.status === 'live' ? 'AO VIVO' : 'PRÓXIMO EVENTO'}</span><h3>{liveCtf.title}</h3><div className="meta-row"><span>{safeDate(liveCtf.starts_at)}</span><span>{liveCtf.prize_text || 'PRÊMIO A DEFINIR'}</span></div><Link className="btn secondary" href="/painel/ctf"><Flag size={15}/> ABRIR CTF →</Link></> : <div className="empty-state">Nenhum evento anunciado.</div>}
      </article>
    </section>

    <section className="card activity-console">
      <div className="panel-head"><div><span className="section-index">ACTIVITY FEED</span><h3>Atividade recente</h3></div><Activity size={18}/></div>
      <div className="activity-list">
        {solves.map((solve) => { const challenge = challengesById.get(solve.challenge_id); return <div className="activity-row" key={solve.id}><div className="activity-icon"><Trophy size={16}/></div><div><strong>{challenge?.title || 'Challenge'}</strong><span>Challenge resolvido</span></div><span className="xp-score">+{challenge?.xp_reward || 0} XP</span></div> })}
        {sessions.slice(0, 3).map((session) => { const lab = labsById.get(session.lab_id); return <div className="activity-row" key={session.id}><div className="activity-icon"><Boxes size={16}/></div><div><strong>{lab?.title || 'Cyber Lab'}</strong><span>Sessão {session.status}</span></div><span className="mono">LAB</span></div> })}
        {!solves.length && !sessions.length && <div className="empty-state">Sua atividade aparecerá aqui conforme você usa a plataforma.</div>}
      </div>
    </section>
  </DashboardShell>
}

export default async function DashboardPage() {
  try {
    return await renderDashboard()
  } catch (error) {
    console.error('[dashboard:fatal]', error)
    // Fallback de último nível: mantém a sessão e oferece navegação útil sem derrubar a rota.
    return <DashboardShell>
      <div className="page-head"><div><div className="kicker">FORTIFYSEC / COMMAND CENTER</div><h1>Painel disponível em modo seguro</h1><p>Uma fonte de dados ainda não respondeu como esperado. Você pode continuar usando a Academy e os módulos da plataforma.</p></div><LogoutButton/></div>
      <div className="dashboard-grid">
        <Link className="stat-card" href="/painel/cursos"><GraduationCap size={18}/><small>ACADEMY</small><div className="stat">ABRIR</div></Link>
        <Link className="stat-card" href="/painel/labs"><Boxes size={18}/><small>LABS</small><div className="stat">ABRIR</div></Link>
        <Link className="stat-card" href="/painel/desafios"><Swords size={18}/><small>CHALLENGES</small><div className="stat">ABRIR</div></Link>
        <Link className="stat-card" href="/painel/ranking"><Trophy size={18}/><small>RANKING</small><div className="stat">ABRIR</div></Link>
      </div>
    </DashboardShell>
  }
}
