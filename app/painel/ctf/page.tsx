import { RadioTower, Swords, Trophy } from 'lucide-react'
import { SubmitButton } from '@/components/ui/SubmitButton'
import { requireUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { joinCtfAction } from '@/app/actions'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function PageHead({ hasLiveEvent = false }: { hasLiveEvent?: boolean }) {
  return (
    <div className="page-head internal-page-head">
      <div>
        <div className="kicker">COMPETE / CTF</div>
        <h1>Capture The Flag</h1>
        <p>Inscreva-se nos eventos, resolva as missões e dispute o ranking específico de cada CTF.</p>
      </div>
      <span className={`pill ${hasLiveEvent ? 'active' : ''}`}>
        <RadioTower size={13} />
        {hasLiveEvent ? 'EVENTO AO VIVO' : 'COMPETITION HUB'}
      </span>
    </div>
  )
}

export default async function Ctf() {
  const { user } = await requireUser()

  let admin
  try {
    admin = createAdminClient()
  } catch {
    return (
      <>
        <PageHead />
        <div className="empty-state">CTFs temporariamente indisponíveis. Tente novamente em instantes.</div>
      </>
    )
  }

  // Primeiro carregamos SOMENTE o catálogo de CTFs. Se não houver eventos,
  // encerramos a renderização aqui. Isso evita consultas/ações secundárias no
  // estado vazio e impede ciclos de navegação quando o banco ainda não possui CTFs.
  const { data: events, error: eventsError } = await admin
    .from('ctf_events')
    .select('id,title,description,starts_at,ends_at,prize_text,status')
    .order('starts_at', { ascending: false })
    .limit(20)

  if (eventsError) {
    return (
      <>
        <PageHead />
        <div className="empty-state">Não foi possível carregar os CTFs agora. Tente novamente.</div>
      </>
    )
  }

  if (!events?.length) {
    return (
      <>
        <PageHead />
        <div className="empty-state">Nenhum CTF disponível ainda.</div>
      </>
    )
  }

  // Só precisamos consultar inscrições quando existem eventos para mostrar.
  // Se essa consulta falhar, o catálogo continua funcionando e apenas considera
  // o usuário como ainda não inscrito.
  const { data: participants } = await admin
    .from('ctf_participants')
    .select('event_id')
    .eq('user_id', user.id)

  const joined = new Set((participants || []).map((p: any) => p.event_id))
  const live = events.find((e: any) => e.status === 'live')

  return (
    <>
      <PageHead hasLiveEvent={Boolean(live)} />

      <div className="challenge-grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))' }}>
        {events.map((e: any) => {
          const isJoined = joined.has(e.id)
          const ended = e.status === 'finished' || new Date(e.ends_at).getTime() <= Date.now()

          return (
            <article className={`challenge-card ctf-player-card ${e.status}`} key={e.id}>
              <div className="challenge-top" />
              <div className="challenge-body">
                <div className="panel-head">
                  <span className={`pill ${e.status === 'live' ? 'active' : ''}`}>{String(e.status).toUpperCase()}</span>
                  <Trophy size={17} />
                </div>
                <h2>{e.title}</h2>
                <p className="muted">{e.description}</p>
                <div className="meta-row">
                  <span>INÍCIO {new Date(e.starts_at).toLocaleString('pt-BR')}</span>
                  <span>FIM {new Date(e.ends_at).toLocaleString('pt-BR')}</span>
                </div>
                <div className="meta-row">
                  <span>{e.prize_text || 'PRÊMIO A DEFINIR'}</span>
                  <span>{isJoined ? 'INSCRITO' : 'NÃO INSCRITO'}</span>
                </div>

                {isJoined ? (
                  <a className="btn full-btn" href={`/painel/ctf/${e.id}`}>
                    <Swords size={15} /> ABRIR EVENTO →
                  </a>
                ) : ended ? (
                  <button className="btn secondary full-btn" disabled>
                    EVENTO ENCERRADO
                  </button>
                ) : (
                  <form action={joinCtfAction}>
                    <input type="hidden" name="event_id" value={e.id} />
                    <SubmitButton className="btn full-btn" idleLabel="ENTRAR NO CTF →" pendingLabel="INSCREVENDO..." />
                  </form>
                )}
              </div>
            </article>
          )
        })}
      </div>
    </>
  )
}
