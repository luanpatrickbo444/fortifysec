import Link from 'next/link'
import { Flag, RadioTower, Swords, Trophy } from 'lucide-react'
import { DifficultyMeter } from '@/components/ui/DifficultyMeter'
import { requireUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function EventUnavailable({
  title,
  message,
}: {
  title: string
  message: string
}) {
  return (
    <>
      <div className="page-head internal-page-head">
        <div>
          <div className="kicker">COMPETE / CTF</div>
          <h1>{title}</h1>
          <p>{message}</p>
        </div>
        <span className="pill">CTF</span>
      </div>
      <div className="empty-state">
        <p>{message}</p>
        <a className="btn secondary" href="/painel/ctf">VOLTAR AOS CTFs →</a>
      </div>
    </>
  )
}

export default async function CtfEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { user } = await requireUser()

  // O detalhe nunca redireciona para o próprio hub. Um ID antigo/inválido deve
  // renderizar um estado estável, evitando ciclos do App Router/RSC.
  let admin
  try {
    admin = createAdminClient()
  } catch {
    return (
      <EventUnavailable
        title="CTF temporariamente indisponível"
        message="Não foi possível acessar o serviço de CTF agora."
      />
    )
  }

  // Primeiro confirma que o evento realmente existe. Só depois carregamos o
  // restante do dashboard do CTF.
  const { data: event, error: eventError } = await admin
    .from('ctf_events')
    .select('id,title,description,starts_at,ends_at,prize_text,status')
    .eq('id', id)
    .maybeSingle()

  if (eventError || !event) {
    return (
      <EventUnavailable
        title="CTF não encontrado"
        message="Este evento não existe mais ou ainda não foi publicado."
      />
    )
  }

  const { data: participant, error: participantError } = await admin
    .from('ctf_participants')
    .select('event_id,joined_at')
    .eq('event_id', id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (participantError || !participant) {
    return (
      <EventUnavailable
        title={event.title}
        message="Você ainda não está inscrito neste CTF. Volte ao hub para entrar no evento."
      />
    )
  }

  const [linksResult, rankingResult, solvesResult] = await Promise.all([
    admin
      .from('ctf_event_challenges')
      .select('event_id,challenge_id,position,points_override,challenges(id,title,slug,category,difficulty,xp_reward,published,lab_id)')
      .eq('event_id', id)
      .order('position'),
    admin.rpc('get_ctf_leaderboard', { event_uuid: id, limit_count: 50 }),
    admin
      .from('ctf_solves')
      .select('challenge_id,points,solved_at')
      .eq('event_id', id)
      .eq('user_id', user.id),
  ])

  const links = (linksResult.data || []).filter((link: any) => {
    const challenge = Array.isArray(link.challenges) ? link.challenges[0] : link.challenges
    return Boolean(challenge?.published)
  })
  const ranking = rankingResult.data || []
  const solves = solvesResult.data || []
  const solved = new Map(solves.map((s: any) => [s.challenge_id, s]))
  const live =
    event.status === 'live' &&
    Date.now() >= new Date(event.starts_at).getTime() &&
    Date.now() <= new Date(event.ends_at).getTime()

  return (
    <>
      <div className="page-head internal-page-head">
        <div>
          <div className="kicker">CTF / EVENT CONTROL</div>
          <h1>{event.title}</h1>
          <p>{event.description}</p>
        </div>
        <span className={`pill ${live ? 'active' : ''}`}>
          <RadioTower size={13} />
          {live ? 'AO VIVO' : String(event.status).toUpperCase()}
        </span>
      </div>

      <div className="meta-row" style={{ marginBottom: 22 }}>
        <span>INÍCIO {new Date(event.starts_at).toLocaleString('pt-BR')}</span>
        <span>FIM {new Date(event.ends_at).toLocaleString('pt-BR')}</span>
        <span>{event.prize_text || 'PRÊMIO A DEFINIR'}</span>
      </div>

      <div className="content-grid ctf-student-layout">
        <section>
          <div className="section-head">
            <div>
              <span className="section-index">MISSIONS</span>
              <h2>Challenges do evento</h2>
            </div>
            <p className="section-copy">Challenges com alvo podem provisionar uma máquina isolada e VPN exclusiva para sua sessão.</p>
          </div>

          <div className="challenge-grid" style={{ gridTemplateColumns: '1fr' }}>
            {links.map((l: any) => {
              const c = Array.isArray(l.challenges) ? l.challenges[0] : l.challenges
              const ownSolve = solved.get(l.challenge_id)
              const points = l.points_override ?? c?.xp_reward ?? 0

              return (
                <Link
                  href={live ? `/painel/desafios/${c?.slug}?ctf=${encodeURIComponent(id)}` : '#'}
                  className={`ctf-player-challenge ${!live ? 'locked' : ''}`}
                  key={l.challenge_id}
                >
                  <span className="rank">#{String(l.position).padStart(2, '0')}</span>
                  <Swords size={15} />
                  <div>
                    <strong>{c?.title}</strong>
                    <small>
                      {c?.category} · {points} PTS {c?.lab_id ? '· VPN TARGET' : ''}
                    </small>
                  </div>
                  <DifficultyMeter difficulty={c?.difficulty} />
                  <span className={`pill ${ownSolve ? 'active' : ''}`}>{ownSolve ? 'PWNED' : live ? 'OPEN' : 'LOCKED'}</span>
                </Link>
              )
            })}
          </div>
          {!links.length && <div className="empty-state">Nenhum Challenge vinculado a este evento.</div>}
        </section>

        <aside className="card">
          <div className="panel-head">
            <div>
              <span className="section-index">EVENT RANK</span>
              <h3>Leaderboard</h3>
            </div>
            <Trophy size={18} />
          </div>
          <div className="activity-list">
            {ranking.map((r: any, i: number) => (
              <div className={`activity-row ${r.user_id === user.id ? 'current-user-row' : ''}`} key={r.user_id}>
                <span className="rank">#{i + 1}</span>
                <div>
                  <strong>{r.name}</strong>
                  <span>{r.solves} solves</span>
                </div>
                <strong>{r.points} PTS</strong>
              </div>
            ))}
          </div>
          {!ranking.length && (
            <div className="empty-state">
              <Flag size={18} /> Nenhum solve ainda.
            </div>
          )}
        </aside>
      </div>
    </>
  )
}
