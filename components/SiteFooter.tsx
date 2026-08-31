'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function SiteFooter(){
  const pathname=usePathname()
  if(pathname.startsWith('/painel')||pathname.startsWith('/admin')||['/acesso','/cadastro','/recuperar-senha','/atualizar-senha'].includes(pathname))return null
  return <footer className="footer enterprise-footer">
    <div className="container footer-grid">
      <div className="footer-company">
        <Link className="public-brand" href="/"><span className="public-brand-mark">F</span><span className="public-brand-copy"><b>Fortify Cloud</b><small>Managed Data Protection</small></span></Link>
        <p>Proteção gerenciada, backup e recuperação testada para continuidade de negócios.</p>
      </div>
      <div><strong>SOLUÇÕES</strong><Link href="/solucoes">Backup gerenciado</Link><Link href="/solucoes">Proteção contra ransomware</Link><Link href="/como-funciona">Recuperação testada</Link></div>
      <div><strong>EMPRESA</strong><Link href="/planos">Planos</Link><Link href="/contato">Falar com especialista</Link><Link href="/cadastro">Avaliação de 30 dias</Link><Link href="/acesso">Portal do cliente</Link></div>
      <div><strong>LEGAL & ACESSO</strong><Link href="/privacidade">Privacidade</Link><Link href="/termos">Termos</Link><span>Atendimento corporativo · Brasil</span><span>www.fortifysec.com.br</span></div>
    </div>
    <div className="container footer-bottom"><span>© 2026 FortifySec. Todos os direitos reservados.</span><span>Fortify Cloud · Business Continuity</span></div>
  </footer>
}
