'use client'

import { usePathname } from 'next/navigation'
import type { LucideIcon } from 'lucide-react'

export function DashboardNav({
  items,
  admin = false,
}: {
  items: readonly (readonly [string, string, LucideIcon])[]
  admin?: boolean
}) {
  const pathname = usePathname()

  return (
    <nav className={`side-nav${admin ? ' admin-nav' : ''}`}>
      {items.map(([label, href, Icon]) => {
        const rootRoute = href === '/painel' || href === '/admin'
        const active = pathname === href || (!rootRoute && pathname.startsWith(`${href}/`))
        const content = (
          <>
            <Icon size={17} />
            <span>{label}</span>
          </>
        )

        // Core dashboard navigation intentionally uses native anchors.
        // A full document request prevents a browser tab with an older App Router
        // tree from producing false 404s immediately after a production deploy.
        return (
          <a
            key={href}
            href={href}
            className={active ? 'active' : ''}
            aria-current={active ? 'page' : undefined}
          >
            {content}
          </a>
        )
      })}
    </nav>
  )
}
