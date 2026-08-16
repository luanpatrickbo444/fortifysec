import Link from 'next/link'
import { ArrowUpRight, BadgeCheck, Binary, BriefcaseBusiness, Building2, ShieldCheck, Sparkles, UsersRound } from 'lucide-react'

export function CompanyAuthShell({
  children,
  eyebrow,
  title,
  description,
}: {
  children: React.ReactNode
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <main className="company-auth-page">
      <section className="company-auth-shell">
        <div className="company-auth-visual">
          <Link className="company-auth-brand" href="/">
            <span className="company-brand-mark">F</span>
            <span>
              <strong>FORTIFYSEC</strong>
              <small>EMPLOYER NETWORK</small>
            </span>
          </Link>

          <div className="company-auth-copy">
            <div className="kicker">EMPLOYER // ACCESS</div>
            <h1>
              Recrute por <em>evidência técnica</em>, não só por currículo.
            </h1>
            <p>
              Publique oportunidades, acompanhe candidaturas e encontre profissionais que demonstram evolução prática em Academy, Labs, Challenges e CTF.
            </p>
          </div>

          <div className="company-auth-feature-grid">
            <article>
              <UsersRound size={18} />
              <strong>Talent Search</strong>
              <span>Encontre perfis públicos por XP, disponibilidade e posição técnica.</span>
            </article>
            <article>
              <BriefcaseBusiness size={18} />
              <strong>Job Console</strong>
              <span>Crie, publique, edite e encerre vagas em um único painel.</span>
            </article>
            <article>
              <ShieldCheck size={18} />
              <strong>Rede validada</strong>
              <span>Empresas passam por validação antes da publicação de oportunidades.</span>
            </article>
          </div>

          <div className="company-auth-terminal">
            <div className="terminal-head">
              <span className="terminal-dot" />
              <span className="terminal-dot" />
              <span className="terminal-dot" />
              employer_network.log
            </div>
            <div className="company-terminal-body">
              <span><Binary size={13} /> signal.source = <b>FORTIFYSEC_RANGE</b></span>
              <span><BadgeCheck size={13} /> skills.proof = <b>ACTIVITY + XP</b></span>
              <span><Sparkles size={13} /> hiring.mode = <b>EVIDENCE_DRIVEN</b></span>
            </div>
          </div>
        </div>

        <div className="company-auth-form-panel">
          <section className="company-login-card">
            <div className="company-login-head">
              <div className="company-login-icon"><Building2 size={23} /></div>
              <div>
                <span className="section-index">{eyebrow}</span>
                <h2>{title}</h2>
                <p>{description}</p>
              </div>
            </div>
            {children}
            <Link className="company-auth-back" href="/">
              VOLTAR PARA FORTIFYSEC <ArrowUpRight size={12} />
            </Link>
          </section>
        </div>
      </section>
    </main>
  )
}
