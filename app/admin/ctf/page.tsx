import { Flag, Link2, RadioTower, Trophy } from 'lucide-react'
import { DashboardShell } from '@/components/DashboardShell'
import { SubmitButton } from '@/components/ui/SubmitButton'
import { requireAdmin } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  adminCreateCtfAction,
  adminLinkChallengeToCtfAction,
  adminUnlinkChallengeFromCtfAction,
  adminUpdateCtfStatusAction,
} from '@/app/actions'

export default async function AdminCtf({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string; criado?: string; vinculado?: string; removido?: string; status?: string }>
}) {
  const query = await searchParams
  await requireAdmin()
  const admin = createAdminClient()
  const [{ data: events }, { data: challenges }, { data: links }] = await Promise.all([
    admin.from('ctf_events').select('*').order('starts_at', { ascending: false }),
    admin.from('challenges').select('id,title,category,difficulty,published').order('title'),
    admin.from('ctf_event_challenges').select('event_id,challenge_id,position,challenges(title,category,difficulty)').order('position'),
  ])

  const linked = new Map<string, any[]>()
  ;(links || []).forEach((l: any) => linked.set(l.event_id, [...(linked.get(l.event_id) || []), l]))
  const publishedChallenges = (challenges || []).filter((c: any) => c.published)

  return (
    <DashboardShell admin>
      <div className="page-head internal-page-head">
        <div>
          <div className="kicker">ADMIN / CTF CONTROL</div>
          <h1>Controle de CTF</h1>
          <p>Crie eventos, altere o estado da competição e monte o conjunto de Challenges de cada CTF.</p>
        </div>
        <span className="pill active"><RadioTower size={13}/>{(events || []).filter((e: any) => e.status === 'live').length} LIVE</span>
      </div>

      {query.erro && <div className="alert danger-alert">{query.erro}</div>}
      {query.criado && <div className="alert success-alert">CTF criado e gravado no Supabase.</div>}
      {query.vinculado && <div className="alert success-alert">Challenge vinculado ao CTF.</div>}
      {query.removido && <div className="alert success-alert">Challenge removido do CTF.</div>}
      {query.status && <div className="alert success-alert">Status do CTF atualizado.</div>}

      {!publishedChallenges.length && (
        <div className="alert danger-alert">
          Nenhum Challenge publicado está disponível. Crie ou publique um Challenge em /admin/desafios antes de vinculá-lo ao CTF.
        </div>
      )}

      <div className="ctf-admin-layout">
        <form action={adminCreateCtfAction} className="card">
          <div className="studio-header">
            <div><span className="section-index">NEW EVENT</span><h2>Novo CTF</h2><p>Configure a janela da competição e a premiação.</p></div>
            <Flag size={26}/>
          </div>
          <div className="two-col">
            <div className="field"><label>Título</label><input name="title" required/></div>
            <div className="field"><label>Prêmio</label><input name="prize_text" placeholder="R$ 15.000"/></div>
            <div className="field"><label>Início</label><input name="starts_at" type="datetime-local" required/></div>
            <div className="field"><label>Fim</label><input name="ends_at" type="datetime-local" required/></div>
            <div className="field">
              <label>Status inicial</label>
              <select name="status">
                <option value="scheduled">Agendado</option>
                <option value="live">Ao vivo</option>
                <option value="finished">Finalizado</option>
              </select>
            </div>
          </div>
          <div className="field"><label>Descrição</label><textarea name="description" rows={5}/></div>
          <SubmitButton idleLabel="CRIAR CTF →" pendingLabel="CRIANDO CTF..."/>
        </form>

        <aside className="card ctf-ops-summary">
          <Trophy size={28}/>
          <span className="section-index">COMPETITION OPS</span>
          <h3>{events?.length || 0} eventos configurados</h3>
          <p>Vincule Challenges já publicados e mude o estado do CTF quando a operação entrar no ar.</p>
          <div className="ctf-status-legend">
            <span><i className="status scheduled"/>AGENDADO</span>
            <span><i className="status live"/>AO VIVO</span>
            <span><i className="status finished"/>FINALIZADO</span>
          </div>
        </aside>
      </div>

      <section className="ctf-event-stack">
        {(events || []).map((e: any) => (
          <article className={`card ctf-admin-event ${e.status}`} key={e.id}>
            <header>
              <div>
                <span className={`pill ${e.status === 'live' ? 'active' : ''}`}>{String(e.status).toUpperCase()}</span>
                <h2>{e.title}</h2>
                <p>{e.description || 'Sem descrição.'}</p>
              </div>
              <div className="ctf-event-dates">
                <span>INÍCIO <b>{new Date(e.starts_at).toLocaleString('pt-BR')}</b></span>
                <span>FIM <b>{new Date(e.ends_at).toLocaleString('pt-BR')}</b></span>
                <span>PRÊMIO <b>{e.prize_text || '—'}</b></span>
              </div>
            </header>

            <div className="ctf-admin-actions">
              <form action={adminUpdateCtfStatusAction}>
                <input type="hidden" name="event_id" value={e.id}/>
                <select name="status" defaultValue={e.status}>
                  <option value="scheduled">Agendado</option>
                  <option value="live">Ao vivo</option>
                  <option value="finished">Finalizado</option>
                </select>
                <SubmitButton className="btn secondary small" idleLabel="ATUALIZAR STATUS" pendingLabel="ATUALIZANDO..."/>
              </form>

              <form action={adminLinkChallengeToCtfAction}>
                <input type="hidden" name="event_id" value={e.id}/>
                <select name="challenge_id" required disabled={!publishedChallenges.length}>
                  <option value="">Adicionar Challenge...</option>
                  {publishedChallenges.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.title} · {c.difficulty}</option>
                  ))}
                </select>
                <input name="position" type="number" min="1" defaultValue={(linked.get(e.id)?.length || 0) + 1}/>
                <SubmitButton className="btn small" idleLabel="VINCULAR" pendingLabel="VINCULANDO..."/>
              </form>
            </div>

            <div className="ctf-linked-list">
              <div className="section-index">CHALLENGES DO EVENTO</div>
              {(linked.get(e.id) || []).map((l: any) => (
                <div className="ctf-linked-row" key={l.challenge_id}>
                  <Link2 size={14}/>
                  <span className="rank">#{String(l.position).padStart(2, '0')}</span>
                  <div><strong>{l.challenges?.title}</strong><small>{l.challenges?.category} · {l.challenges?.difficulty}</small></div>
                  <form action={adminUnlinkChallengeFromCtfAction}>
                    <input type="hidden" name="event_id" value={e.id}/>
                    <input type="hidden" name="challenge_id" value={l.challenge_id}/>
                    <SubmitButton className="icon-action danger" idleLabel="REMOVER" pendingLabel="..."/>
                  </form>
                </div>
              ))}
              {!linked.get(e.id)?.length && <div className="empty-inline">Nenhum Challenge vinculado.</div>}
            </div>
          </article>
        ))}
      </section>
    </DashboardShell>
  )
}
