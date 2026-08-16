'use client'

import Link from 'next/link'
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

        // Admin navigation intentionally uses native anchors.
        // This forces a fresh server request and avoids stale App Router
        // state after production deploys (the route itself exists on Vercel).
        if (admin) {
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
        }

        return (
          <Link
            key={href}
            href={href}
            className={active ? 'active' : ''}
            aria-current={active ? 'page' : undefined}
          >
            {content}
          </Link>
        )
      })}
    </nav>
  )
}
