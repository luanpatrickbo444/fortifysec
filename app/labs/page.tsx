import Link from 'next/link'
import { Boxes, Crosshair, Network, ServerCog } from 'lucide-react'

export default function LabsPublic(){
 return <main>
  <section className="hero compact-hero"><div className="container"><div className="kicker">FORTIFYSEC / CYBER RANGE</div><h1>ENTRE NO<br/><em>LAB.</em></h1><p className="hero-copy">Máquinas, cenários e ambientes controlados para transformar conhecimento em execução. Escolha um alvo, leia o briefing e coloque sua técnica à prova.</p><div className="hero-actions"><Link className="btn" href="/login">ACESSAR RANGE →</Link><Link className="btn secondary" href="/academy">VER ACADEMY</Link></div></div></section>
  <section className="section"><div className="container"><div className="feature-grid"><article className="feature-card"><ServerCog size={22}/><h3>Ambientes isolados</h3><p className="muted">Pratique em máquinas e cenários próprios para treinamento técnico.</p></article><article className="feature-card"><Network size={22}/><h3>Cenários realistas</h3><p className="muted">Infraestrutura, web, redes, cloud, Active Directory e outras superfícies de ataque.</p></article><article className="feature-card"><Crosshair size={22}/><h3>Objetivos claros</h3><p className="muted">Briefings, dificuldade e missões que transformam estudo em capacidade demonstrável.</p></article></div></div></section>
 </main>
}
