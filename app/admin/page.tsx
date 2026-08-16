import Link from 'next/link'
import { Activity, BookOpen, Boxes, CreditCard, Flag, GraduationCap, Layers3, RadioTower, Settings, ShieldCheck, Swords, UsersRound } from 'lucide-react'
import { DashboardShell } from '@/components/DashboardShell'
import { requireAdmin } from '@/lib/auth'

export default async function AdminHome(){
 const {supabase,profile}=await requireAdmin()
 const [users,courses,lessons,enrollments,labs,challenges,events,payments,recentUsers,recentPayments]=await Promise.all([
  supabase.from('profiles').select('id',{count:'exact',head:true}),
  supabase.from('courses').select('id',{count:'exact',head:true}),
  supabase.from('lessons').select('id',{count:'exact',head:true}),
  supabase.from('enrollments').select('id',{count:'exact',head:true}).eq('status','active'),
  supabase.from('labs').select('id',{count:'exact',head:true}),
  supabase.from('challenges').select('id',{count:'exact',head:true}),
  supabase.from('ctf_events').select('id',{count:'exact',head:true}),
  supabase.from('payments').select('id',{count:'exact',head:true}),
  supabase.from('profiles').select('id,name,email,role,created_at').order('created_at',{ascending:false}).limit(5),
  supabase.from('payments').select('id,status,amount_cents,created_at,profiles(name,email),courses(title)').order('created_at',{ascending:false}).limit(5)
 ])
 const cards=[
  ['Usuários',users.count||0,'/admin/usuarios',UsersRound],['Cursos',courses.count||0,'/admin/cursos',Layers3],['Aulas',lessons.count||0,'/admin/aulas',BookOpen],['Matrículas',enrollments.count||0,'/admin/matriculas',GraduationCap],['Labs',labs.count||0,'/admin/labs',Boxes],['Challenges',challenges.count||0,'/admin/desafios',Swords],['CTFs',events.count||0,'/admin/ctf',Flag],['Pagamentos',payments.count||0,'/admin/pagamentos',CreditCard]
 ] as const
 return <DashboardShell admin>
   <div className="page-head internal-page-head"><div><div className="kicker">ADMIN / OPERATIONS CONSOLE</div><h1>Central de operação</h1><p>Bem-vindo, {profile.name}. Conteúdo, cyber range, competição e operação do site em uma única interface.</p></div><div className="hero-actions"><Link className="btn secondary" href="/admin/site"><Settings size={15}/> CONFIGURAÇÕES</Link><Link className="btn" href="/admin/cursos">ABRIR CONTENT STUDIO →</Link></div></div>
   <div className="admin-command-grid">{cards.map(([label,value,href,Icon])=><Link className="stat-card admin-command-card" href={href} key={href}><Icon size={19}/><small>{label.toUpperCase()}</small><div className="stat">{value}</div><span className="mono">GERENCIAR →</span></Link>)}</div>
   <section className="admin-control-sections">
    <article className="card control-lane"><div className="control-lane-head"><div><span className="section-index">CONTENT PIPELINE</span><h2>Academy</h2><p>Monte a estrutura do curso e publique o conteúdo na ordem certa.</p></div><Layers3 size={28}/></div><div className="control-flow"><Link href="/admin/cursos"><span>01</span><div><b>Curso & trilha</b><small>Dados, preço e publicação</small></div></Link><Link href="/admin/cursos"><span>02</span><div><b>Módulos</b><small>Estrutura curricular</small></div></Link><Link href="/admin/aulas"><span>03</span><div><b>Aulas</b><small>Vídeo, conteúdo e XP</small></div></Link></div></article>
    <article className="card control-lane"><div className="control-lane-head"><div><span className="section-index">CYBER RANGE</span><h2>Labs & Challenges</h2><p>Gerencie ambientes, dificuldades, conteúdo prático e disponibilidade.</p></div><ShieldCheck size={28}/></div><div className="control-flow"><Link href="/admin/labs"><span>01</span><div><b>Cyber Labs</b><small>Endpoints e publicação</small></div></Link><Link href="/admin/desafios"><span>02</span><div><b>Challenges</b><small>Missões, flag e XP</small></div></Link><Link href="/admin/ctf"><span>03</span><div><b>CTF Control</b><small>Eventos e desafios</small></div></Link></div></article>
    <article className="card control-lane"><div className="control-lane-head"><div><span className="section-index">BUSINESS OPS</span><h2>Operação</h2><p>Acompanhe usuários, matrículas, pagamentos e configurações.</p></div><Activity size={28}/></div><div className="control-flow"><Link href="/admin/usuarios"><span>01</span><div><b>Usuários</b><small>Roles e status</small></div></Link><Link href="/admin/matriculas"><span>02</span><div><b>Matrículas</b><small>Acesso e status</small></div></Link><Link href="/admin/pagamentos"><span>03</span><div><b>Pagamentos</b><small>Histórico e conferência</small></div></Link></div></article>
   </section>
   <div className="admin-live-grid"><section className="card"><div className="panel-head"><div><span className="section-index">LATEST USERS</span><h3>Novos usuários</h3></div><Link className="tag green" href="/admin/usuarios">VER TODOS →</Link></div><div className="activity-list">{(recentUsers.data||[]).map((u:any)=><div className="activity-row" key={u.id}><span className="mini-avatar">{String(u.name||'?').slice(0,1).toUpperCase()}</span><div><strong>{u.name}</strong><span>{u.email}</span></div><span className="pill">{u.role}</span></div>)}</div></section><section className="card"><div className="panel-head"><div><span className="section-index">PAYMENT FEED</span><h3>Pagamentos recentes</h3></div><Link className="tag green" href="/admin/pagamentos">VER TODOS →</Link></div><div className="activity-list">{(recentPayments.data||[]).map((p:any)=><div className="activity-row" key={p.id}><CreditCard size={16}/><div><strong>{p.profiles?.name||p.profiles?.email||'Usuário'}</strong><span>{p.courses?.title||'Curso'} · {p.status}</span></div><strong>R$ {(Number(p.amount_cents||0)/100).toFixed(2).replace('.',',')}</strong></div>)}{!recentPayments.data?.length&&<div className="empty-state">Nenhum pagamento registrado.</div>}</div></section></div>
 </DashboardShell>
}
