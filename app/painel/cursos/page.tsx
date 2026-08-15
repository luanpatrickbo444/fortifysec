import Link from 'next/link'
import { DashboardShell } from '@/components/DashboardShell'
import { requireUser } from '@/lib/auth'
export default async function Cursos(){
 const {supabase,user}=await requireUser()
 const [{data:profile},{data:courses},{data:enrollments}]=await Promise.all([
  supabase.from('profiles').select('role').eq('id',user.id).single(),
  supabase.from('courses').select('id,title,slug,description,price_cents,published').eq('published',true).order('created_at'),
  supabase.from('enrollments').select('course_id,status').eq('user_id',user.id)
 ])
 const em=new Map((enrollments||[]).map((e:any)=>[e.course_id,e.status]))
 return <DashboardShell admin={profile?.role==='admin'}><div className="page-head"><div><div className="kicker">ACADEMY / COURSES</div><h1>FortifySec Academy</h1><p>O aprendizado vem antes do exploit. Seu acesso é validado pelo servidor.</p></div></div><div className="coursegrid">{(courses||[]).map((c:any)=>{const status=em.get(c.id);const active=status==='active';return <article className="coursecard" key={c.id}><div className="coursecover"><span className="cover-code">COURSE://{c.slug.toUpperCase()}</span></div><div className="coursebody"><span className={`pill ${active?'active':'locked'}`}>{active?'ACESSO ATIVO':status==='pending'?'PAGAMENTO PENDENTE':'BLOQUEADO'}</span><h3>{c.title}</h3><p className="muted">{c.description}</p><div className="meta-row"><span>ACADEMY</span><span>•</span><span>PROGRESSO + XP</span></div>{active?<Link className="btn" href={`/curso/${c.slug}`}>CONTINUAR →</Link>:status==='pending'?<button className="btn secondary" disabled>AGUARDANDO PAGAMENTO</button>:<form action="/api/checkout" method="POST"><input type="hidden" name="course_id" value={c.id}/><button className="btn" type="submit">COMPRAR ACESSO · R$ {(c.price_cents/100).toFixed(2).replace('.',',')}</button></form>}</div></article>})}</div></DashboardShell>
}
