import Link from 'next/link'
import { BookOpen, CheckCircle2, GraduationCap, ShieldCheck, Zap } from 'lucide-react'

export default function AcademyPublic(){
  return <main>
    <section className="hero compact-hero"><div className="container"><div className="kicker">FORTIFYSEC / ACADEMY</div><h1>ESTUDE.<br/><em>PRATIQUE.</em><br/>EVOLUA.</h1><p className="hero-copy">A trilha de formação alimenta o cyber range. Curso, aula, progresso e XP trabalham juntos — sem liberar conteúdo antes da matrícula estar ativa.</p><div className="hero-actions"><Link className="btn" href="/cadastro">CRIAR CONTA →</Link><Link className="btn secondary" href="/login">ENTRAR</Link></div></div></section>
    <section className="section"><div className="container"><div className="feature-grid">
      <article className="feature-card"><GraduationCap size={22}/><h3>Trilhas e cursos</h3><p className="muted">Conteúdo organizado em cursos, aulas, vídeo, material e progressão por XP.</p></article>
      <article className="feature-card"><ShieldCheck size={22}/><h3>Matrícula real</h3><p className="muted">Aluno não cria nem ativa matrícula pelo navegador. A liberação acontece por pagamento aprovado ou administrador.</p></article>
      <article className="feature-card"><Zap size={22}/><h3>XP verificável</h3><p className="muted">Conclusões registradas no servidor alimentam perfil e ranking sem progresso fictício.</p></article>
    </div></div></section>
    <section className="section alt"><div className="container cta-panel"><div><div className="kicker">ACADEMY → RANGE</div><h2>Aprender é só a primeira etapa.</h2><p className="muted">Depois da teoria, siga para Labs, Challenges e CTF.</p></div><div className="hero-actions"><Link className="btn" href="/labs">VER LABS</Link><Link className="btn secondary" href="/ctf">VER CTF</Link></div></div></section>
  </main>
}
