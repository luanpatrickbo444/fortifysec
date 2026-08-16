import Link from 'next/link'
import { BookOpen, Layers3, PlusCircle, Settings2 } from 'lucide-react'
import { DashboardShell } from '@/components/DashboardShell'
import { SubmitButton } from '@/components/ui/SubmitButton'
import { requireAdmin } from '@/lib/auth'
import { adminCreateCourseAction, adminToggleCourseAction } from '@/lib/actions'

export default async function AdminCourses(){
 const {supabase}=await requireAdmin()
 const {data:courses}=await supabase.from('courses').select('id,title,slug,description,price_cents,published,created_at').order('created_at',{ascending:false})
 const ids=(courses||[]).map((c:any)=>c.id)
 const [{data:modules},{data:lessons}]=await Promise.all([
  ids.length?supabase.from('course_modules').select('id,course_id').in('course_id',ids):Promise.resolve({data:[]} as any),
  ids.length?supabase.from('lessons').select('id,course_id').in('course_id',ids):Promise.resolve({data:[]} as any)
 ])
 const moduleCount=new Map<string,number>();const lessonCount=new Map<string,number>();(modules||[]).forEach((m:any)=>moduleCount.set(m.course_id,(moduleCount.get(m.course_id)||0)+1));(lessons||[]).forEach((l:any)=>lessonCount.set(l.course_id,(lessonCount.get(l.course_id)||0)+1))
 return <DashboardShell admin>
  <div className="page-head internal-page-head"><div><div className="kicker">ADMIN / ACADEMY CONTROL</div><h1>Cursos & trilhas</h1><p>Crie a formação e entre no Studio de cada curso para organizar módulos e aulas.</p></div><span className="pill active"><BookOpen size={13}/>{(courses||[]).length} CURSOS</span></div>
  <div className="admin-course-layout"><form action={adminCreateCourseAction} className="card admin-create-panel"><div className="studio-header"><div><span className="section-index">NEW COURSE</span><h2>Novo curso</h2><p>Crie a estrutura principal antes de adicionar módulos e aulas.</p></div><PlusCircle size={26}/></div><div className="field"><label>Título</label><input required name="title" placeholder="Ex.: Pentest Web Profissional"/></div><div className="field"><label>Slug</label><input required name="slug" placeholder="pentest-web-profissional"/></div><div className="field"><label>Preço (R$)</label><input name="price" type="number" min="0" step="0.01" defaultValue="99.90"/></div><div className="field"><label>Descrição</label><textarea name="description" rows={5} placeholder="Resumo comercial e técnico do curso."/></div><SubmitButton idleLabel="CRIAR CURSO →" pendingLabel="CRIANDO CURSO..."/></form>
  <section className="course-admin-grid">{(courses||[]).map((c:any)=><article className="card admin-course-card" key={c.id}><div className="admin-course-status"><span className={`pill ${c.published?'active':'locked'}`}>{c.published?'PUBLICADO':'RASCUNHO'}</span><span className="mono tiny-label">R$ {(c.price_cents/100).toFixed(2).replace('.',',')}</span></div><h3>{c.title}</h3><p>{c.description||'Sem descrição.'}</p><div className="admin-course-metrics"><div><Layers3 size={15}/><strong>{moduleCount.get(c.id)||0}</strong><span>MÓDULOS</span></div><div><BookOpen size={15}/><strong>{lessonCount.get(c.id)||0}</strong><span>AULAS</span></div></div><div className="card-actions"><Link className="btn" href={`/admin/cursos/${c.id}`}><Settings2 size={15}/> ABRIR STUDIO</Link><form action={adminToggleCourseAction}><input type="hidden" name="course_id" value={c.id}/><input type="hidden" name="published" value={String(c.published)}/><SubmitButton className="btn secondary" idleLabel={c.published?'RETIRAR DO CATÁLOGO':'PUBLICAR'} pendingLabel="ATUALIZANDO..."/></form></div></article>)}</section></div>
  {!courses?.length&&<div className="empty-state">Crie o primeiro curso para abrir o Content Studio.</div>}
 </DashboardShell>
}
