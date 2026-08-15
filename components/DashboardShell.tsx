import Link from 'next/link'
import { BookOpen, Boxes, CreditCard, Flag, Gauge, ShieldCheck, Trophy, UserRound, UsersRound, Wrench, GraduationCap, Swords, LayoutDashboard } from 'lucide-react'

export function DashboardShell({children,admin=false}:{children:React.ReactNode,admin?:boolean}){
 const main=[
  ['Visão geral','/painel',Gauge],['Academy','/painel/cursos',GraduationCap],['Labs','/painel/labs',Boxes],['Desafios','/painel/desafios',Swords],['CTF','/painel/ctf',Flag],['Ranking','/painel/ranking',Trophy],['Pagamentos','/painel/pagamentos',CreditCard],['Perfil','/painel/perfil',UserRound]
 ] as const
 const adm=[['Dashboard','/admin',LayoutDashboard],['Cursos','/admin/cursos',BookOpen],['Aulas','/admin/aulas',GraduationCap],['Matrículas','/admin/matriculas',ShieldCheck],['Usuários','/admin/usuarios',UsersRound],['Labs','/admin/labs',Boxes],['Desafios','/admin/desafios',Wrench],['CTF','/admin/ctf',Flag],['Pagamentos','/admin/pagamentos',CreditCard]] as const
 return <div className="app-shell"><aside className="sidebar"><div className="side-brand"><span className="brand-mark">F</span><div><strong>FORTIFYSEC</strong><small>CYBER RANGE</small></div></div><div className="side-label">PLATAFORMA</div><nav className="side-nav">{main.map(([label,href,Icon])=><Link key={href} href={href}><Icon size={17}/><span>{label}</span></Link>)}</nav>{admin&&<><div className="side-label admin-label">ADMINISTRAÇÃO</div><nav className="side-nav admin-nav">{adm.map(([label,href,Icon])=><Link key={href} href={href}><Icon size={17}/><span>{label}</span></Link>)}</nav></>}<div className="side-foot"><span className="status-dot"/> Operação normal</div></aside><main className="app-main">{children}</main></div>
}
