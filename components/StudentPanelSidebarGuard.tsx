'use client'

import { useEffect, useState } from 'react'
import {
  Boxes,
  CreditCard,
  Flag,
  Gauge,
  GraduationCap,
  Swords,
  Trophy,
  UserRound,
} from 'lucide-react'
import { DashboardNav } from '@/components/DashboardNav'
import LogoutButton from '@/components/LogoutButton'

const studentItems = [
  ['Command Center', '/dashboard', Gauge],
  ['Minha formação', '/painel/cursos', GraduationCap],
  ['Cyber Labs', '/painel/labs', Boxes],
  ['Challenges', '/painel/desafios', Swords],
  ['CTF', '/painel/ctf', Flag],
  ['Ranking', '/painel/ranking', Trophy],
  ['Pagamentos', '/painel/pagamentos', CreditCard],
  ['Perfil', '/painel/perfil', UserRound],
] as const

/**
 * Production safety net for /painel/*.
 *
 * The normal DashboardShell remains the preferred owner of the sidebar.
 * This component only renders when the DOM has NO normal `.sidebar`.
 * Therefore it cannot create a second menu when a route already has one.
 */
export function StudentPanelSidebarGuard() {
  const [fallbackActive, setFallbackActive] = useState(false)

  useEffect(() => {
    let raf = 0

    const sync = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const normalSidebar = document.querySelector(
          '.sidebar:not([data-student-panel-fallback="true"])',
        )
        const shouldFallback = !normalSidebar

        setFallbackActive((current) =>
          current === shouldFallback ? current : shouldFallback,
        )
        document.documentElement.classList.toggle(
          'student-panel-fallback-active',
          shouldFallback,
        )
      })
    }

    sync()

    const observer = new MutationObserver(sync)
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })

    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
      document.documentElement.classList.remove(
        'student-panel-fallback-active',
      )
    }
  }, [])

  if (!fallbackActive) return null

  return (
    <>
      <style jsx global>{`
        html.student-panel-fallback-active body {
          padding-left: 258px;
        }

        .student-panel-fallback-sidebar {
          position: fixed !important;
          z-index: 90;
          top: 0 !important;
          left: 0;
          bottom: 0;
          width: 258px;
          height: 100vh !important;
        }

        @media (max-width: 760px) {
          html.student-panel-fallback-active body {
            padding-left: 0;
            padding-top: 56px;
          }

          .student-panel-fallback-sidebar {
            right: 0;
            bottom: auto;
            width: 100%;
            height: 56px !important;
            min-height: 56px;
            padding: 0 10px !important;
            border-right: 0 !important;
            border-bottom: 1px solid var(--border);
            overflow-x: auto;
            overflow-y: hidden;
          }

          .student-panel-fallback-sidebar .side-brand,
          .student-panel-fallback-sidebar .side-label,
          .student-panel-fallback-sidebar .side-session {
            display: none !important;
          }

          .student-panel-fallback-sidebar .side-nav {
            display: flex;
            min-width: max-content;
            height: 56px;
            align-items: stretch;
          }

          .student-panel-fallback-sidebar .side-nav a {
            display: inline-flex;
            align-items: center;
            white-space: nowrap;
          }
        }
      `}</style>

      <aside
        className="sidebar student-panel-fallback-sidebar"
        data-student-panel-fallback="true"
        aria-label="Menu da plataforma"
      >
        <div className="side-brand">
          <span className="brand-mark">F</span>
          <div>
            <strong>FORTIFYSEC</strong>
            <small>CYBER RANGE</small>
          </div>
        </div>

        <div className="side-label">PLATAFORMA</div>
        <DashboardNav items={studentItems} />

        <div className="side-session">
          <div className="side-foot">
            <span className="status-dot" /> Operação normal
          </div>
          <LogoutButton />
        </div>
      </aside>
    </>
  )
}
