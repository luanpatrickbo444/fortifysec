import './globals.css'
import { getPlatformSettings } from '@/lib/site-settings'
import { SiteHeader } from '@/components/SiteHeader'

export const metadata = {
  title: 'FortifySec — Learn. Hack. Prove.',
  description: 'Academy, cyber labs, challenges, CTF e ranking técnico em uma única plataforma.',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const platform = await getPlatformSettings()

  return (
    <html lang="pt-BR">
      <body>
        <SiteHeader />
        {platform.announcement && <div className="announcement-bar"><span>FORTIFYSEC // NOTICE</span>{platform.announcement}</div>}
        {platform.maintenance_mode && <div className="maintenance-bar">PLATAFORMA EM MANUTENÇÃO PROGRAMADA</div>}
        {children}
      </body>
    </html>
  )
}
