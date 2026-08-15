import { notFound } from 'next/navigation'
import { DashboardShell } from '@/components/DashboardShell'
import { requireUser } from '@/lib/auth'
import { startLabAction, stopLabAction } from '@/app/actions'
import { createAdminClient } from '@/lib/supabase/admin'

export default async function LabPage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params; const {supabase,user}=await requireUser()
 const [{data:profile},{data:lab},{data:access}]=await Promise.all([
  supabase.from('profiles').select('role').eq('id',user.id).single(),
  supabase.from('labs').select('id,title,slug,description,difficulty,estimated_minutes,tags,instructions').eq('slug',slug).eq('published',true).maybeSingle(),
  supabase.from('enrollments').select('id').eq('user_id',user.id).eq('status','active').limit(1).maybeSingle()
 ])
 if(!lab)notFound(); if(!access)return <DashboardShell admin={profile?.role==='admin'}><div className="lockedbox"><h2>Lab bloqueado</h2><p className="muted">Uma matrícula ativa é obrigatória para iniciar ambientes.</p></div></DashboardShell>
 const admin=createAdminClient(); const {data:session}=await admin.from('lab_sessions').select('id,status,started_at,expires_at,connection_url').eq('user_id',user.id).eq('lab_id',lab.id).eq('status','running').gt('expires_at',new Date().toISOString()).order('started_at',{ascending:false}).limit(1).maybeSingle()
 return <DashboardShell admin={profile?.role==='admin'}><div className="page-head"><div><div className="kicker">LAB / {lab.slug.toUpperCase()}</div><h1>{lab.title}</h1><p>{lab.description}</p></div><span className={`pill ${session?'active':'locked'}`}>{session?'SESSION RUNNING':'SESSION OFFLINE'}</span></div><div className="two-col"><div className="card"><div className="panel-head"><h3>Briefing</h3><span className="tag green">{lab.difficulty}</span></div><p className="muted" style={{whiteSpace:'pre-wrap'}}>{lab.instructions||'Leia o objetivo, inicie a sessão e acesse o ambiente somente dentro do escopo autorizado.'}</p><div className="meta-row"><span>TTL {lab.estimated_minutes} MIN</span>{(lab.tags||[]).map((t:string)=><span key={t}>#{t}</span>)}</div>{session?<form action={stopLabAction}><input type="hidden" name="lab_id" value={lab.id}/><button className="btn danger">ENCERRAR SESSÃO</button></form>:<form action={startLabAction}><input type="hidden" name="lab_id" value={lab.id}/><input type="hidden" name="slug" value={lab.slug}/><button className="btn">INICIAR LAB →</button></form>}</div><div className="lab-console"><div><strong>fortify@range</strong>:~$ session status</div><br/>{session?<><div>[+] status: <strong>RUNNING</strong></div><div>[+] started: {new Date(session.started_at).toLocaleString('pt-BR')}</div><div>[+] expires: {session.expires_at?new Date(session.expires_at).toLocaleString('pt-BR'):'—'}</div><br/><div>[+] endpoint:</div><div style={{wordBreak:'break-all',color:'#e4ece9'}}>{session.connection_url||'Provider não configurado pelo administrador.'}</div></>:<><div>[-] no active session</div><div>[-] endpoint hidden</div><br/><div>Execute <span style={{color:'#9fef00'}}>INICIAR LAB</span> para solicitar uma sessão.</div></>}</div></div></DashboardShell>
}
