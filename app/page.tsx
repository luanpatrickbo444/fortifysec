import Link from 'next/link'
import {
  ArchiveRestore,
  ArrowRight,
  BarChart3,
  Check,
  CheckCircle2,
  Cloud,
  DatabaseBackup,
  Headphones,
  LockKeyhole,
  ShieldCheck,
  UsersRound,
} from 'lucide-react'

const capabilities = [
  { icon: DatabaseBackup, title: 'Backup gerenciado', copy: 'Políticas, retenção e rotinas monitoradas pela Fortify.' },
  { icon: ShieldCheck, title: 'Proteção contra ransomware', copy: 'Camadas de proteção para reduzir o risco de perda e indisponibilidade.' },
  { icon: ArchiveRestore, title: 'Recuperação testada', copy: 'Restaurações controladas para validar que a cópia realmente funciona.' },
  { icon: LockKeyhole, title: 'Controle e criptografia', copy: 'Acesso restrito, rastreabilidade e proteção dos dados conforme o ambiente.' },
  { icon: BarChart3, title: 'Relatórios executivos', copy: 'Indicadores de saúde, falhas, capacidade e risco em linguagem de negócio.' },
  { icon: Headphones, title: 'Operação acompanhada', copy: 'Monitoramento, suporte e atuação sobre eventos relevantes de proteção.' },
]

const pilotSteps = [
  ['01', 'Diagnóstico', 'Mapeamos o workload inicial, o volume de dados e os principais riscos.'],
  ['02', 'Implantação', 'Configuramos a proteção e colocamos o ambiente em monitoramento.'],
  ['03', '30 dias de operação', 'Acompanhamos as execuções e tratamos falhas do piloto.'],
  ['04', 'Recovery test', 'Executamos um teste de restauração e documentamos o resultado.'],
  ['05', 'Relatório executivo', 'Você recebe os resultados e decide se deseja continuar.'],
]

const plans = [
  {
    name: 'ESSENCIAL',
    audience: 'Pequenas empresas',
    price: 'R$ 997',
    points: ['Backup gerenciado', 'Relatório mensal', 'Recuperação de arquivos', 'Suporte e monitoramento'],
  },
  {
    name: 'BUSINESS',
    audience: 'Empresas médias',
    price: 'R$ 2.497',
    featured: true,
    points: ['Tudo do Essencial', 'Runbook de recuperação', 'Recovery tests ampliados', 'Acompanhamento prioritário'],
  },
  {
    name: 'ENTERPRISE',
    audience: 'Infraestrutura crítica',
    price: 'R$ 5.000+',
    points: ['Arquitetura customizada', 'Múltiplos destinos', 'DR e governança', 'SLA sob contrato'],
  },
]

