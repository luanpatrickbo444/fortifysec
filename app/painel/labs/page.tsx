import Link from 'next/link'
import { Boxes, Clock3, LockKeyhole, Network } from 'lucide-react'
import { DashboardShell } from '@/components/DashboardShell'
import { requireUser } from '@/lib/auth'

export default async function Labs(){
 const {supabase,user}=await requireUser()
 const [{data:profile},{data:labs},{data:enrollment},{data:sessions}]=await Promise.all([
  supabase.from('profiles').select('role').eq('id',user.id).single(),
  supabase.from('labs').select('id,title,slug,description,difficulty,estimated_minutes,tags,published').eq('published',true).order('created_at',{ascending:false}),
  supabase.from('enrollments').select('id').eq('user_id',user.id).eq('status','active').limit(1).maybeSingle(),
  supabase.from('lab_sessions').select('lab_id,status').eq('user_id',user.id).eq('status','running')
 ])
 const running=new Set((sessions||[]).map((s:any)=>s.lab_id)); const hasAccess=!!enrollment
 return <DashboardShell admin={profile?.role==='admin'}><div className="page-head"><div><div className="kicker">CYBER RANGE / LABS</div><h1>Máquinas & Labs</h1><p>Ambientes controlados. A conexão só é revelada após validação de acesso no backend.</p></div><span className={`pill ${hasAccess?'active':'locked'}`}>{hasAccess?'RANGE ACCESS: ACTIVE':'RANGE ACCESS: LOCKED'}</span></div><div className="lab-grid">{(labs||[]).map((lab:any)=><article className="lab-card" key={lab.id}><div className="lab-cover"><span className="cover-code">LAB://{lab.slug.toUpperCase()}</span></div><div className="lab-body"><div className="panel-head"><span className={`pill ${hasAccess?'active':'locked'}`}>{running.has(lab.id)?'RUNNING':hasAccess?'READY':'LOCKED'}</span><Boxes size={18}/></div><h3>{lab.title}</h3><p className="muted">{lab.description}</p><div className="meta-row"><span><Network size={11}/> {lab.difficulty}</span><span><Clock3 size={11}/> {lab.estimated_minutes} MIN</span>{(lab.tags||[]).slice(0,2).map((t:string)=><span key={t}>#{t}</span>)}</div>{hasAccess?<Link className="btn" href={`/painel/labs/${lab.slug}`}>{running.has(lab.id)?'ABRIR SESSÃO':'VER LAB'} →</Link>:<button className="btn secondary" disabled><LockKeyhole size={15}/> MATRÍCULA NECESSÁRIA</button>}</div></article>)}</div>{!labs?.length&&<div className="empty-state">Nenhum Lab publicado pelo administrador.</div>}</DashboardShell>
}
