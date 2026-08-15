import { BookOpen, Boxes, CreditCard, Flag, Gauge, Trophy, UserRound, UsersRound, Wrench, GraduationCap, Swords, LayoutDashboard } from 'lucide-react'
import { DashboardNav } from '@/components/DashboardNav'

export function DashboardShell({children,admin=false}:{children:React.ReactNode,admin?:boolean}){
 const main=[
  ['Visão geral','/painel',Gauge],['Academy','/painel/cursos',GraduationCap],['Labs','/painel/labs',Boxes],['Desafios','/painel/desafios',Swords],['CTF','/painel/ctf',Flag],['Ranking','/painel/ranking',Trophy],['Pagamentos','/painel/pagamentos',CreditCard],['Perfil','/painel/perfil',UserRound]
 ] as const
 const adm=[['Dashboard','/admin',LayoutDashboard],['Cursos','/admin/cursos',BookOpen],['Aulas','/admin/aulas',GraduationCap],['Matrículas','/admin/matriculas',CreditCard],['Usuários','/admin/usuarios',UsersRound],['Labs','/admin/labs',Boxes],['Desafios','/admin/desafios',Wrench],['CTF','/admin/ctf',Flag],['Pagamentos','/admin/pagamentos',CreditCard]] as const
 return <div className="app-shell"><aside className="sidebar"><div className="side-brand"><span className="brand-mark">F</span><div><strong>FORTIFYSEC</strong><small>CYBER RANGE</small></div></div><div className="side-label">PLATAFORMA</div><DashboardNav items={main}/>{admin&&<><div className="side-label admin-label">ADMINISTRAÇÃO</div><DashboardNav items={adm} admin/></>}<div className="side-foot"><span className="status-dot"/> Operação normal</div></aside><main className="app-main">{children}</main></div>
}
