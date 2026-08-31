import type { Metadata } from 'next'
import './globals.css'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'

export const metadata: Metadata = {
  title: { default: 'Fortify Cloud — Proteção e Recuperação de Dados', template: '%s | Fortify Cloud' },
  description: 'Backup gerenciado, proteção contra ransomware, recuperação testada, controle de acesso, relatórios e monitoramento para empresas.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.fortifysec.com.br'),
}
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="pt-BR"><body><SiteHeader/>{children}<SiteFooter/></body></html>}
