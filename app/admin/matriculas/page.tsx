import { GraduationCap, ShieldCheck } from 'lucide-react'
import { DashboardShell } from '@/components/DashboardShell'
import { SubmitButton } from '@/components/ui/SubmitButton'
import { requireAdmin } from '@/lib/auth'
import { adminSetEnrollmentAction } from '@/app/actions'

export default async function AdminEnrollments(){
 const {supabase}=await requireAdmin();const [{data:users},{data:courses},{data:enrollments}]=await Promise.all([
  supabase.from('profiles').select('id,name,email').eq('role','student').order('name'),
  supabase.from('courses').select('id,title').order('title'),
  supabase.from('enrollments').select('id,user_id,course_id,status,source,created_at,profiles(name,email),courses(title)').order('created_at',{ascending:false})
 ]);const active=(enrollments||[]).filter((e:any)=>e.status==='active').length
 return <DashboardShell admin><div className="page-head internal-page-head"><div><div className="kicker">ADMIN / ENROLLMENTS</div><h1>Matrículas</h1><p>Gerencie o vínculo dos alunos com os cursos e acompanhe o estado de cada acesso.</p></div><span className="pill active"><ShieldCheck size={13}/>{active} ATIVAS</span></div><form action={adminSetEnrollmentAction} className="card enrollment-control"><div className="studio-header"><div><span className="section-index">ACCESS ASSIGNMENT</span><h2>Gerenciar matrícula</h2></div><GraduationCap size={24}/></div><div className="three-col"><div className="field"><label>Aluno</label><select name="user_id" required><option value="">Selecione</option>{(users||[]).map((u:any)=><option key={u.id} value={u.id}>{u.name} — {u.email}</option>)}</select></div><div className="field"><label>Curso</label><select name="course_id" required><option value="">Selecione</option>{(courses||[]).map((c:any)=><option key={c.id} value={c.id}>{c.title}</option>)}</select></div><div className="field"><label>Status</label><select name="status"><option value="active">Ativa</option><option value="pending">Pendente</option><option value="blocked">Bloqueada</option><option value="expired">Expirada</option></select></div></div><SubmitButton idleLabel="SALVAR MATRÍCULA" pendingLabel="SALVANDO..."/></form><div className="tablewrap"><table><thead><tr><th>Aluno</th><th>Curso</th><th>Status</th><th>Origem</th><th>Criada</th></tr></thead><tbody>{(enrollments||[]).map((e:any)=><tr key={e.id}><td>{e.profiles?.name||e.profiles?.email}</td><td>{e.courses?.title}</td><td><span className={`pill ${e.status==='active'?'active':e.status==='blocked'?'danger':'locked'}`}>{e.status}</span></td><td className="mono">{e.source}</td><td>{new Date(e.created_at).toLocaleDateString('pt-BR')}</td></tr>)}</tbody></table></div></DashboardShell>
}
