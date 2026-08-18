'use client'

import Link from 'next/link'
import { BadgeCheck, BriefcaseBusiness, Building2, Gauge, Search, UsersRound } from 'lucide-react'
import { DashboardNav } from '@/components/DashboardNav'
import LogoutButton from '@/components/LogoutButton'

export function CompanyShell({
  children,
  companyName,
  verified=false,
}:{
  children:React.ReactNode
  companyName:string
  verified?:boolean
}){
  const items=[
    ['Overview','/empresa',Gauge],
    ['Vagas','/empresa/job-console',BriefcaseBusiness],
    ['Talent Search','/empresa/talentos',Search],
    ['Candidatos','/empresa/candidatos',UsersRound],
  ] as const

  return (
    <div className="app-shell employer-shell">
      <aside className="sidebar employer-sidebar">
        <Link className="side-brand employer-side-brand" href="/empresa">
          <span className="brand-mark">F</span>
          <div><strong>FORTIFYSEC</strong><small>EMPLOYER NETWORK</small></div>
        </Link>

        <div className="employer-company-block">
          <div className="employer-company-icon"><Building2 size={17}/></div>
          <div>
            <small>ORGANIZATION</small>
            <strong>{companyName}</strong>
          </div>
        </div>

        <div className={`employer-verification ${verified?'verified':'pending'}`}>
          <BadgeCheck size={15}/>
          <div>
            <small>COMPANY STATUS</small>
            <strong>{verified?'VERIFIED':'PENDING REVIEW'}</strong>
          </div>
        </div>

        <div className="side-label">EMPLOYER CONSOLE</div>
        <DashboardNav items={items}/>

        <div className="employer-side-help">
          <span>HIRING PIPELINE</span>
          <p>Publique vagas e encontre operadores com histórico técnico comprovado.</p>
        </div>

        <div className="side-session">
          <div className="side-foot"><Building2 size={13}/> Employer Console</div>
          <LogoutButton/>
        </div>
      </aside>
      <main className="app-main employer-main">{children}</main>
    </div>
  )
}
