import './globals.css'
import {
  DEFAULT_PLATFORM_SETTINGS,
  getPlatformSettings,
  type PlatformSettings,
} from '@/lib/site-settings'
import { SiteHeader } from '@/components/SiteHeader'

export const metadata = {
  title: 'FortifySec — Learn. Hack. Prove.',
  description: 'Academy, cyber labs, challenges, CTF e ranking técnico em uma única plataforma.',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // CRITICAL: the root layout is public. It must never call requireUser(),
  // requireAdmin(), requireCompany() or redirect('/login').
  let platform: PlatformSettings = DEFAULT_PLATFORM_SETTINGS

  try {
    platform = await getPlatformSettings()
  } catch {
    // Even a malformed public settings integration must never take /login down.
    platform = DEFAULT_PLATFORM_SETTINGS
  }

  return (
    <html lang="pt-BR">
      <body>
        <SiteHeader />
        {platform.announcement && (
          <div className="announcement-bar">
            <span>FORTIFYSEC // NOTICE</span>
            {platform.announcement}
          </div>
        )}
        {platform.maintenance_mode && (
          <div className="maintenance-bar">PLATAFORMA EM MANUTENÇÃO PROGRAMADA</div>
        )}
        {children}
      </body>
    </html>
  )
}
