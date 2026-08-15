import { notFound, redirect } from 'next/navigation'
import { Clock3, Copy, Crosshair, Network, Power, Radio, ShieldCheck, TerminalSquare } from 'lucide-react'
import { DashboardShell } from '@/components/DashboardShell'
import { DifficultyMeter } from '@/components/ui/DifficultyMeter'
import { SubmitButton } from '@/components/ui/SubmitButton'
import { requireUser } from '@/lib/auth'
import { startLabAction, stopLabAction } from '@/app/actions'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPlatformAccess } from '@/lib/platform-access'

export default async function LabPage({params,searchParams}:{params:Promise<{slug:string}>,searchParams:Promise<{erro?:string}>}){
 const {slug}=await params;const query=await searchParams; const {user}=await requireUser()
 const access=await getPlatformAccess(user.id)
 if(!access.canAccessCyberRange)redirect('/painel/labs')
 const admin=createAdminClient();
 const {data:lab}=await admin.from('labs').select('id,title,slug,description,difficulty,estimated_minutes,tags,instructions').eq('slug',slug).eq('published',true).maybeSingle()
 if(!lab)notFound();
 const {data:session}=await admin.from('lab_sessions').select('id,status,started_at,expires_at,connection_url').eq('user_id',user.id).eq('lab_id',lab.id).eq('status','running').gt('expires_at',new Date().toISOString()).order('started_at',{ascending:false}).limit(1).maybeSingle()
 return <DashboardShell admin={access.isAdmin}>
   <div className="lab-workspace-head"><div><div className="kicker">CYBER RANGE / ACTIVE TARGET</div><h1>{lab.title}</h1><p>{lab.description}</p></div><div className="workspace-status"><span className={`status-orb ${session?'online':'offline'}`}/><div><small>SESSION STATUS</small><strong>{session?'RUNNING':'OFFLINE'}</strong></div></div></div>
   {query.erro==='provider'&&<div className="alert danger-alert">Não foi possível provisionar o laboratório. Verifique o provider ou tente novamente.</div>}
   <div className="lab-workspace-grid">
     <section className="workspace-main">
       <div className="card mission-card"><div className="panel-head"><div><span className="section-index">01</span><h3>Mission briefing</h3></div><DifficultyMeter difficulty={lab.difficulty}/></div><p className="muted briefing-text" style={{whiteSpace:'pre-wrap'}}>{lab.instructions||'Leia o objetivo, inicie a sessão e acesse o ambiente somente dentro do escopo autorizado. Documente seus passos e mantenha a atividade limitada ao ambiente FortifySec.'}</p><div className="tag-row">{(lab.tags||[]).map((t:string)=><span className="micro-tag" key={t}>#{t}</span>)}</div></div>
       <div className="card terminal-panel"><div className="terminal-toolbar"><span><TerminalSquare size={15}/> RANGE CONSOLE</span><span className={`pill ${session?'active':''}`}>{session?'CONNECTED':'WAITING'}</span></div><div className="lab-console workspace-console"><div><strong>fortify@range</strong>:~$ status --target {lab.slug}</div><br/>{session?<><div>[+] auth .............. <strong>verified</strong></div><div>[+] target ............ {lab.slug}</div><div>[+] session ........... <strong>running</strong></div><div>[+] started ........... {new Date(session.started_at).toLocaleString('pt-BR')}</div><div>[+] expires ........... {session.expires_at?new Date(session.expires_at).toLocaleString('pt-BR'):'—'}</div><br/><div className="terminal-cyan">connection_endpoint:</div><div className="endpoint-text">{session.connection_url||'Provider conectado, endpoint ainda não informado.'}</div></>:<><div>[-] session ........... offline</div><div>[-] endpoint .......... hidden</div><br/><div>Use <span className="terminal-green">INICIAR LAB</span> para solicitar uma sessão autorizada.</div></>}</div></div>
     </section>
     <aside className="workspace-side">
       <div className="card target-card"><div className="panel-head"><span className="section-index">TARGET</span><Crosshair size={19}/></div><div className="target-row"><span><Clock3 size={14}/> TTL</span><strong>{lab.estimated_minutes} MIN</strong></div><div className="target-row"><span><Network size={14}/> NETWORK</span><strong>ISOLATED</strong></div><div className="target-row"><span><ShieldCheck size={14}/> ACCESS</span><strong>VERIFIED</strong></div><div className="target-row"><span><Radio size={14}/> STATE</span><strong className={session?'terminal-green':''}>{session?'ONLINE':'OFFLINE'}</strong></div></div>
       <div className="card session-control"><span className="section-index">SESSION CONTROL</span><h3>{session?'Ambiente em execução':'Pronto para iniciar'}</h3><p className="muted">{session?'Encerre a sessão quando terminar para liberar os recursos do range.':'Prepare-se: o ambiente será provisionado para sua sessão.'}</p>{session?<form action={stopLabAction}><input type="hidden" name="lab_id" value={lab.id}/><input type="hidden" name="slug" value={lab.slug}/><SubmitButton className="btn danger full-btn" idleLabel="ENCERRAR SESSÃO" pendingLabel="ENCERRANDO..."/></form>:<form action={startLabAction}><input type="hidden" name="lab_id" value={lab.id}/><input type="hidden" name="slug" value={lab.slug}/><SubmitButton className="btn full-btn" idleLabel="INICIAR LAB →" pendingLabel="PROVISIONANDO LAB..."/></form>}<div className="security-note"><Power size={14}/><span>Sessão isolada e temporária para sua prática.</span></div></div>
     </aside>
   </div>
 </DashboardShell>
}
