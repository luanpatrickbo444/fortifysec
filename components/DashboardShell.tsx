'use client'

import { BookOpen, Boxes, CreditCard, Flag, Gauge, Trophy, UserRound, UsersRound, Wrench, GraduationCap, Swords, LayoutDashboard, Settings, Layers3, RadioTower } from 'lucide-react'
import { DashboardNav } from '@/components/DashboardNav'

export function DashboardShell({children,admin=false}:{children:React.ReactNode,admin?:boolean}){
 const main=[
  ['Command Center','/dashboard',Gauge],['Minha formação','/painel/cursos',GraduationCap],['Cyber Labs','/painel/labs',Boxes],['Challenges','/painel/desafios',Swords],['CTF','/painel/ctf',Flag],['Ranking','/painel/ranking',Trophy],['Pagamentos','/painel/pagamentos',CreditCard],['Perfil','/painel/perfil',UserRound]
 ] as const
 const content=[['Admin Home','/admin',LayoutDashboard],['Cursos & Trilhas','/admin/cursos',Layers3],['Biblioteca de Aulas','/admin/aulas',BookOpen],['Cyber Labs','/admin/labs',Boxes],['Challenges','/admin/desafios',Wrench],['CTF Control','/admin/ctf',RadioTower]] as const
 const ops=[['Usuários','/admin/usuarios',UsersRound],['Matrículas','/admin/matriculas',GraduationCap],['Pagamentos','/admin/pagamentos',CreditCard],['Configurações','/admin/site',Settings]] as const
 return <div className="app-shell"><aside className="sidebar"><div className="side-brand"><span className="brand-mark">F</span><div><strong>FORTIFYSEC</strong><small>{admin?'OPERATIONS CONSOLE':'CYBER RANGE'}</small></div></div><div className="side-label">PLATAFORMA</div><DashboardNav items={main}/>{admin&&<><div className="side-label admin-label">CONTEÚDO & RANGE</div><DashboardNav items={content} admin/><div className="side-label admin-label">OPERAÇÃO</div><DashboardNav items={ops} admin/></>}<div className="side-foot"><span className="status-dot"/> Operação normal</div></aside><main className="app-main">{children}</main></div>
}
