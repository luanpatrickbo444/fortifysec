import Link from 'next/link'
import { BookOpenCheck, LockKeyhole, ShieldCheck, Zap } from 'lucide-react'
import { DashboardShell } from '@/components/DashboardShell'
import { CheckoutForm } from '@/components/ui/CheckoutForm'
import { requireUser } from '@/lib/auth'

export default async function Cursos(){
 const {supabase,user}=await requireUser()
 const [{data:profile},{data:courses},{data:enrollments},{data:lessons},{data:progress}]=await Promise.all([
  supabase.from('profiles').select('role,xp').eq('id',user.id).single(),
  supabase.from('courses').select('id,title,slug,description,price_cents,published').eq('published',true).order('created_at'),
  supabase.from('enrollments').select('course_id,status').eq('user_id',user.id),
  supabase.from('lessons').select('id,course_id').order('position'),
  supabase.from('lesson_progress').select('lesson_id,completed').eq('user_id',user.id).eq('completed',true)
 ])
 const enrollmentMap=new Map((enrollments||[]).map((e:any)=>[e.course_id,e.status]))
 const done=new Set((progress||[]).map((p:any)=>p.lesson_id))
 const lessonIdsByCourse=new Map<string,string[]>()
 for(const lesson of lessons||[]){const arr=lessonIdsByCourse.get((lesson as any).course_id)||[];arr.push((lesson as any).id);lessonIdsByCourse.set((lesson as any).course_id,arr)}
 const activeCount=(enrollments||[]).filter((e:any)=>e.status==='active').length

 return <DashboardShell admin={profile?.role==='admin'}>
  <div className="page-head internal-page-head"><div><div className="kicker">ACADEMY / COURSES</div><h1>FortifySec Academy</h1><p>Trilhas técnicas com progresso validado pelo servidor e acesso protegido por matrícula.</p></div><div className="head-stats"><span className="pill active"><BookOpenCheck size={13}/> {activeCount} ATIVAS</span><span className="pill"><Zap size={13}/> {profile?.xp||0} XP</span></div></div>
  <div className="coursegrid enhanced-grid">{(courses||[]).map((c:any)=>{
    const status=enrollmentMap.get(c.id);const active=status==='active';const ids=lessonIdsByCourse.get(c.id)||[];const completed=ids.filter(id=>done.has(id)).length;const pct=active&&ids.length?Math.round(completed/ids.length*100):0
    return <article className={`coursecard product-card ${active?'is-active':''}`} key={c.id}>
      <div className="coursecover"><div className="cover-topline"><span className="cover-code">COURSE://{c.slug.toUpperCase()}</span>{active?<ShieldCheck size={18}/>:<LockKeyhole size={18}/>}</div><div className="cover-progress"><span>{active?`${pct}% COMPLETE`:'ACCESS CONTROLLED'}</span></div></div>
      <div className="coursebody">
        <div className="panel-head"><span className={`pill ${active?'active':status==='pending'?'locked':''}`}>{active?'ACESSO ATIVO':status==='pending'?'PAGAMENTO PENDENTE':'LOCKED'}</span><span className="mono tiny-label">{active?`${completed}/${ids.length} AULAS`:'PREMIUM'}</span></div>
        <h3>{c.title}</h3><p className="muted card-copy">{c.description}</p>
        {active&&<><div className="progress course-progress"><span style={{width:`${pct}%`}}/></div><div className="progress-caption"><span>{completed} concluídas</span><span>{pct}%</span></div></>}
        <div className="card-actions">{active?<Link className="btn" href={`/curso/${c.slug}`}>{pct>0?'CONTINUAR TRILHA':'INICIAR TRILHA'} →</Link>:status==='pending'?<button className="btn secondary" disabled>AGUARDANDO PAGAMENTO</button>:<CheckoutForm courseId={c.id} label={`COMPRAR · R$ ${(c.price_cents/100).toFixed(2).replace('.',',')}`}/>}</div>
      </div>
    </article>
  })}</div>
  {!courses?.length&&<div className="empty-state">Nenhum curso publicado.</div>}
 </DashboardShell>
}
