import { Eye, EyeOff, PlusCircle, Swords, Zap } from 'lucide-react'
import { DashboardShell } from '@/components/DashboardShell'
import { DifficultyMeter } from '@/components/ui/DifficultyMeter'
import { SubmitButton } from '@/components/ui/SubmitButton'
import { requireAdmin } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { adminCreateChallengeAction, adminToggleChallengePublishedAction } from '@/app/actions'

export default async function AdminChallenges({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string; criado?: string }>
}) {
  const query = await searchParams
  await requireAdmin()
  const admin = createAdminClient()
  const [{ data: rows }, { data: labs }] = await Promise.all([
    admin
      .from('challenges')
      .select('id,title,slug,description,category,difficulty,xp_reward,published,lab_id,labs(title)')
      .order('created_at', { ascending: false }),
    admin.from('labs').select('id,title,slug,published,provider_lab_id').eq('published', true).order('title'),
  ])

  return (
    <DashboardShell admin>
      <div className="page-head internal-page-head">
        <div>
          <div className="kicker">ADMIN / CHALLENGE CONTROL</div>
          <h1>Challenges</h1>
          <p>Crie missões práticas, associe um alvo de Lab quando necessário e controle quando entram no catálogo ou em um CTF.</p>
        </div>
        <span className="pill active"><Swords size={13}/>{(rows || []).length} MISSÕES</span>
      </div>

      {query.erro && <div className="alert danger-alert">{query.erro}</div>}
      {query.criado && <div className="alert success-alert">Challenge publicado e gravado no Supabase.</div>}

      <div className="admin-studio-grid">
        <form action={adminCreateChallengeAction} className="card content-studio">
          <div className="studio-header">
            <div><span className="section-index">NEW CHALLENGE</span><h2>Nova missão</h2><p>Cadastre briefing, dificuldade, recompensa, flag e alvo opcional.</p></div>
            <PlusCircle size={27}/>
          </div>
          <div className="two-col">
            <div className="field"><label>Título</label><input name="title" required/></div>
            <div className="field"><label>Slug</label><input name="slug" required/></div>
            <div className="field">
              <label>Categoria</label>
              <select name="category"><option>Web</option><option>Linux</option><option>Windows</option><option>Crypto</option><option>Forensics</option><option>OSINT</option><option>Cloud</option><option>Mobile</option></select>
            </div>
            <div className="field">
              <label>Dificuldade</label>
              <select name="difficulty"><option>Easy</option><option>Medium</option><option>Hard</option><option>Insane</option></select>
            </div>
            <div className="field"><label><Zap size={12}/> XP</label><input name="xp_reward" type="number" min="0" defaultValue="50"/></div>
            <div className="field"><label>Flag</label><input name="flag" required placeholder="FORTIFY{...}" autoComplete="off"/></div>
          </div>
          <div className="field">
            <label>Alvo / Lab com VPN (opcional)</label>
            <select name="lab_id">
              <option value="">Sem alvo — challenge lógico/arquivo</option>
              {(labs || []).map((l: any) => <option key={l.id} value={l.id}>{l.title} · {l.provider_lab_id || l.slug}</option>)}
            </select>
          </div>
          <div className="field"><label>Descrição curta</label><textarea name="description" rows={3}/></div>
          <div className="field"><label>Briefing</label><textarea name="briefing" rows={7}/></div>
          <SubmitButton idleLabel="PUBLICAR CHALLENGE →" pendingLabel="PUBLICANDO..."/>
        </form>

        <aside className="card studio-guide">
          <span className="section-index">MISSION DESIGN</span>
          <h3>Padrão do desafio</h3>
          <div className="guide-step"><strong>01</strong><div><b>Objetivo claro</b><span>O operador precisa saber o que está buscando.</span></div></div>
          <div className="guide-step"><strong>02</strong><div><b>Alvo isolado</b><span>Para Web/Linux/Windows, associe um Cyber Lab com Provider ID.</span></div></div>
          <div className="guide-step"><strong>03</strong><div><b>CTF ready</b><span>Depois vincule a missão a um evento.</span></div></div>
        </aside>
      </div>

      <section className="admin-resource-grid">
        {(rows || []).map((c: any) => {
          const lab = Array.isArray(c.labs) ? c.labs[0] : c.labs
          return (
            <article className="card admin-resource-card" key={c.id}>
              <div className="panel-head">
                <span className={`pill ${c.published ? 'active' : 'locked'}`}>
                  {c.published ? <><Eye size={11}/> PUBLICADO</> : <><EyeOff size={11}/> RASCUNHO</>}
                </span>
                <DifficultyMeter difficulty={c.difficulty}/>
              </div>
              <span className="section-index">{c.category}</span>
              <h3>{c.title}</h3>
              <p>{c.description || 'Sem descrição.'}</p>
              <div className="meta-row"><span>{lab ? `TARGET: ${lab.title}` : 'SEM TARGET'}</span><span>+{c.xp_reward} XP</span></div>
              <form action={adminToggleChallengePublishedAction}>
                <input type="hidden" name="challenge_id" value={c.id}/>
                <input type="hidden" name="published" value={String(c.published)}/>
                <SubmitButton className="btn secondary" idleLabel={c.published ? 'RETIRAR DO CATÁLOGO' : 'PUBLICAR'} pendingLabel="ATUALIZANDO..."/>
              </form>
            </article>
          )
        })}
      </section>
    </DashboardShell>
  )
}
