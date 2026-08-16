import Link from 'next/link'
import { Flag, Medal, Trophy } from 'lucide-react'

export default function CtfPublic(){
  return <main>
    <section className="hero compact-hero"><div className="container"><div className="kicker">FORTIFYSEC / CTF</div><h1>NÃO É UMA PROVA.<br/><em>É UMA BATALHA.</em></h1><p className="hero-copy">Competições, ranking e desafios para transformar desempenho técnico em reputação. Entre no evento, resolva as missões e dispute posição no ranking.</p><div className="hero-actions"><Link className="btn" href="/cadastro">ENTRAR NA PLATAFORMA →</Link><Link className="btn secondary" href="/talentos">VER TALENTOS</Link></div></div></section>
    <section className="section"><div className="container"><div className="feature-grid">
      <article className="feature-card"><Flag size={22}/><h3>Eventos</h3><p className="muted">Competições com tempo definido, missões progressivas e premiações especiais.</p></article>
      <article className="feature-card"><Trophy size={22}/><h3>Ranking</h3><p className="muted">XP da plataforma alimenta classificação e histórico técnico.</p></article>
      <article className="feature-card"><Medal size={22}/><h3>Proof of Skill</h3><p className="muted">O que aparece no perfil vem de ações executadas dentro da plataforma.</p></article>
    </div></div></section>
  </main>
}
