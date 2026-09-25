"use client";

import { useState } from "react";
import {
  MessageCircle,
  GraduationCap,
  Menu,
  X,
  BookOpen,
  FlaskConical,
  Award,
  Trophy,
  Users,
  Laptop,
  Shield,
  Wifi,
  Smartphone,
  Bot,
  Flag,
  Star,
  Check,
  ChevronDown,
} from "lucide-react";

const trilhas = [
  "Fundamentos de Segurança da Informação e Pentest",
  "Dominando o Linux e shell para pentesters",
  "Introdução ao Python e algoritmos",
  "Fundamentos de criptografia e senhas",
  "Fundamentos de redes para pentesters",
  "Dominando o recon em pentest",
  "Pentest em infraestrutura de redes",
  "Ataque em aplicações web",
  "Pentest em ambientes em nuvem",
  "Blue Team, SIEM e resposta a incidentes",
  "Forense digital e análise de malware",
  "Metodologias de pentest na prática",
];

const certificacoes = [
  { icon: Shield, code: "FYCP", name: "Fortify Certified Pentester", hours: "180h · prova prática" },
  { icon: Wifi, code: "FYWP", name: "Fortify Wireless Pentester", hours: "48h · prova prática" },
  { icon: Smartphone, code: "FYAP", name: "Fortify Android Pentester", hours: "64h · prova prática" },
  { icon: Bot, code: "FYES", name: "Fortify Evasion Specialist", hours: "72h · prova prática" },
];

const passos = [
  "Estude no streaming",
  "Pratique em labs e CTFs",
  "Tire dúvidas com pentesters",
  "Execute um pentest realístico",
  "Entregue um relatório de mercado",
  "Passe pela entrevista técnica",
  "Receba a certificação",
  "Kit físico em casa",
];

const depoimentos = [
  {
    texto: "Saí do absoluto zero. Em poucos meses já estava automatizando recon e escrevendo relatórios como no mercado.",
    nome: "Letícia Rodrigues",
    cargo: "Estudante de Cibersegurança",
  },
  {
    texto: "A prova prática foi pesada — três dias de exploração e dois de relatório. Exatamente o que o cliente cobra.",
    nome: "Lucas Santos",
    cargo: "Pentester · FYCP",
  },
  {
    texto: "O mix de ataque e defesa mudou meu olhar no SOC. Entendi a cadeia completa, não só o alerta do SIEM.",
    nome: "Marina Alves",
    cargo: "Analista Blue Team",
  },
];

const faqs = [
  {
    q: "Preciso de experiência prévia?",
    a: "Não. A trilha começa no absoluto zero: Linux, redes, programação e depois pentest. Quem já atua em TI acelera os módulos iniciais.",
  },
  {
    q: "Por quanto tempo tenho acesso?",
    a: "No plano Básico você tem 12 meses. Nos planos Completo e Premium o acesso é vitalício, incluindo atualizações futuras.",
  },
  {
    q: "As certificações são práticas?",
    a: "Sim. Todas envolvem prova prática em lab controlado, relatório e entrevista técnica — no padrão do mercado.",
  },
  {
    q: "Tem garantia?",
    a: "Sim. 7 dias de garantia incondicional. Se não gostar, devolvemos 100% do valor pago.",
  },
];