export default function Home() {
  return (
    <main className="corp-home">
      <section className="corp-hero">
        <div className="container corp-hero-grid">
          <div className="corp-hero-copy">
            <div className="corp-eyebrow">FORTIFY CLOUD · BUSINESS CONTINUITY</div>
            <h1>Proteção de dados corporativos que sua empresa consegue <em>comprovar.</em></h1>
            <p>
              Backup gerenciado, monitoramento e recuperação testada para reduzir o risco de paralisação. Comece com uma avaliação operacional de 30 dias antes de contratar.
            </p>
            <div className="corp-actions">
              <Link className="btn btn-large" href="/cadastro">INICIAR AVALIAÇÃO DE 30 DIAS <ArrowRight size={17}/></Link>
              <Link className="btn secondary btn-large" href="/como-funciona">ENTENDER A OPERAÇÃO</Link>
            </div>
            <div className="corp-trust-row">
              <span><CheckCircle2 size={16}/> Sem cobrança automática</span>
              <span><CheckCircle2 size={16}/> 1 workload inicial</span>
              <span><CheckCircle2 size={16}/> Recovery test incluído</span>
            </div>
          </div>

          <aside className="corp-assessment-card" aria-label="Resumo da avaliação Fortify">
            <div className="corp-assessment-head">
              <span>AVALIAÇÃO FORTIFY</span>
              <strong>30 DIAS</strong>
            </div>
            <div className="corp-assessment-body">
              <div><span>Escopo inicial</span><strong>1 workload</strong></div>
              <div><span>Backup</span><strong>Automático</strong></div>
              <div><span>Monitoramento</span><strong>Ativo</strong></div>
              <div><span>Validação</span><strong>Recovery test</strong></div>
              <div><span>Entrega final</span><strong>Relatório executivo</strong></div>
            </div>
            <div className="corp-assessment-status"><ShieldCheck size={18}/><span>SEM COMPROMISSO DE CONTINUIDADE</span></div>
          </aside>
        </div>
      </section>

      <section className="corp-proof-strip">
        <div className="container corp-proof-grid">
          <div><Cloud size={20}/><span>BACKUP EM NUVEM</span></div>
          <div><ShieldCheck size={20}/><span>ANTI-RANSOMWARE</span></div>
          <div><ArchiveRestore size={20}/><span>RECUPERAÇÃO TESTADA</span></div>
          <div><BarChart3 size={20}/><span>RELATÓRIO EXECUTIVO</span></div>
        </div>
      </section>

      <section className="corp-section">
        <div className="container">
          <div className="corp-section-head">
            <div>
              <div className="corp-eyebrow">AVALIAÇÃO OPERACIONAL</div>
              <h2>Primeiro entregamos evidência. Depois falamos de contrato.</h2>
            </div>
            <p>Durante o piloto, a Fortify coloca a proteção em funcionamento no ambiente real, acompanha as execuções e prova a capacidade de recuperação.</p>
          </div>

          <div className="corp-pilot-grid">
            {pilotSteps.map(([number, title, copy]) => (
              <article key={number}>
                <span>{number}</span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="corp-section corp-section-soft">
        <div className="container corp-risk-grid">
          <div>
            <div className="corp-eyebrow">RISCO OPERACIONAL</div>
            <h2>Ter um backup não significa estar preparado para um incidente.</h2>
            <p className="corp-body-copy">O problema aparece quando a empresa descobre, durante uma falha real, que ninguém validou a cópia, o processo de restauração ou o tempo necessário para voltar.</p>
            <Link className="corp-inline-link" href="/solucoes">VER SOLUÇÕES DE PROTEÇÃO <ArrowRight size={15}/></Link>
          </div>

          <div className="corp-risk-panel">
            <div><span>01</span><strong>Cópias sem validação</strong><p>Backup executado não garante restauração bem-sucedida.</p></div>
            <div><span>02</span><strong>Falhas sem visibilidade</strong><p>Jobs podem falhar por dias sem uma rotina clara de acompanhamento.</p></div>
            <div><span>03</span><strong>Recuperação improvisada</strong><p>Sem teste e runbook, o incidente vira tentativa e erro.</p></div>
          </div>
        </div>
      </section>

      <section className="corp-section">
        <div className="container">
          <div className="corp-section-head">
            <div>
              <div className="corp-eyebrow">SERVIÇO GERENCIADO</div>
              <h2>Uma operação de proteção, não apenas uma ferramenta.</h2>
            </div>
            <p>A Fortify combina tecnologia especializada com processo operacional, visibilidade e acompanhamento contínuo.</p>
          </div>
          <div className="corp-capability-grid">
            {capabilities.map(({ icon: Icon, title, copy }) => (
              <article key={title}>
                <div className="corp-icon-box"><Icon size={21}/></div>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="corp-section corp-section-soft">
        <div className="container corp-ops-grid">
          <div>
            <div className="corp-eyebrow">VISIBILIDADE OPERACIONAL</div>
            <h2>Seu time acompanha a saúde da proteção em um único portal.</h2>
            <p className="corp-body-copy">Ativos, backups, incidentes, recovery tests, relatórios e suporte ficam centralizados para o cliente. A operação técnica permanece sob gestão da Fortify.</p>
            <div className="corp-check-list">
              <span><Check size={15}/> Status de proteção</span>
              <span><Check size={15}/> Histórico de backups</span>
              <span><Check size={15}/> Ativos protegidos</span>
              <span><Check size={15}/> Incidentes e alertas</span>
              <span><Check size={15}/> Testes de recuperação</span>
              <span><Check size={15}/> Relatórios mensais</span>
            </div>
          </div>
          <div className="corp-ops-card">
            <div className="corp-ops-top"><span>FORTIFY CLOUD</span><strong>OPERAÇÃO NORMAL</strong></div>
            <div className="corp-ops-metrics">
              <div><span>PROTECTION STATUS</span><strong>ATIVO</strong></div>
              <div><span>WORKLOADS</span><strong>MONITORADOS</strong></div>
              <div><span>BACKUP JOBS</span><strong>ACOMPANHADOS</strong></div>
              <div><span>RECOVERY TEST</span><strong>VALIDADO</strong></div>
            </div>
          </div>
        </div>
      </section>

      <section className="corp-section">
        <div className="container">
          <div className="corp-section-head">
            <div>
              <div className="corp-eyebrow">PLANOS</div>
              <h2>Depois da avaliação, escolha o nível de gestão.</h2>
            </div>
            <p>O piloto não gera cobrança automática. A continuidade só acontece após sua aprovação.</p>
          </div>

          <div className="corp-plan-grid">
            {plans.map((plan) => (
              <article className={plan.featured ? 'featured' : ''} key={plan.name}>
                {plan.featured && <span className="corp-plan-badge">MAIS INDICADO</span>}
                <small>{plan.audience}</small>
                <h3>{plan.name}</h3>
                <div className="corp-plan-price"><strong>{plan.price}</strong><span>/mês</span></div>
                <div className="corp-plan-list">
                  {plan.points.map((item) => <span key={item}><Check size={14}/>{item}</span>)}
                </div>
                <Link className={plan.featured ? 'btn full' : 'btn full secondary'} href="/contato">SOLICITAR PROPOSTA</Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="corp-final">
        <div className="container corp-final-panel">
          <div>
            <div className="corp-eyebrow">30 DIAS SEM CUSTO</div>
            <h2>Valide sua estratégia de backup antes de depender dela.</h2>
            <p>Implantação assistida, acompanhamento das execuções, recovery test e relatório final.</p>
          </div>
          <div className="corp-final-actions">
            <Link className="btn btn-large" href="/cadastro">INICIAR AVALIAÇÃO <ArrowRight size={17}/></Link>
            <Link className="btn secondary" href="/contato">FALAR COM ESPECIALISTA</Link>
          </div>
        </div>
      </section>

      <p className="fine-print container">* O escopo da avaliação é definido após diagnóstico. Armazenamento, retenção, SLA e tempos de recuperação dos planos pagos são formalizados em proposta e contrato.</p>
    </main>
  )
}
