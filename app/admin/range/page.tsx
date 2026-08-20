import { Activity, BadgeCheck, Gauge, RadioTower, ShieldCheck, TimerReset } from 'lucide-react'
import { DashboardShell } from '@/components/DashboardShell'
import { requireAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function providerStats() {
  const base = String(process.env.LAB_PROVIDER_API_URL || '').replace(/\/$/, '')
  if (!base) return { configured: false, ok: false, error: 'LAB_PROVIDER_API_URL não configurado.' }
  try {
    const response = await fetch(`${base}/stats`, {
      cache: 'no-store',
      headers: process.env.LAB_PROVIDER_API_KEY
        ? { Authorization: `Bearer ${process.env.LAB_PROVIDER_API_KEY}` }
        : {},
    })
    if (!response.ok) return { configured: true, ok: false, error: `Provider HTTP ${response.status}` }
    return { configured: true, ok: true, ...(await response.json()) }
  } catch (error) {
    return { configured: true, ok: false, error: error instanceof Error ? error.message : 'Provider indisponível.' }
  }
}

export default async function AdminRange({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string; stopped?: string; salvo?: string; ctf?: string; skill?: string; flag?: string }>
}) {
  const query = await searchParams
  const { supabase } = await requireAdmin()

  const [stats, sessionsResult, limitsResult, eventsResult, challengesResult, skillsResult, auditResult] = await Promise.all([
    providerStats(),
    supabase.from('lab_sessions')
      .select('id,user_id,lab_id,status,provider_session_id,target_address,started_at,expires_at,profiles(name,email),labs(title,provider_lab_id)')
      .eq('status', 'running')
      .order('started_at', { ascending: false })
      .limit(100),
    supabase.from('range_plan_limits').select('*').order('code'),
    supabase.from('ctf_events').select('id,title,status,starts_at,ends_at,freeze_at,max_attempts_per_minute').order('starts_at', { ascending: false }).limit(20),
    supabase.from('challenges').select('id,title,published,lab_id,dynamic_flag_enabled').eq('published', true).order('title').limit(250),
    supabase.from('skills').select('code,name,category').order('category').order('name'),
    supabase.from('range_audit_log').select('id,event_type,user_id,lab_id,provider_session_id,details,created_at').order('created_at', { ascending: false }).limit(20),
  ])

  const migrationMissing = Boolean(
    limitsResult.error || eventsResult.error || challengesResult.error || skillsResult.error || auditResult.error
  )
  const sessions = sessionsResult.data || []
  const limits = limitsResult.data || []
  const events = eventsResult.data || []
  const challenges = challengesResult.data || []
  const skills = skillsResult.data || []
  const audit = auditResult.data || []

  return (
    <DashboardShell admin>
      <div className="page-head internal-page-head">
        <div>
          <div className="kicker">ADMIN / CYBER RANGE</div>
          <h1>Range Control</h1>
          <p>Capacidade, sessões ativas, anti-cheat, freeze do ranking e Skills verificadas.</p>
        </div>
        <span className={`pill ${stats.ok ? 'active' : ''}`}><RadioTower size={13}/>{stats.ok ? 'PROVIDER ONLINE' : 'PROVIDER OFFLINE'}</span>
      </div>

      {query.erro && <div className="alert danger-alert">{query.erro}</div>}
      {query.stopped && <div className="alert success-alert">Sessão encerrada.</div>}
      {query.salvo && <div className="alert success-alert">Limites atualizados.</div>}
      {query.ctf && <div className="alert success-alert">Proteções do CTF atualizadas.</div>}
      {query.skill && <div className="alert success-alert">Skill vinculada ao Challenge.</div>}
      {query.flag && <div className="alert success-alert">Modo de flag dinâmica atualizado.</div>}
      {migrationMissing && <div className="alert danger-alert">A migration 009_cyber_range_hardening_additive.sql ainda não está aplicada ou o schema ainda não foi recarregado.</div>}

      <section className="dashboard-grid">
        <article className="stat-card"><Gauge size={18}/><small>SESSÕES ATIVAS</small><div className="stat">{Number((stats as any).running ?? sessions.length)}</div><small>ativas agora</small></article>
        <article className="stat-card"><Activity size={18}/><small>CAPACIDADE</small><div className="stat">{Number((stats as any).capacity ?? 0)}</div><small>limite do provider</small></article>
        <article className="stat-card"><TimerReset size={18}/><small>DISPONÍVEIS</small><div className="stat">{Number((stats as any).available ?? 0)}</div><small>slots livres</small></article>
        <article className="stat-card"><ShieldCheck size={18}/><small>FLAG DINÂMICA</small><div className="stat">{(stats as any).dynamic_flags ? 'ON' : 'OFF'}</div><small>provider</small></article>
      </section>

      {!stats.ok && <div className="alert danger-alert">Range Provider: {(stats as any).error || 'indisponível'}</div>}

      <section className="card">
        <div className="panel-head"><div><span className="section-index">LIVE SESSIONS</span><h3>Máquinas ativas</h3></div><span className="mono tiny-label">{sessions.length} RUNNING</span></div>
        <div className="tablewrap">
          <table>
            <thead><tr><th>Aluno</th><th>Lab</th><th>Alvo</th><th>Expira</th><th>Ação</th></tr></thead>
            <tbody>
              {sessions.map((s: any) => {
                const profile = Array.isArray(s.profiles) ? s.profiles[0] : s.profiles
                const lab = Array.isArray(s.labs) ? s.labs[0] : s.labs
                return <tr key={s.id}>
                  <td><strong>{profile?.name || 'Usuário'}</strong><br/><small>{profile?.email || s.user_id}</small></td>
                  <td>{lab?.title || s.lab_id}<br/><small>{lab?.provider_lab_id || 'sem provider id'}</small></td>
                  <td className="mono">{s.target_address || '—'}</td>
                  <td>{s.expires_at ? new Date(s.expires_at).toLocaleString('pt-BR') : '—'}</td>
                  <td>
                    <form action="/api/admin/range/stop" method="post">
                      <input type="hidden" name="session_id" value={s.id}/>
                      <button className="btn secondary small" type="submit">ENCERRAR</button>
                    </form>
                  </td>
                </tr>
              })}
              {!sessions.length && <tr><td colSpan={5}>Nenhuma sessão ativa.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <div className="two-col">
        <section className="card">
          <div className="panel-head"><div><span className="section-index">PLAN LIMITS</span><h3>Quotas por plano</h3></div></div>
          {(limits as any[]).map((l: any) => <form key={l.code} action="/api/admin/range/settings" method="post" className="card">
            <input type="hidden" name="code" value={l.code}/>
            <strong>{String(l.code).toUpperCase()}</strong>
            <div className="three-col">
              <div className="field"><label>Sessões</label><input name="max_concurrent_sessions" type="number" min="0" max="50" defaultValue={l.max_concurrent_sessions}/></div>
              <div className="field"><label>TTL min</label><input name="max_ttl_minutes" type="number" min="15" max="720" defaultValue={l.max_ttl_minutes}/></div>
              <div className="field"><label>Min/mês</label><input name="monthly_minutes" type="number" min="0" defaultValue={l.monthly_minutes}/></div>
            </div>
            <button className="btn secondary small" type="submit">SALVAR</button>
          </form>)}
        </section>

        <section className="card">
          <div className="panel-head"><div><span className="section-index">CTF DEFENSE</span><h3>Anti-cheat e freeze</h3></div></div>
          {(events as any[]).map((e: any) => <form key={e.id} action="/api/admin/range/ctf-settings" method="post" className="card">
            <input type="hidden" name="event_id" value={e.id}/>
            <strong>{e.title}</strong><small>{String(e.status).toUpperCase()}</small>
            <div className="two-col">
              <div className="field"><label>Tentativas/min</label><input name="max_attempts_per_minute" type="number" min="3" max="120" defaultValue={e.max_attempts_per_minute || 10}/></div>
              <div className="field"><label>Freeze</label><input name="freeze_at" type="datetime-local" defaultValue={e.freeze_at ? new Date(e.freeze_at).toISOString().slice(0,16) : ''}/></div>
            </div>
            <button className="btn secondary small" type="submit">APLICAR</button>
          </form>)}
        </section>
      </div>

      <div className="two-col">
        <section className="card">
          <div className="panel-head"><div><span className="section-index">DYNAMIC FLAGS</span><h3>Flags por sessão</h3></div></div>
          <p>Ative apenas em Challenges ligados a Lab. Sem provider/secret, o CTF mantém a flag estática como fallback.</p>
          {(challenges as any[]).filter((c: any) => c.lab_id).slice(0,80).map((c: any) => <form key={c.id} action="/api/admin/range/dynamic-flag" method="post" className="ctf-linked-row">
            <input type="hidden" name="challenge_id" value={c.id}/>
            <input type="hidden" name="enabled" value={c.dynamic_flag_enabled ? 'false' : 'true'}/>
            <div><strong>{c.title}</strong><small>{c.dynamic_flag_enabled ? 'FLAG DINÂMICA ATIVA' : 'FLAG ESTÁTICA'}</small></div>
            <button className="btn secondary small" type="submit">{c.dynamic_flag_enabled ? 'DESATIVAR' : 'ATIVAR'}</button>
          </form>)}
        </section>

        <section className="card">
          <div className="panel-head"><div><span className="section-index">VERIFIED SKILLS</span><h3>Mapear Skill</h3></div><BadgeCheck size={20}/></div>
          <form action="/api/admin/range/skill-map" method="post">
            <div className="field"><label>Challenge</label><select name="challenge_id" required><option value="">Selecione...</option>{(challenges as any[]).map((c: any) => <option key={c.id} value={c.id}>{c.title}</option>)}</select></div>
            <div className="field"><label>Skill</label><select name="skill_code" required><option value="">Selecione...</option>{(skills as any[]).map((s: any) => <option key={s.code} value={s.code}>{s.category} · {s.name}</option>)}</select></div>
            <div className="field"><label>Peso</label><input name="weight" type="number" min="1" max="10" defaultValue="1"/></div>
            <button className="btn" type="submit">VINCULAR SKILL</button>
          </form>
        </section>
      </div>

      <section className="card">
        <div className="panel-head"><div><span className="section-index">AUDIT</span><h3>Eventos recentes</h3></div></div>
        <div className="tablewrap"><table><thead><tr><th>Data</th><th>Evento</th><th>Sessão</th><th>Detalhes</th></tr></thead><tbody>
          {(audit as any[]).map((a: any) => <tr key={a.id}><td>{new Date(a.created_at).toLocaleString('pt-BR')}</td><td>{a.event_type}</td><td className="mono">{a.provider_session_id || '—'}</td><td className="mono">{JSON.stringify(a.details || {})}</td></tr>)}
          {!audit.length && <tr><td colSpan={4}>Sem eventos de auditoria.</td></tr>}
        </tbody></table></div>
      </section>
    </DashboardShell>
  )
}
