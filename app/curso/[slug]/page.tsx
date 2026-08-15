import { notFound, redirect } from 'next/navigation'
import { CheckCircle2, Circle, PlayCircle, Zap } from 'lucide-react'
import { DashboardShell } from '@/components/DashboardShell'
import { SubmitButton } from '@/components/ui/SubmitButton'
import { requireUser } from '@/lib/auth'
import { completeLessonAction } from './server-actions'

function youtubeEmbed(url:string){try{const u=new URL(url);if(u.hostname.includes('youtube.com')){const v=u.searchParams.get('v');return v?`https://www.youtube.com/embed/${encodeURIComponent(v)}`:null}if(u.hostname==='youtu.be'){const v=u.pathname.replace('/','');return v?`https://www.youtube.com/embed/${encodeURIComponent(v)}`:null}}catch{}return null}

export default async function Course({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;const {supabase,user}=await requireUser()
 const {data:course}=await supabase.from('courses').select('id,title,description').eq('slug',slug).eq('published',true).maybeSingle();if(!course)notFound()
 const {data:enrollment}=await supabase.from('enrollments').select('id,status').eq('user_id',user.id).eq('course_id',course.id).eq('status','active').maybeSingle();if(!enrollment)redirect('/painel/cursos?bloqueado=1')
 const [{data:lessons},{data:progress},{data:profile}]=await Promise.all([supabase.from('lessons').select('id,title,position,video_url,content,xp_reward').eq('course_id',course.id).order('position'),supabase.from('lesson_progress').select('lesson_id,completed').eq('user_id',user.id),supabase.from('profiles').select('role').eq('id',user.id).single()]);const done=new Set((progress||[]).filter((p:any)=>p.completed).map((p:any)=>p.lesson_id));const total=lessons?.length||0;const pct=total?Math.round(done.size/total*100):0
 return <DashboardShell admin={profile?.role==='admin'}>
   <div className="page-head internal-page-head"><div><div className="kicker">ACADEMY / ACTIVE COURSE</div><h1>{course.title}</h1><p>{course.description}</p></div><div className="course-completion-badge"><strong>{pct}%</strong><span>COMPLETE</span></div></div>
   <div className="course-progress-header"><div className="progress"><span style={{width:`${pct}%`}}/></div><div><span>{done.size} de {total} aulas</span><span>{total-done.size} restantes</span></div></div>
   <div className="lesson-stack">{(lessons||[]).map((l:any)=>{const embed=l.video_url?youtubeEmbed(l.video_url):null;const completed=done.has(l.id);return <article className={`lesson lesson-card ${completed?'lesson-completed':''}`} key={l.id}><div className="lesson-header"><div className="lesson-index">{completed?<CheckCircle2 size={20}/>:<Circle size={20}/>}<span>{String(l.position).padStart(2,'0')}</span></div><div className="lesson-title"><span className="section-index">LESSON</span><h3>{l.title}</h3></div><div className="lesson-state">{completed?<span className="pill active">CONCLUÍDA</span>:<span className="pill"><Zap size={11}/> +{l.xp_reward||0} XP</span>}</div></div>{l.content&&<p className="muted lesson-copy" style={{whiteSpace:'pre-wrap'}}>{l.content}</p>}{embed&&<div className="video-frame"><iframe src={embed} title={l.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen/></div>}{l.video_url&&!embed&&<a className="btn secondary" href={l.video_url} target="_blank" rel="noreferrer"><PlayCircle size={15}/> ABRIR CONTEÚDO EXTERNO →</a>}{!completed&&<form action={completeLessonAction} className="lesson-action"><input type="hidden" name="lesson_id" value={l.id}/><input type="hidden" name="course_id" value={course.id}/><input type="hidden" name="slug" value={slug}/><SubmitButton className="btn secondary" idleLabel={`MARCAR CONCLUÍDA · +${l.xp_reward||0} XP`} pendingLabel="SALVANDO PROGRESSO..."/></form>}</article>})}</div>
   {!lessons?.length&&<div className="empty-state">Este curso ainda não possui aulas publicadas.</div>}
 </DashboardShell>
}
