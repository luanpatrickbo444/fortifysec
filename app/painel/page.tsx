import Link from 'next/link'
import { Activity, Boxes, CheckCircle2, GraduationCap, Trophy, Zap } from 'lucide-react'
import { DashboardShell } from '@/components/DashboardShell'
import LogoutButton from '@/components/LogoutButton'
import { requireUser } from '@/lib/auth'

export default async function Painel(){
 const {supabase,user}=await requireUser()
 const [{data:profile},{data:enrollments},{data:progress},{data:solves},{data:sessions}]=await Promise.all([
  supabase.from('profiles').select('name,role,blocked,xp,headline').eq('id',user.id).single(),
  supabase.from('enrollments').select('id,status,course_id,courses(title,slug)').eq('user_id',user.id).eq('status','active'),
  supabase.from('lesson_progress').select('lesson_id,completed,completed_at').eq('user_id',user.id).eq('completed',true),
  supabase.from('challenge_solves').select('id,solved_at,challenge_id,challenges(title,xp_reward)').eq('user_id',user.id).order('solved_at',{ascending:false}).limit(4),
  supabase.from('lab_sessions').select('id,status,started_at,lab_id,labs(title,slug)').eq('user_id',user.id).order('started_at',{ascending:false}).limit(4)
 ])
 const solvedCount=solves?.length||0
 return <DashboardShell admin={profile?.role==='admin'}>
  <div className="page-head"><div><div className="kicker">DASHBOARD / HOME</div><h1>Bem-vindo ao range, {profile?.name||user.email}</h1><p>{profile?.headline||'Sua atividade técnica aparece aqui conforme você avança.'}</p></div><LogoutButton/></div>
  <div className="dashboard-grid"><div className="stat-card accent"><Zap size={18}/><small>XP TOTAL</small><div className="stat">{profile?.xp||0}</div></div><div className="stat-card"><GraduationCap size={18}/><small>MATRÍCULAS</small><div className="stat">{enrollments?.length||0}</div></div><div className="stat-card"><CheckCircle2 size={18}/><small>AULAS CONCLUÍDAS</small><div className="stat">{progress?.length||0}</div></div><div className="stat-card"><Trophy size={18}/><small>DESAFIOS RECENTES</small><div className="stat">{solvedCount}</div></div></div>
  <section className="section" style={{paddingBottom:20}}><div className="content-grid"><div className="card"><div className="panel-head"><h2>Continue sua operação</h2><Link className="tag green" href="/painel/cursos">ACADEMY →</Link></div>{!enrollments?.length?<div className="lockedbox"><h3>Nenhuma matrícula ativa</h3><p className="muted">Cursos, Labs e desafios premium permanecem bloqueados até uma matrícula ser ativada pelo pagamento ou administrador.</p><Link className="btn" href="/painel/cursos">VER CURSOS</Link></div>:<div className="activity-list">{enrollments.slice(0,4).map((e:any)=><Link className="activity-row" href={`/curso/${e.courses?.slug}`} key={e.id}><div className="activity-icon"><GraduationCap size={17}/></div><div><strong>{e.courses?.title}</strong><span>Matrícula ativa · continuar conteúdo</span></div><span className="pill active">LIBERADO</span></Link>)}</div>}</div><div className="card"><div className="panel-head"><h3>Atividade recente</h3><Activity size={18}/></div><div className="activity-list">{(solves||[]).map((s:any)=><div className="activity-row" key={s.id}><div className="activity-icon"><Trophy size={16}/></div><div><strong>{s.challenges?.title}</strong><span>Challenge resolvido</span></div><span className="mono">+{s.challenges?.xp_reward||0} XP</span></div>)}{(sessions||[]).slice(0,2).map((s:any)=><div className="activity-row" key={s.id}><div className="activity-icon"><Boxes size={16}/></div><div><strong>{s.labs?.title}</strong><span>Sessão {s.status}</span></div><span className="mono">LAB</span></div>)}{!solves?.length&&!sessions?.length&&<div className="empty-state">Sua atividade de Labs e Challenges aparecerá aqui.</div>}</div></div></div></section>
 </DashboardShell>
}
