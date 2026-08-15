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
        const active = pathname === href || (href !== '/dashboard' && href !== '/admin' && pathname.startsWith(`${href}/`))
        return (
          <Link key={href} href={href} className={active ? 'active' : ''} aria-current={active ? 'page' : undefined}>
            <Icon size={17} />
            <span>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
