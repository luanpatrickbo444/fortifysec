import { Boxes, Clock3, GraduationCap, LockKeyhole, Network, Radio, Server, ShieldCheck, Zap, Activity, TerminalSquare, ArrowRight } from 'lucide-react'
import { DifficultyMeter } from '@/components/ui/DifficultyMeter'
import { requireUser } from '@/lib/auth'
import { getPlatformAccess } from '@/lib/platform-access'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type Lab = {
  id: string
  title: string
  slug: string
  description: string
  difficulty: string
  estimated_minutes: number
  tags: string[] | null
}

type RunningSession = {
  lab_id: string
  status: string
  expires_at: string | null
}

function LockedCyberRange() {
  return (
    <section className="range-access-gate">
      <div className="range-gate-icon"><LockKeyhole size={28} /></div>
      <div className="kicker">CYBER RANGE / ACCESS CONTROL</div>
      <h2>CyberLab disponível para alunos matriculados</h2>
      <p>Conclua sua matrícula em uma formação FortifySec para acessar máquinas, redes isoladas e sessões práticas.</p>
      <div className="range-gate-features">
        <span><ShieldCheck size={15} /> Ambientes isolados</span>
        <span><Network size={15} /> Sessões individuais</span>
        <span><Zap size={15} /> Prática orientada</span>
      </div>
      <a className="btn" href="/painel/cursos"><GraduationCap size={16} /> VER MINHA FORMAÇÃO →</a>
    </section>
  )
}

function RangeEmpty() {
  return (
    <section className="range-empty-panel">
      <div className="range-empty-icon"><TerminalSquare size={30} /></div>
      <div>
        <span className="section-index">RANGE STATUS</span>
        <h2>Nenhum laboratório publicado ainda</h2>
        <p>Seu acesso está ativo. Assim que o administrador publicar um Lab, ele aparecerá automaticamente nesta área.</p>
      </div>
      <div className="range-empty-steps">
        <div><strong>01</strong><span>Lab publicado pelo administrador</span></div>
        <div><strong>02</strong><span>Target aparece no catálogo</span></div>
        <div><strong>03</strong><span>Você inicia uma sessão isolada</span></div>
      </div>
    </section>
  )
}

export default async function LabsPage() {
  const { user, supabase } = await requireUser()
  const access = await getPlatformAccess(user.id)

  if (!access.canAccessCyberRange) {
    return (
      <div className="internal-route-page" data-route="painel-labs-locked">
        <section className="internal-hero range-hero">
          <div>
            <div className="kicker">CYBER RANGE / LABS</div>
            <h1>Máquinas & Labs</h1>
            <p>Ambientes práticos isolados para executar técnicas dentro de um escopo controlado.</p>
          </div>
          <div className="internal-hero-badge locked"><LockKeyhole size={18} /><span>STATUS</span><strong>LOCKED</strong></div>
        </section>
        <div className="range-overview-strip">
          <div><small>ACCESS</small><strong>MATRÍCULA NECESSÁRIA</strong></div>
          <div><small>NETWORK</small><strong>ISOLATED RANGE</strong></div>
          <div><small>SESSION</small><strong>INDIVIDUAL</strong></div>
        </div>
        <LockedCyberRange />
      </div>
    )
  }

  const [{ data: labsData, error: labsError }, { data: sessionsData, error: sessionsError }] = await Promise.all([
    supabase.from('labs').select('id,title,slug,description,difficulty,estimated_minutes,tags').eq('published', true).order('created_at', { ascending: false }),
    supabase.from('lab_sessions').select('lab_id,status,expires_at').eq('user_id', user.id).eq('status', 'running'),
  ])

  const labs = (labsData || []) as Lab[]
  const sessions = (sessionsData || []) as RunningSession[]
  const running = new Map(sessions.map((session) => [session.lab_id, session]))

  return (
    <div className="internal-route-page" data-route="painel-labs">
      <section className="internal-hero range-hero">
        <div>
          <div className="kicker">CYBER RANGE / LABS</div>
          <h1>Máquinas & Labs</h1>
          <p>Escolha um alvo, abra o briefing e provisione sua sessão dentro do Cyber Range FortifySec.</p>
        </div>
        <div className="internal-hero-badge online"><Radio size={18} /><span>RANGE</span><strong>ONLINE</strong></div>
      </section>

      <div className="range-overview-strip">
        <div><small>TARGETS</small><strong>{labs.length} DISPONÍVEIS</strong></div>
        <div><small>SESSIONS</small><strong>{sessions.length} EM EXECUÇÃO</strong></div>
        <div><small>ACCESS</small><strong>VERIFIED</strong></div>
      </div>

      {(labsError || sessionsError) && (
        <div className="inline-diagnostic">
          <strong>Não foi possível carregar todos os dados do Cyber Range.</strong>
          <span>{labsError?.message || sessionsError?.message}</span>
        </div>
      )}

      {labs.length > 0 ? (
        <section className="lab-grid enhanced-grid">
          {labs.map((lab) => {
            const session = running.get(lab.id)
            return (
              <article className={`lab-card product-card ${session ? 'is-running' : ''}`} key={lab.id}>
                <div className="lab-cover">
                  <div className="cover-topline"><span className="cover-code">LAB://{lab.slug.toUpperCase()}</span><Boxes size={18} /></div>
                  <div className="lab-scanline" />
                </div>
                <div className="lab-body">
                  <div className="panel-head"><span className={`pill ${session ? 'active' : ''}`}>{session ? '● RUNNING' : 'READY'}</span><DifficultyMeter difficulty={lab.difficulty} /></div>
                  <h3>{lab.title}</h3>
                  <p className="muted card-copy">{lab.description || 'Ambiente prático FortifySec.'}</p>
                  <div className="lab-specs"><span><Clock3 size={13} />{lab.estimated_minutes} min</span><span><Network size={13} />{session ? 'sessão ativa' : 'isolated range'}</span></div>
                  <div className="tag-row">{(lab.tags || []).slice(0, 4).map((tag) => <span className="micro-tag" key={tag}>#{tag}</span>)}</div>
                  <a className="btn full-btn" href={`/painel/labs/${lab.slug}`}>{session ? 'ABRIR WORKSPACE' : 'ABRIR LAB'} <ArrowRight size={14} /></a>
                </div>
              </article>
            )
          })}
        </section>
      ) : <RangeEmpty />}

      <section className="range-help-grid">
        <article><Activity size={18} /><strong>Como funciona</strong><span>Abra um alvo e inicie uma sessão temporária.</span></article>
        <article><ShieldCheck size={18} /><strong>Escopo controlado</strong><span>Use somente os ambientes disponibilizados.</span></article>
        <article><Server size={18} /><strong>Estado da sessão</strong><span>Targets ativos aparecem como RUNNING.</span></article>
      </section>
    </div>
  )
}
