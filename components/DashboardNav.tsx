'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import type { LucideIcon } from 'lucide-react'

export function DashboardNav({
  items,
  admin = false,
}: {
  items: readonly (readonly [string, string, LucideIcon])[]
  admin?: boolean
}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  return (
    <nav className={`side-nav${admin ? ' admin-nav' : ''}`}>
      {items.map(([label, href, Icon]) => {
        const [hrefPath, hrefQuery = ''] = href.split('?')
        const requestedView = new URLSearchParams(hrefQuery).get('view')
        const currentView = searchParams.get('view')
        const rootRoute = hrefPath === '/painel' || hrefPath === '/admin'
        const active = requestedView
          ? pathname === hrefPath && currentView === requestedView
          : (pathname === hrefPath && (!rootRoute || !currentView)) || (!rootRoute && pathname.startsWith(`${hrefPath}/`))
        const content = (
          <>
            <Icon size={17} />
            <span>{label}</span>
          </>
        )

        // Use native anchors for every dashboard route. A full document request
        // prevents stale App Router/RSC state after production deployments from
        // showing a client-side 404 for routes that exist on the server.
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
