import Link from 'next/link'
import { Boxes, KeyRound, Network, ServerCog } from 'lucide-react'

export default function LabsPublic(){
  return <main>
    <section className="hero compact-hero"><div className="container"><div className="kicker">FORTIFYSEC / CYBER RANGE</div><h1>ENTRE NO<br/><em>LAB.</em></h1><p className="hero-copy">Máquinas, cenários e ambientes controlados para transformar conhecimento em execução. O endpoint real do laboratório nunca fica exposto no catálogo público.</p><div className="hero-actions"><Link className="btn" href="/login">ACESSAR RANGE →</Link><Link className="btn secondary" href="/academy">VER ACADEMY</Link></div></div></section>
    <section className="section"><div className="container"><div className="feature-grid">
      <article className="feature-card"><ServerCog size={22}/><h3>Sessão protegida</h3><p className="muted">O backend valida usuário e acesso antes de iniciar ou revelar a conexão.</p></article>
      <article className="feature-card"><Network size={22}/><h3>Provider dinâmico</h3><p className="muted">Suporte para provedor externo de VMs/containers ou endpoint fixo administrado.</p></article>
      <article className="feature-card"><KeyRound size={22}/><h3>Controle de acesso</h3><p className="muted">Conta bloqueada ou sem acesso ativo não consegue iniciar Lab por URL direta.</p></article>
    </div></div></section>
  </main>
}
