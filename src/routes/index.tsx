import { useState } from "react";
import {
  Award,
  BookOpen,
  Bot,
  Check,
  ChevronDown,
  Flag,
  FlaskConical,
  GraduationCap,
  Laptop,
  MessageCircle,
  Shield,
  Smartphone,
  Star,
  Trophy,
  Users,
  Wifi,
} from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { PLANS, type PlanId } from "@/lib/enrollment";
import { CHECKOUT, WHATSAPP } from "@/lib/links";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({ component: Home });

const TRACKS = [
  { id: "FYCP", title: "Fortify Certified Pentester", hours: "180h", icon: Shield },
  { id: "FYWP", title: "Fortify Wireless Pentester", hours: "48h", icon: Wifi },
  { id: "FYAP", title: "Fortify Android Pentester", hours: "64h", icon: Smartphone },
  { id: "FYES", title: "Fortify Evasion Specialist", hours: "72h", icon: Bot },
];

const MODULES = [
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

const STEPS = [
  "Estude no streaming",
  "Pratique em labs e CTFs",
  "Tire dúvidas com pentesters",
  "Execute um pentest realístico",
  "Entregue um relatório de mercado",
  "Passe pela entrevista técnica",
  "Receba a certificação",
  "Kit físico em casa",
];

const FAQS = [
  {
    q: "Preciso de experiência prévia?",
    a: "Não. A trilha começa no absoluto zero: Linux, redes, programação e depois pentest. Quem já atua em TI acelera os módulos iniciais.",
  },
  {
    q: "Por quanto tempo tenho acesso?",
    a: "O plano Básico libera 12 meses. Completo e Premium são vitalícios, com atualizações de conteúdo incluídas.",
  },
  {
    q: "As certificações são práticas?",
    a: "Sim. Você faz um pentest individualizado, entrega relatório e passa por entrevista — não é prova de múltipla escolha.",
  },
  {
    q: "Tem garantia?",
    a: "7 dias para experimentar. Se não fizer sentido, devolvemos o valor. Sem letra miúda.",
  },
];

function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="hero-wash min-h-screen">
      <SiteHeader />

      <main>
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
            <a
              href={CHECKOUT.default}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex h-12 items-center rounded-md bg-lime px-7 text-sm font-bold tracking-wide text-lime-fg hover:brightness-110"
            >
              QUERO ASSINAR AGORA
            </a>
          </div>

          <div className="card-stack relative mx-auto h-[420px] w-full max-w-[420px] sm:h-[480px]">
            <PosterCard
              src="/posters/labs.jpg"
              className="right-0 top-8 hidden rotate-6 sm:block"
              kicker="LABS"
              title="Ambientes reais"
            />
            <PosterCard
              src="/posters/soc.jpg"
              className="right-8 top-4 rotate-3"
              kicker="BLUE TEAM"
              title="Defesa ativa"
            />
            <PosterCard
              src="/posters/ctf.jpg"
              className="left-4 top-0 sm:left-auto sm:right-16"
              kicker="10ª EDIÇÃO"
              title="CAPTURE THE FLAG"
              prize
            />
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Stat icon={BookOpen} title="12 módulos do zero ao avançado" text="Mais de 360 horas de conteúdo estruturado" />
            <Stat icon={FlaskConical} title="Labs que simulam situações reais" text="Alvos controlados para pentest e forense" />
            <Stat icon={Award} title="4 certificações práticas" text="Pentest, wireless, mobile e evasão" />
            <Stat icon={Trophy} title="2 CTFs por ano e prêmios" text="R$ 30 mil em premiação anual" />
            <Stat icon={Users} title="Comunidade e suporte" text="Grupo de networking e dúvidas com pentesters" />
            <Stat icon={Laptop} title="Assista offline pelo app" text="Estude no ritmo da sua rotina" />
          </div>
        </section>

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
              {MODULES.map((mod) => (
                <div
                  key={mod}
                  className="flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3"
                >
                  <span className="size-1.5 shrink-0 rounded-full bg-violet" />
                  <span className="text-sm">{mod}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="certificacoes" className="py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="display text-3xl font-semibold">Se torne um profissional certificado</h2>
            <p className="mt-2 max-w-xl text-muted">
              Comprove ao mercado sua expertise e receba o kit de certificação em casa.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {TRACKS.map((t) => (
                <article
                  key={t.id}
                  className="rounded-xl border border-border bg-surface p-5"
                >
                  <t.icon className="size-6 text-violet" />
                  <p className="mt-4 text-xs tracking-widest text-cyan uppercase">{t.id}</p>
                  <h3 className="mt-1 font-medium">{t.title}</h3>
                  <p className="mt-2 text-sm text-muted">{t.hours} · prova prática</p>
                </article>
              ))}
            </div>

            <ol className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((step, i) => (
                <li key={step} className="flex gap-3 rounded-lg bg-elevated p-4">
                  <span className="display text-xl font-light text-violet">{i + 1}</span>
                  <span className="text-sm leading-snug">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="ctf" className="border-y border-border py-16">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2">
            <div>
              <p className="text-xs font-medium tracking-[0.2em] text-lime uppercase">
                Capture the Flag
              </p>
              <h2 className="display mt-2 text-3xl font-semibold">Venha ser o novo campeão</h2>
              <p className="mt-3 text-muted">
                Dois campeonatos por ano, cenários realistas e R$ 15.000 em PIX para o
                primeiro lugar de cada edição. Treine como no mercado.
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
              <img
                src="/posters/ctf.jpg"
                alt="Pôster da 10ª edição do Capture the Flag Fortify"
                className="h-80 w-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/20 to-transparent" />
              <div className="absolute bottom-5 left-5">
                <p className="text-xs tracking-widest text-cyan uppercase">Prêmio</p>
                <p className="display text-3xl font-semibold">R$ 15.000</p>
                <p className="text-sm text-muted">no PIX para o primeiro lugar</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="display text-3xl font-semibold">Quem estudou, recomenda</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                {
                  name: "Letícia Rodrigues",
                  role: "Estudante de Cibersegurança",
                  quote:
                    "Saí do absoluto zero. Em poucos meses já estava automatizando recon e escrevendo relatórios como no mercado.",
                },
                {
                  name: "Lucas Santos",
                  role: "Pentester · FYCP",
                  quote:
                    "A prova prática foi pesada — três dias de exploração e dois de relatório. Exatamente o que o cliente cobra.",
                },
                {
                  name: "Marina Alves",
                  role: "Analista Blue Team",
                  quote:
                    "O mix de ataque e defesa mudou meu olhar no SOC. Entendi a cadeia completa, não só o alerta do SIEM.",
                },
              ].map((t) => (
                <blockquote
                  key={t.name}
                  className="rounded-xl border border-border bg-surface p-5"
                >
                  <div className="mb-3 flex gap-1 text-lime">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="size-3.5 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed text-muted">“{t.quote}”</p>
                  <footer className="mt-4">
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-subtle">{t.role}</p>
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>

        <section id="planos" className="border-t border-border py-16">
          <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
            <h2 className="display text-3xl font-semibold">Escolha o seu acesso</h2>
            <p className="mt-2 text-muted">Tudo numa única assinatura. Cancele a garantia em 7 dias.</p>
            <div className="mt-10 grid items-stretch gap-4 text-left md:grid-cols-3">
              {(Object.keys(PLANS) as PlanId[]).map((id) => {
                const p = PLANS[id];
                const featured = id === "completo";
                return (
                  <article
                    key={id}
                    className={cn(
                      "relative rounded-xl border bg-surface p-6",
                      featured ? "border-lime/50 md:-translate-y-2" : "border-border",
                    )}
                  >
                    {featured ? (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-lime px-3 py-1 text-[11px] font-bold text-lime-fg">
                        MAIS POPULAR
                      </span>
                    ) : null}
                    <p className="text-sm text-muted">{p.name}</p>
                    <p className="display mt-2 text-4xl font-semibold">{p.price}</p>
                    <p className="mt-1 text-sm text-subtle">{p.installments}</p>
                    <ul className="mt-6 space-y-2 text-sm">
                      {p.features.map((f) => (
                        <li key={f} className="flex gap-2">
                          <Check className="mt-0.5 size-4 shrink-0 text-lime" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <a
                      href={CHECKOUT[id]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "mt-7 flex h-12 w-full items-center justify-center rounded-md text-sm font-semibold",
                        featured
                          ? "bg-lime text-lime-fg hover:brightness-110"
                          : "border border-border hover:bg-elevated",
                      )}
                    >
                      {featured ? "Quero esse" : "Começar"}
                    </a>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <h2 className="display text-center text-3xl font-semibold">Perguntas frequentes</h2>
            <div className="mt-8 divide-y divide-border rounded-xl border border-border bg-surface">
              {FAQS.map((item, i) => (
                <div key={item.q}>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    aria-expanded={openFaq === i}
                  >
                    <span className="font-medium">{item.q}</span>
                    <ChevronDown
                      className={cn(
                        "size-4 shrink-0 text-muted transition-transform duration-200",
                        openFaq === i && "rotate-180",
                      )}
                    />
                  </button>
                  {openFaq === i ? (
                    <p className="px-5 pb-4 text-sm leading-relaxed text-muted">{item.a}</p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 pb-20 sm:px-6">
          <div className="mx-auto max-w-4xl rounded-xl border border-border bg-elevated px-6 py-12 text-center">
            <GraduationCap className="mx-auto size-8 text-violet" />
            <h2 className="display mt-4 text-3xl font-semibold">
              Experimente 7 dias ou tenha seu dinheiro de volta
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-muted">
              A maior formação prática de cibersegurança para quem quer sair do tutorial e
              atuar de verdade.
            </p>
            <a
              href={CHECKOUT.default}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex h-12 items-center rounded-md bg-lime px-8 text-sm font-bold text-lime-fg hover:brightness-110"
            >
              QUERO ASSINAR AGORA
            </a>
          </div>
        </section>
      </main>

      <footer id="contato" className="border-t border-border py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 sm:flex-row sm:items-center sm:px-6">
          <div className="flex items-center gap-2">
            <span className="display grid size-7 place-items-center rounded-md bg-fg text-sm font-bold text-bg">
              F
            </span>
            <span className="display font-semibold">FORTIFY</span>
          </div>
          <a
            href={WHATSAPP}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-muted hover:text-fg"
          >
            <MessageCircle className="size-4 text-lime" />
            Fale com um especialista
          </a>
          <p className="text-xs text-subtle">© 2026 Fortify. Todos os direitos reservados.</p>
        </div>
      </footer>

    </div>
  );
}

function Stat({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof BookOpen;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-4 rounded-lg px-1 py-3">
      <div className="grid size-11 shrink-0 place-items-center rounded-md border border-border bg-elevated">
        <Icon className="size-5 text-violet" />
      </div>
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-sm text-muted">{text}</p>
      </div>
    </div>
  );
}

function PosterCard({
  src,
  className,
  kicker,
  title,
  prize,
}: {
  src: string;
  className?: string;
  kicker: string;
  title: string;
  prize?: boolean;
}) {
  return (
    <article
      className={cn(
        "absolute h-[360px] w-[230px] overflow-hidden rounded-xl border border-white/10 shadow-2xl sm:h-[420px] sm:w-[250px]",
        className,
      )}
    >
      <img src={src} alt="" className="h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/10" />
      <div className="absolute top-4 left-4 text-[11px] tracking-[0.2em] text-cyan uppercase">
        {kicker}
      </div>
      <div className="absolute right-4 bottom-4 left-4">
        <p className="display text-2xl font-semibold leading-tight">{title}</p>
        {prize ? (
          <p className="mt-2 text-sm text-muted">
            Prêmio de <span className="text-fg">R$ 15.000</span>
          </p>
        ) : null}
      </div>
    </article>
  );
}
