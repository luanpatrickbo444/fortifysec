'use client'

import Link from 'next/link'
import {
  BookOpen,
  Boxes,
  Building2,
  CreditCard,
  Flag,
  Gauge,
  GraduationCap,
  Layers3,
  LayoutDashboard,
  RadioTower,
  Settings,
  ShieldCheck,
  Swords,
  Trophy,
  UserRound,
  UsersRound,
  Wrench,
} from 'lucide-react'
import { DashboardNav } from '@/components/DashboardNav'
import LogoutButton from '@/components/LogoutButton'

type ShellMode = 'student' | 'admin'

type DashboardShellProps = {
  children: React.ReactNode
  /**
   * Legacy compatibility: existing admin pages still pass `admin`.
   * New layouts should prefer `mode`.
   */
  admin?: boolean
  mode?: ShellMode
  isAdmin?: boolean
  hasCompany?: boolean
}

const studentItems = [
  ['Command Center', '/painel', Gauge],
  ['Minha formação', '/painel/cursos', GraduationCap],
  ['Cyber Labs', '/painel/labs', Boxes],
  ['Challenges', '/painel/desafios', Swords],
  ['CTF', '/painel/ctf', Flag],
  ['Ranking', '/painel/ranking', Trophy],
  ['Pagamentos', '/painel/pagamentos', CreditCard],
  ['Perfil', '/painel/perfil', UserRound],
] as const

const adminContentItems = [
  ['Admin Home', '/admin', LayoutDashboard],
  ['Cursos & Trilhas', '/admin/cursos', Layers3],
  ['Biblioteca de Aulas', '/admin/aulas', BookOpen],
  ['Cyber Labs', '/admin/labs', Boxes],
  ['Challenges', '/admin/desafios', Wrench],
  ['CTF Control', '/admin/ctf', RadioTower],
] as const


const adminQuickItems = [
  ['Admin Home', '/admin', LayoutDashboard],
  ['Cursos', '/admin/cursos', Layers3],
  ['Cyber Labs', '/admin/labs', Boxes],
  ['Usuários', '/admin/usuarios', UsersRound],
  ['Empresas', '/admin/empresas', Building2],
  ['Configurações', '/admin/site', Settings],
] as const

const adminOpsItems = [
  ['Usuários', '/admin/usuarios', UsersRound],
  ['Empresas', '/admin/empresas', Building2],
  ['Matrículas', '/admin/matriculas', GraduationCap],
  ['Pagamentos', '/admin/pagamentos', CreditCard],
  ['Configurações', '/admin/site', Settings],
] as const

export function DashboardShell({
  children,
  admin = false,
  mode,
  isAdmin = false,
  hasCompany = false,
}: DashboardShellProps) {
  const resolvedMode: ShellMode = mode ?? (admin ? 'admin' : 'student')
  const adminShell = resolvedMode === 'admin'

  return (
    <div className={`app-shell ${adminShell ? 'app-shell-admin' : 'app-shell-student'}`}>
      <aside className={`sidebar ${adminShell ? 'sidebar-admin' : 'sidebar-student'}`}>
        <div className="side-brand">
          <span className="brand-mark">F</span>
          <div>
            <strong>FORTIFYSEC</strong>
            <small>{adminShell ? 'OPERATIONS CONSOLE' : 'CYBER RANGE'}</small>
          </div>
        </div>

        {adminShell ? (
          <>
            <div className="side-role-switches">
              <Link className="side-role-switch" href="/painel">
                <GraduationCap size={15} />
                <span>
                  <small>VISUALIZAR COMO</small>
                  <strong>Painel do aluno</strong>
                </span>
              </Link>
            </div>

            <div className="side-label">CONTEÚDO & RANGE</div>
            <DashboardNav items={adminContentItems} admin />

            <div className="side-label admin-label">OPERAÇÃO</div>
            <DashboardNav items={adminOpsItems} admin />
          </>
        ) : (
          <>
            {(isAdmin || hasCompany) && (
              <div className="side-role-switches">
                {isAdmin && (
                  <Link className="side-role-switch side-role-switch-admin" href="/admin">
                    <ShieldCheck size={15} />
                    <span>
                      <small>ROLE ADMIN</small>
                      <strong>Admin Console</strong>
                    </span>
                  </Link>
                )}
                {hasCompany && (
                  <Link className="side-role-switch" href="/empresa">
                    <Building2 size={15} />
                    <span>
                      <small>EMPLOYER</small>
                      <strong>Painel da empresa</strong>
                    </span>
                  </Link>
                )}
              </div>
            )}

            <div className="side-label">PLATAFORMA</div>
            <DashboardNav items={studentItems} />

            {isAdmin && (
              <>
                <div className="side-label admin-label">ADMIN ACCESS</div>
                <DashboardNav items={adminQuickItems} admin />
              </>
            )}
          </>
        )}

        <div className="side-session">
          <div className="side-foot">
            <span className="status-dot" /> Operação normal
          </div>
          <LogoutButton />
        </div>
      </aside>

      <main className="app-main">{children}</main>
    </div>
  )
}
