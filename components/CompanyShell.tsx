'use client'

import { BriefcaseBusiness, Building2, Gauge, UsersRound } from 'lucide-react'
import { DashboardNav } from '@/components/DashboardNav'
import LogoutButton from '@/components/LogoutButton'

export function CompanyShell({children,companyName}:{children:React.ReactNode,companyName:string}){
 const items=[
  ['Overview','/empresa',Gauge],
  ['Vagas','/empresa/vagas',BriefcaseBusiness],
  ['Candidatos','/empresa/candidatos',UsersRound],
 ] as const
 return <div className="app-shell"><aside className="sidebar"><div className="side-brand"><span className="brand-mark">F</span><div><strong>FORTIFYSEC</strong><small>EMPLOYER NETWORK</small></div></div><div className="side-label">{companyName.toUpperCase()}</div><DashboardNav items={items}/><div className="side-session"><div className="side-foot"><Building2 size={13}/> Employer Console</div><LogoutButton/></div></aside><main className="app-main">{children}</main></div>
}
