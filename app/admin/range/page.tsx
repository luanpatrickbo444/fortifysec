import { Activity, Boxes, Gauge, ServerCog, ShieldCheck, Swords, Trophy } from 'lucide-react'
import { DashboardShell } from '@/components/DashboardShell'
import { SubmitButton } from '@/components/ui/SubmitButton'
import { requireAdmin } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { getRangeProvidersHealth } from '@/lib/range-provider'
import {
  adminCreateLabTemplateAction,
  adminMapChallengeSkillAction,
  adminStopRangeSessionAction,
  adminUpdateCtfSecurityAction,
  adminUpdateRangePlanAction,
} from '@/app/actions'

export const dynamic='force-dynamic'
export const revalidate=0

export default async function AdminRangePage(){
 await requireAdmin();const admin=createAdminClient()
 const [providers,activeResult,templatesResult,plansResult,auditResult,eventsResult,challengesResult,skillsResult]=await Promise.all([
  getRangeProvidersHealth(),
  admin.from('lab_sessions').select('id,user_id,lab_id,challenge_id,ctf_event_id,provider_session_id,provider_base_url,provider_kind,estimated_cost_cents,started_at,expires_at,profiles(name,email),labs(title)').eq('status','running').order('started_at',{ascending:false}).limit(100),
  admin.from('lab_templates').select('id,provider_lab_id,title,provider,image_ref,machine_type,default_ttl_minutes,estimated_cost_cents_per_hour,published').order('created_at',{ascending:false}),
  admin.from('range_plan_limits').select('code,max_concurrent_sessions,max_ttl_minutes,monthly_minutes').order('code'),
  admin.from('range_audit_log').select('id,event_type,user_id,lab_id,challenge_id,ctf_event_id,provider_session_id,details,created_at').order('created_at',{ascending:false}).limit(30),
  admin.from('ctf_events').select('id,title,status,starts_at,ends_at,freeze_at,max_attempts_per_minute').order('starts_at',{ascending:false}).limit(30),
  admin.from('challenges').select('id,title,slug,published,dynamic_flag_enabled').eq('published',true).order('title'),
  admin.from('skills').select('code,name,category').order('category').order('name'),
 ])
 const active=activeResult.data||[];const templates=templatesResult.data||[];const plans=plansResult.data||[];const audit=auditResult.data||[];const events=eventsResult.data||[];const challenges=challengesResult.data||[];const skills=skillsResult.data||[]
 const cost=active.reduce((sum:number,s:any)=>sum+Number(s.estimated_cost_cents||0),0)
 const healthy=providers.filter(p=>p.ok).length
 return <DashboardShell admin>
  <div className="page-head internal-page-head"><div><div className="kicker">ADMIN / RANGE OPERATIONS</div><h1>Cyber Range Control</h1><p>Capacidade, sessões, templates, anti-cheat, quotas e telemetria do Range.</p></div><span className={`pill ${healthy?'active':''}`}><Activity size={13}/>{healthy}/{providers.length||0} PROVIDERS</span></div>

  <div className="admin-command-grid">
   <article className="stat-card admin-command-card"><ServerCog size={19}/><small>PROVIDERS ONLINE</small><div className="stat">{healthy}</div><span className="mono">HEALTH CHECK</span></article>
   <article className="stat-card admin-command-card"><Boxes size={19}/><small>SESSÕES ATIVAS</small><div className="stat">{active.length}</div><span className="mono">RUNNING</span></article>
   <article className="stat-card admin-command-card"><Gauge size={19}/><small>CUSTO ESTIMADO</small><div className="stat">R$ {(cost/100).toFixed(2).replace('.',',')}</div><span className="mono">SESSÕES ATUAIS</span></article>
   <article className="stat-card admin-command-card"><ShieldCheck size={19}/><small>TEMPLATES</small><div className="stat">{templates.length}</div><span className="mono">CATÁLOGO</span></article>
  </div>

  <section className="card" style={{marginBottom:22}}><div className="panel-head"><div><span className="section-index">PROVIDER HEALTH</span><h2>Capacidade do cluster</h2></div><ServerCog size={20}/></div><div className="activity-list">{providers.map(p=><div className="activity-row" key={p.baseUrl}><span className={`pill ${p.ok?'active':'locked'}`}>{p.ok?'ONLINE':'OFFLINE'}</span><div><strong>{p.baseUrl}</strong><span>{p.error||`${p.sessions} sessões · ${p.availableSlots??'—'} slots livres`}</span></div><strong>{p.maxSessions??'—'} MAX</strong></div>)}{!providers.length&&<div className="empty-state">Configure LAB_PROVIDER_API_URL ou LAB_PROVIDER_API_URLS na Vercel.</div>}</div></section>

  <div className="admin-live-grid">
   <section className="card"><div className="panel-head"><div><span className="section-index">ACTIVE SESSIONS</span><h3>Sessões em execução</h3></div><Boxes size={18}/></div><div className="activity-list">{active.map((s:any)=><div className="activity-row" key={s.id}><span className="pill active">RUNNING</span><div><strong>{s.profiles?.name||s.profiles?.email||'Usuário'} · {s.labs?.title||'Lab'}</strong><span>{s.provider_kind||'provider'} · expira {s.expires_at?new Date(s.expires_at).toLocaleString('pt-BR'):'—'}</span></div><form action={adminStopRangeSessionAction}><input type="hidden" name="session_id" value={s.id}/><SubmitButton className="btn secondary" idleLabel="ENCERRAR" pendingLabel="ENCERRANDO..."/></form></div>)}{!active.length&&<div className="empty-state">Nenhuma sessão ativa.</div>}</div></section>
   <section className="card"><div className="panel-head"><div><span className="section-index">AUDIT FEED</span><h3>Eventos recentes</h3></div><Activity size={18}/></div><div className="activity-list">{audit.map((a:any)=><div className="activity-row" key={a.id}><span className="pill">{String(a.event_type).toUpperCase()}</span><div><strong>{a.provider_session_id||a.challenge_id||a.lab_id||'Range'}</strong><span>{new Date(a.created_at).toLocaleString('pt-BR')}</span></div></div>)}{!audit.length&&<div className="empty-state">Nenhum evento de Range registrado.</div>}</div></section>
  </div>

  <div className="admin-studio-grid" style={{marginTop:22}}>
   <form action={adminCreateLabTemplateAction} className="card content-studio"><div className="studio-header"><div><span className="section-index">LAB TEMPLATE</span><h2>Novo template</h2><p>Catálogo de imagens e custo estimado do provider.</p></div><ServerCog size={27}/></div><div className="two-col"><div className="field"><label>Provider Lab ID</label><input required name="provider_lab_id"/></div><div className="field"><label>Título</label><input required name="title"/></div><div className="field"><label>Provider</label><select name="provider"><option value="gcp_vm">Google Cloud VM</option><option value="local_docker">Local Docker</option></select></div><div className="field"><label>Machine type</label><input name="machine_type" placeholder="e2-small"/></div><div className="field"><label>TTL padrão (min)</label><input name="default_ttl_minutes" type="number" min="15" defaultValue="60"/></div><div className="field"><label>Custo/hora (centavos)</label><input name="estimated_cost_cents_per_hour" type="number" min="0" defaultValue="0"/></div></div><div className="field"><label>Imagem / referência</label><input name="image_ref" placeholder="projects/.../images/..."/></div><SubmitButton idleLabel="SALVAR TEMPLATE →" pendingLabel="SALVANDO..."/></form>
   <aside className="card studio-guide"><span className="section-index">TEMPLATES</span><h3>{templates.length} cadastrados</h3>{templates.slice(0,8).map((t:any)=><div className="guide-step" key={t.id}><strong>{String(t.provider).includes('gcp')?'GCP':'DKR'}</strong><div><b>{t.title}</b><span>{t.provider_lab_id} · {t.default_ttl_minutes} min · R$ {(Number(t.estimated_cost_cents_per_hour||0)/100).toFixed(2).replace('.',',')}/h</span></div></div>)}</aside>
  </div>

  <div className="admin-studio-grid" style={{marginTop:22}}>
   <section className="card content-studio"><div className="studio-header"><div><span className="section-index">PLAN QUOTAS</span><h2>Limites de sessão</h2><p>Controle de concorrência, TTL e franquia mensal.</p></div><Gauge size={27}/></div>{plans.map((p:any)=><form action={adminUpdateRangePlanAction} key={p.code} className="card" style={{marginTop:12}}><input type="hidden" name="code" value={p.code}/><div className="panel-head"><strong>{String(p.code).toUpperCase()}</strong><span className="pill">PLAN</span></div><div className="two-col"><div className="field"><label>Sessões simultâneas</label><input name="max_concurrent_sessions" type="number" min="0" defaultValue={p.max_concurrent_sessions}/></div><div className="field"><label>TTL máximo</label><input name="max_ttl_minutes" type="number" min="15" defaultValue={p.max_ttl_minutes}/></div><div className="field"><label>Minutos/mês</label><input name="monthly_minutes" type="number" min="0" defaultValue={p.monthly_minutes}/></div></div><SubmitButton className="btn secondary" idleLabel="SALVAR LIMITES" pendingLabel="SALVANDO..."/></form>)}</section>
   <section className="card content-studio"><div className="studio-header"><div><span className="section-index">CTF SECURITY</span><h2>Anti-cheat</h2><p>Rate limit e freeze do leaderboard por evento.</p></div><Trophy size={27}/></div><form action={adminUpdateCtfSecurityAction}><div className="field"><label>Evento</label><select required name="event_id" defaultValue=""><option value="" disabled>Selecione...</option>{events.map((e:any)=><option value={e.id} key={e.id}>{e.title} · {e.status}</option>)}</select></div><div className="two-col"><div className="field"><label>Tentativas/minuto</label><input name="max_attempts_per_minute" type="number" min="3" max="120" defaultValue="10"/></div><div className="field"><label>Freeze do ranking</label><input name="freeze_at" type="datetime-local"/></div></div><SubmitButton idleLabel="SALVAR SEGURANÇA →" pendingLabel="SALVANDO..."/></form></section>
  </div>

  <section className="card" style={{marginTop:22}}><div className="panel-head"><div><span className="section-index">VERIFIED SKILLS</span><h2>Mapear skill ao Challenge</h2></div><Swords size={20}/></div><form action={adminMapChallengeSkillAction}><div className="two-col"><div className="field"><label>Challenge</label><select required name="challenge_id" defaultValue=""><option value="" disabled>Selecione...</option>{challenges.map((c:any)=><option key={c.id} value={c.id}>{c.title}{c.dynamic_flag_enabled?' · DYNAMIC FLAG':''}</option>)}</select></div><div className="field"><label>Skill</label><select required name="skill_code" defaultValue=""><option value="" disabled>Selecione...</option>{skills.map((s:any)=><option key={s.code} value={s.code}>{s.category} · {s.name}</option>)}</select></div><div className="field"><label>Peso</label><input name="weight" type="number" min="1" max="10" defaultValue="1"/></div></div><SubmitButton idleLabel="MAPEAR SKILL →" pendingLabel="SALVANDO..."/></form></section>
 </DashboardShell>
}
