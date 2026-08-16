import Link from 'next/link'
import {
  BriefcaseBusiness,
  Check,
  Crown,
  Gauge,
  Shield,
  Sparkles,
  Trophy,
} from 'lucide-react'

export default function Planos() {
  const free = [
    'Conta e perfil técnico',
    'Conteúdos introdutórios da Academy',
    'Challenges gratuitos selecionados',
    'Ranking e visão pública de evolução',
    'Acesso ao ecossistema e às trilhas disponíveis',
  ]

  const starter = [
    'Academy completa e trilhas premium',
    'Até 10 horas de Cyber Lab por mês',
    '1 Lab ativo por vez',
    'Challenges com XP e ranking completo',
    'CTFs comunitários e eventos abertos',
    'Perfil técnico para Talent Network',
  ]

  const pro = [
    'Tudo do Starter',
    'Até 40 horas de Cyber Lab por mês',
    'Labs intermediários e avançados',
    'VPN individual por sessão de Lab',
    'CTFs exclusivos para assinantes',
    'Prioridade de provisionamento sobre o Starter',
    'Novos Labs e conteúdos durante a assinatura',
  ]

  const elite = [
    'Tudo do Pro',
    'Até 100 horas de Cyber Lab por mês',
    'Pro Labs e cenários corporativos',
    'Ambientes Windows / Active Directory quando disponíveis',
    'Prioridade máxima de provisionamento',
    'Trilhas e CTFs avançados exclusivos',
    'Benefícios especiais e acesso antecipado a novos Labs',
  ]

  const business = [
    'Gestão de equipes e acessos',
    'Painel empresarial e acompanhamento técnico',
    'Vagas, candidatos e Talent Network',
    'Pacotes de Labs e horas conforme o tamanho da equipe',
    'CTFs privados e desafios personalizados sob projeto',
    'Condições comerciais por volume de usuários',
  ]

  return (
    <main>
      <section className="section pricing-hero">
        <div className="container">
          <div className="pricing-intro">
            <div className="kicker">ACCESS PLANS</div>
            <h1>Escolha o nível certo para sua evolução.</h1>
            <p>
              Formação, prática e prova real de habilidade com limites transparentes de
              infraestrutura. Você paga pelo nível de acesso que realmente precisa.
            </p>
          </div>

          <div className="pricing-grid">
            <article className="pricing-card free-plan">
              <div className="plan-icon"><Shield size={24} /></div>
              <span className="section-index">FREE ACCESS</span>
              <h2>Grátis</h2>
              <div className="plan-price"><strong>R$ 0</strong><span>/ para começar</span></div>
              <p className="muted">
                Para conhecer a plataforma, construir seu perfil e começar a provar habilidade.
              </p>
              <div className="plan-features">
                {free.map((item) => <div key={item}><Check size={15} /><span>{item}</span></div>)}
              </div>
              <Link className="btn secondary full-btn" href="/cadastro">
                CRIAR CONTA GRÁTIS →
              </Link>
            </article>

            <article className="pricing-card">
              <div className="plan-icon"><Gauge size={24} /></div>
              <span className="section-index">STARTER RANGE</span>
              <h2>Starter</h2>
              <div className="plan-price"><strong>R$ 99,90</strong><span>/ mês</span></div>
              <p className="muted">
                Para quem quer a formação completa e prática recorrente sem uso intensivo de infraestrutura.
              </p>
              <div className="plan-features">
                {starter.map((item) => <div key={item}><Check size={15} /><span>{item}</span></div>)}
              </div>
              <Link className="btn secondary full-btn" href="/cadastro">
                COMEÇAR NO STARTER →
              </Link>
              <div className="plan-note">
                As horas de Cyber Lab são renovadas a cada ciclo mensal e não são acumulativas.
              </div>
            </article>

            <article className="pricing-card pro-plan">
              <div className="recommended-badge"><Sparkles size={12} /> MAIS ESCOLHIDO</div>
              <div className="plan-icon"><Crown size={24} /></div>
              <span className="section-index">PRO RANGE ACCESS</span>
              <h2>FortifySec Pro</h2>
              <div className="plan-price"><strong>R$ 199,90</strong><span>/ mês</span></div>
              <p className="muted">
                O plano principal para estudar, praticar com frequência e construir um portfólio técnico forte.
              </p>
              <div className="plan-features">
                {pro.map((item) => <div key={item}><Check size={15} /><span>{item}</span></div>)}
              </div>
              <Link className="btn full-btn" href="/cadastro">
                COMEÇAR NO PRO →
              </Link>
              <div className="plan-note">
                Melhor equilíbrio entre Academy, Cyber Range, Challenges, CTF e custo de infraestrutura.
              </div>
            </article>

            <article className="pricing-card">
              <div className="plan-icon"><Trophy size={24} /></div>
              <span className="section-index">ELITE RANGE ACCESS</span>
              <h2>Elite</h2>
              <div className="plan-price"><strong>R$ 299,90</strong><span>/ mês</span></div>
              <p className="muted">
                Para usuários intensivos que querem mais tempo de Range e cenários técnicos avançados.
              </p>
              <div className="plan-features">
                {elite.map((item) => <div key={item}><Check size={15} /><span>{item}</span></div>)}
              </div>
              <Link className="btn secondary full-btn" href="/cadastro">
                ENTRAR NO ELITE →
              </Link>
              <div className="plan-note">
                Uso sujeito à política de uso justo, disponibilidade do Range e limite de 1 Lab ativo por vez.
              </div>
            </article>
          </div>

          <div className="cta-panel" style={{ marginTop: 24 }}>
            <div>
              <div className="kicker">FORTIFYSEC FOR BUSINESS</div>
              <h2>Planos para empresas e equipes.</h2>
              <p className="section-copy">
                Contratação por volume, gestão centralizada e capacidade de Cyber Lab dimensionada para a equipe.
                O preço é definido conforme número de usuários, horas de infraestrutura e nível de personalização.
              </p>
              <div className="plan-features" style={{ marginTop: 18 }}>
                {business.map((item) => <div key={item}><Check size={15} /><span>{item}</span></div>)}
              </div>
            </div>
            <div>
              <div className="plan-icon"><BriefcaseBusiness size={26} /></div>
              <span className="section-index">BUSINESS / TEAMS</span>
              <h3 style={{ fontSize: 28, margin: '10px 0' }}>Sob consulta</h3>
              <p className="muted">
                Proposta dimensionada para evitar cobrança genérica e garantir capacidade adequada de Labs para cada operação.
              </p>
              <Link className="btn full-btn" href="/empresa/cadastro">
                FALAR SOBRE PLANO EMPRESARIAL →
              </Link>
            </div>
          </div>

          <div className="card" style={{ marginTop: 16 }}>
            <span className="section-index">POLÍTICA DE USO DO CYBER RANGE</span>
            <h3 style={{ margin: '7px 0 10px' }}>Infraestrutura com limites claros e sustentáveis.</h3>
            <p className="muted" style={{ margin: 0, lineHeight: 1.7 }}>
              As horas de Cyber Lab contam somente enquanto uma sessão provisionada estiver ativa. Cada conta pode manter
              apenas 1 Lab ativo por vez. Horas não utilizadas não acumulam para o mês seguinte. Sessões ociosas podem ser
              encerradas automaticamente e usos abusivos ou incompatíveis com as regras da plataforma podem ser bloqueados.
              Esses limites permitem manter disponibilidade, desempenho e preços previsíveis para toda a comunidade.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