function PosterCard({
  label,
  title,
  subtitle,
  className,
  posterClass,
}: {
  label: string;
  title: string;
  subtitle?: React.ReactNode;
  className?: string;
  posterClass: string;
}) {
  return (
    <article
      className={`absolute h-[360px] w-[230px] overflow-hidden rounded-xl border border-white/10 shadow-2xl sm:h-[420px] sm:w-[250px] ${className ?? ""}`}
    >
      <div className={`absolute inset-0 ${posterClass}`} />
      {/* abstract pattern overlay */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle at 30% 40%, rgba(167,139,250,0.5) 0%, transparent 50%), radial-gradient(circle at 70% 70%, rgba(103,232,249,0.25) 0%, transparent 40%)",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
      <div className="absolute top-4 left-4 text-[11px] tracking-[0.2em] text-cyan uppercase">
        {label}
      </div>
      <div className="absolute right-4 bottom-4 left-4">
        <p className="display text-2xl font-semibold leading-tight">{title}</p>
        {subtitle && <p className="mt-2 text-sm text-muted">{subtitle}</p>}
      </div>
    </article>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="hero-wash min-h-screen">
      <header className="sticky top-0 z-40 border-b border-border bg-bg/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <a className="flex items-center gap-2.5" href="/">
            <span className="display grid size-8 place-items-center rounded-md bg-violet text-lg font-bold text-bg">
              F
            </span>
            <span className="display text-lg font-semibold tracking-wide">FORTIFY</span>
          </a>

          <nav className="hidden items-center gap-7 text-sm text-muted md:flex">
            <a href="#trilhas" className="hover:text-fg">Trilhas</a>
            <a href="#certificacoes" className="hover:text-fg">Certificações</a>
            <a href="#ctf" className="hover:text-fg">CTF</a>
            <a href="#planos" className="hover:text-fg">Planos</a>
          </nav>

          <div className="hidden items-center gap-2 sm:flex">
            <a
              href="#contato"
              className="inline-flex h-10 items-center gap-2 rounded-md border border-border px-3 text-sm text-fg hover:bg-elevated"
            >
              <MessageCircle className="size-4 text-lime" />
              <span className="hidden lg:inline">(11) 99588-0000</span>
            </a>
            <a
              className="inline-flex h-10 items-center gap-2 rounded-md border border-border px-3 text-sm text-fg hover:bg-elevated"
              href="#planos"
            >
              <GraduationCap className="size-4" />
              Já sou aluno
            </a>
            <button
              type="button"
              className="hidden h-10 rounded-md bg-lime px-4 text-sm font-semibold text-lime-fg hover:brightness-110 lg:inline-flex lg:items-center"
            >
              Quero assinar
            </button>
          </div>

          <button
            type="button"
            className="rounded-md p-2 text-fg md:hidden"
            aria-label="Abrir menu"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-border bg-bg px-4 py-4 md:hidden">
            <nav className="flex flex-col gap-3 text-sm">
              <a href="#trilhas" onClick={() => setMenuOpen(false)}>Trilhas</a>
              <a href="#certificacoes" onClick={() => setMenuOpen(false)}>Certificações</a>
              <a href="#ctf" onClick={() => setMenuOpen(false)}>CTF</a>
              <a href="#planos" onClick={() => setMenuOpen(false)}>Planos</a>
              <a
                href="#contato"
                className="inline-flex items-center gap-2 text-lime"
                onClick={() => setMenuOpen(false)}
              >
                <MessageCircle className="size-4" /> (11) 99588-0000
              </a>
            </nav>
          </div>
        )}
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:py-16">
          <div>
            <p className="display one-title text-4xl font-light tracking-tight sm:text-5xl">
              FORTIFY ONE
            </p>
            <h1 className="display mt-5 text-3xl font-semibold leading-tight sm:text-4xl">
              Hacking e Cibersegurança
              <br />
              do Zero ao Avançado.
            </h1>
            <p className="mt-4 max-w-md text-muted">
              Novidades o ano todo. Tudo numa única formação — labs, CTFs,
              certificações práticas e comunidade.
            </p>
            <button
              type="button"
              className="mt-8 inline-flex h-12 items-center rounded-md bg-lime px-7 text-sm font-bold tracking-wide text-lime-fg hover:brightness-110"
            >
              QUERO ASSINAR AGORA
            </button>
          </div>

          <div className="card-stack relative mx-auto h-[420px] w-full max-w-[420px] sm:h-[480px]">
            <PosterCard
              label="LABS"
              title="Ambientes reais"
              className="right-0 top-8 hidden rotate-6 sm:block"
              posterClass="poster-labs"
            />
            <PosterCard
              label="BLUE TEAM"
              title="Defesa ativa"
              className="right-8 top-4 rotate-3"
              posterClass="poster-soc"
            />
            <PosterCard
              label="10ª EDIÇÃO"
              title="CAPTURE THE FLAG"
              subtitle={
                <>
                  Prêmio de <span className="text-fg">R$ 15.000</span>
                </>
              }
              className="left-4 top-0 sm:left-auto sm:right-16"
              posterClass="poster-ctf"
            />
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: BookOpen, title: "12 módulos do zero ao avançado", desc: "Mais de 360 horas de conteúdo estruturado" },
              { icon: FlaskConical, title: "Labs que simulam situações reais", desc: "Alvos controlados para pentest e forense" },
              { icon: Award, title: "4 certificações práticas", desc: "Pentest, wireless, mobile e evasão" },
              { icon: Trophy, title: "2 CTFs por ano e prêmios", desc: "R$ 30 mil em premiação anual" },
              { icon: Users, title: "Comunidade e suporte", desc: "Grupo de networking e dúvidas com pentesters" },
              { icon: Laptop, title: "Assista offline pelo app", desc: "Estude no ritmo da sua rotina" },
            ].map((item) => (
              <div key={item.title} className="flex gap-4 rounded-lg px-1 py-3">
                <div className="grid size-11 shrink-0 place-items-center rounded-md border border-border bg-elevated">
                  <item.icon className="size-5 text-violet" />
                </div>
                <div>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-sm text-muted">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Trilhas */}
        <section id="trilhas" className="border-t border-border py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <p className="text-xs font-medium tracking-[0.2em] text-violet uppercase">
              Confira as trilhas
            </p>
            <h2 className="display mt-2 text-3xl font-semibold">
              Não importa o seu nível.
              <span className="block text-muted">Vá do zero ao profissional.</span>
            </h2>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {trilhas.map((t) => (
                <div
                  key={t}
                  className="flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3"
                >
                  <span className="size-1.5 shrink-0 rounded-full bg-violet" />
                  <span className="text-sm">{t}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Certificações */}
        <section id="certificacoes" className="py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="display text-3xl font-semibold">
              Se torne um profissional certificado
            </h2>
            <p className="mt-2 max-w-xl text-muted">
              Comprove ao mercado sua expertise e receba o kit de certificação em casa.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {certificacoes.map((c) => (
                <article
                  key={c.code}
                  className="rounded-xl border border-border bg-surface p-5"
                >
                  <c.icon className="size-6 text-violet" />
                  <p className="mt-4 text-xs tracking-widest text-cyan uppercase">{c.code}</p>
                  <h3 className="mt-1 font-medium">{c.name}</h3>
                  <p className="mt-2 text-sm text-muted">{c.hours}</p>
                </article>
              ))}
            </div>
            <ol className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {passos.map((p, i) => (
                <li key={p} className="flex gap-3 rounded-lg bg-elevated p-4">
                  <span className="display text-xl font-light text-violet">{i + 1}</span>
                  <span className="text-sm leading-snug">{p}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* CTF */}
        <section id="ctf" className="border-y border-border py-16">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2">
            <div>
              <p className="text-xs font-medium tracking-[0.2em] text-lime uppercase">
                Capture the Flag
              </p>
              <h2 className="display mt-2 text-3xl font-semibold">
                Venha ser o novo campeão
              </h2>
              <p className="mt-3 text-muted">
                Dois campeonatos por ano, cenários realistas e R$ 15.000 em PIX
                para o primeiro lugar de cada edição. Treine como no mercado.
              </p>
              <ul className="mt-6 space-y-2 text-sm">
                {[
                  "Web, infra, wireless e forense no mesmo evento",
                  "Hall da fama com os campeões de cada edição",
                  "Incluso em qualquer plano Fortify One",
                ].map((item) => (
                  <li key={item} className="flex gap-2">
                    <Flag className="mt-0.5 size-4 shrink-0 text-lime" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative overflow-hidden rounded-xl border border-border">
              <div className="poster-ctf h-80 w-full" />
              <div
                className="absolute inset-0 opacity-40"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 50% 40%, rgba(167,139,250,0.6) 0%, transparent 55%)",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/30 to-transparent" />
              <div className="absolute bottom-5 left-5">
                <p className="text-xs tracking-widest text-cyan uppercase">Prêmio</p>
                <p className="display text-3xl font-semibold">R$ 15.000</p>
                <p className="text-sm text-muted">no PIX para o primeiro lugar</p>
              </div>
            </div>
          </div>
        </section>

        {/* Depoimentos */}
        <section className="py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="display text-3xl font-semibold">Quem estudou, recomenda</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {depoimentos.map((d) => (
                <blockquote
                  key={d.nome}
                  className="rounded-xl border border-border bg-surface p-5"
                >
                  <div className="mb-3 flex gap-1 text-lime">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="size-3.5 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed text-muted">&ldquo;{d.texto}&rdquo;</p>
                  <footer className="mt-4">
                    <p className="text-sm font-medium">{d.nome}</p>
                    <p className="text-xs text-subtle">{d.cargo}</p>
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>

        {/* Planos */}
        <section id="planos" className="border-t border-border py-16">
          <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
            <h2 className="display text-3xl font-semibold">Escolha o seu acesso</h2>
            <p className="mt-2 text-muted">
              Tudo numa única assinatura. Cancele a garantia em 7 dias.
            </p>
            <div className="mt-10 grid items-stretch gap-4 text-left md:grid-cols-3">
              <article className="relative rounded-xl border border-border bg-surface p-6">
                <p className="text-sm text-muted">Básico</p>
                <p className="display mt-2 text-4xl font-semibold">R$ 1.997</p>
                <p className="mt-1 text-sm text-subtle">ou 12x de R$ 197</p>
                <ul className="mt-6 space-y-2 text-sm">
                  {["Acesso à grade completa", "Labs práticos", "Certificado de conclusão", "Acesso por 12 meses"].map(
                    (f) => (
                      <li key={f} className="flex gap-2">
                        <Check className="mt-0.5 size-4 shrink-0 text-lime" />
                        {f}
                      </li>
                    )
                  )}
                </ul>
                <button
                  type="button"
                  className="mt-7 h-12 w-full rounded-md border border-border text-sm font-semibold hover:bg-elevated"
                >
                  Começar
                </button>
              </article>

              <article className="relative rounded-xl border border-violet/50 bg-surface p-6 md:-translate-y-2 shadow-[0_0_40px_rgba(167,139,250,0.12)]">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-violet px-3 py-1 text-[11px] font-bold text-bg">
                  MAIS POPULAR
                </span>
                <p className="text-sm text-muted">Completo</p>
                <p className="display mt-2 text-4xl font-semibold">R$ 2.997</p>
                <p className="mt-1 text-sm text-subtle">ou 12x de R$ 297</p>
                <ul className="mt-6 space-y-2 text-sm">
                  {[
                    "Tudo do Básico",
                    "Acesso vitalício",
                    "Comunidade exclusiva",
                    "Atualizações futuras",
                    "Mentoria em grupo",
                  ].map((f) => (
                    <li key={f} className="flex gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-lime" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  className="mt-7 h-12 w-full rounded-md bg-lime text-sm font-semibold text-lime-fg hover:brightness-110"
                >
                  Quero esse
                </button>
              </article>

              <article className="relative rounded-xl border border-border bg-surface p-6">
                <p className="text-sm text-muted">Premium</p>
                <p className="display mt-2 text-4xl font-semibold">R$ 3.997</p>
                <p className="mt-1 text-sm text-subtle">ou 12x de R$ 397</p>
                <ul className="mt-6 space-y-2 text-sm">
                  {[
                    "Tudo do Completo",
                    "Mentoria 1:1 (4 sessões)",
                    "Revisão de projetos",
                    "Kit certificado físico",
                    "Banco de talentos",
                  ].map((f) => (
                    <li key={f} className="flex gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-lime" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  className="mt-7 h-12 w-full rounded-md border border-border text-sm font-semibold hover:bg-elevated"
                >
                  Começar
                </button>
              </article>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <h2 className="display text-center text-3xl font-semibold">
              Perguntas frequentes
            </h2>
            <div className="mt-8 divide-y divide-border rounded-xl border border-border bg-surface">
              {faqs.map((faq, i) => (
                <div key={faq.q}>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                    aria-expanded={openFaq === i}
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    <span className="font-medium">{faq.q}</span>
                    <ChevronDown
                      className={`size-4 shrink-0 text-muted transition-transform duration-200 ${
                        openFaq === i ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openFaq === i && (
                    <p className="px-5 pb-4 text-sm leading-relaxed text-muted">{faq.a}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 pb-20 sm:px-6">
          <div className="mx-auto max-w-4xl rounded-xl border border-border bg-elevated px-6 py-12 text-center">
            <GraduationCap className="mx-auto size-8 text-violet" />
            <h2 className="display mt-4 text-3xl font-semibold">
              Experimente 7 dias ou tenha seu dinheiro de volta
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-muted">
              A maior formação prática de cibersegurança para quem quer sair do
              tutorial e atuar de verdade.
            </p>
            <button
              type="button"
              className="mt-8 inline-flex h-12 items-center rounded-md bg-lime px-8 text-sm font-bold text-lime-fg hover:brightness-110"
            >
              QUERO ASSINAR AGORA
            </button>
          </div>
        </section>
      </main>

      <footer id="contato" className="border-t border-border py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 sm:flex-row sm:items-center sm:px-6">
          <div className="flex items-center gap-2">
            <span className="display grid size-7 place-items-center rounded-md bg-violet text-sm font-bold text-bg">
              F
            </span>
            <span className="display font-semibold">FORTIFY</span>
          </div>
          <a
            href="https://wa.me/5511995880000"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-muted hover:text-fg"
          >
            <MessageCircle className="size-4 text-lime" />
            Fale com um especialista
          </a>
          <p className="text-xs text-subtle">
            © 2026 Fortify. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
