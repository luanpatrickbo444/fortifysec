"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Trophy,
  Shield,
  FlaskConical,
  Award,
  Users,
  Laptop,
} from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "12 módulos do zero ao avançado",
    desc: "Mais de 360 horas de conteúdo estruturado",
  },
  {
    icon: FlaskConical,
    title: "Labs que simulam situações reais",
    desc: "Alvos controlados para pentest e forense",
  },
  {
    icon: Award,
    title: "4 certificações práticas",
    desc: "Pentest, wireless, mobile e evasão",
  },
  {
    icon: Trophy,
    title: "2 CTFs por ano e prêmios",
    desc: "R$ 30 mil em premiação anual",
  },
  {
    icon: Users,
    title: "Comunidade e suporte",
    desc: "Grupo de networking e dúvidas com pentesters",
  },
  {
    icon: Laptop,
    title: "Assista offline pelo app",
    desc: "Estude no ritmo da sua rotina",
  },
];

function HackerSilhouette() {
  return (
    <div className="relative w-full h-full flex items-end justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-fortify-dark via-fortify-purple/30 to-indigo-950/80" />
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(196,245,66,0.15) 1px, transparent 1px)",
          backgroundSize: "14px 14px",
        }}
      />
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full bg-fortify-purple/50 blur-3xl" />
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-28 h-28 rounded-full bg-fortify-neon/25 blur-2xl" />

      <svg
        viewBox="0 0 200 300"
        className="relative z-10 w-[85%] max-w-[240px] h-auto"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1e1b4b" />
            <stop offset="100%" stopColor="#0a0a12" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d="M45 85 Q100 15 155 85 L155 120 Q100 145 45 120 Z"
          fill="#0f0f1a"
          stroke="#7c3aed"
          strokeWidth="1.5"
          opacity="0.95"
        />
        <ellipse cx="100" cy="95" rx="32" ry="38" fill="#050508" />
        <g filter="url(#glow)">
          <ellipse cx="86" cy="92" rx="7" ry="4" fill="#c4f542">
            <animate attributeName="opacity" values="0.6;1;0.6" dur="2.5s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="114" cy="92" rx="7" ry="4" fill="#c4f542">
            <animate attributeName="opacity" values="0.6;1;0.6" dur="2.5s" repeatCount="indefinite" />
          </ellipse>
        </g>
        <path d="M90 110 Q100 115 110 110" stroke="#333" strokeWidth="1.5" fill="none" />
        <path
          d="M40 125 Q100 145 160 125 L175 280 Q100 310 25 280 Z"
          fill="url(#bodyGrad)"
          stroke="#7c3aed"
          strokeWidth="1"
          strokeOpacity="0.4"
        />
        <path
          d="M75 145 Q100 165 125 145 L130 240 Q100 255 70 240 Z"
          fill="#12122a"
          opacity="0.8"
        />
        <ellipse cx="100" cy="130" rx="62" ry="16" fill="#0a0a14" />
      </svg>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-fortify-neon/10 to-transparent opacity-50 pointer-events-none" />
    </div>
  );
}

export default function Hero() {
  return (
    <section className="relative min-h-screen pt-28 pb-16 overflow-hidden">
      <div className="absolute inset-0 bg-glow-purple pointer-events-none" />
      <div className="absolute inset-0 bg-glow-neon pointer-events-none" />
      <div className="absolute inset-0 bg-grid pointer-events-none opacity-60" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-block font-display text-sm tracking-[0.2em] text-fortify-purple-light mb-4">
                FORTIFY ONE
              </span>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] text-white mb-6">
                Hacking e Cibersegurança
                <br />
                <span className="bg-gradient-to-r from-fortify-purple-light to-fortify-neon bg-clip-text text-transparent">
                  do Zero ao Avançado.
                </span>
              </h1>
              <p className="text-lg text-slate-400 max-w-lg mb-8 leading-relaxed">
                Novidades o ano todo. Tudo numa única formação — labs, CTFs,
                certificações práticas e comunidade.
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href="https://mpago.li/2JmjDYP"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-fortify-neon text-fortify-darker font-bold px-7 py-3.5 rounded-xl hover:bg-fortify-neon-dim transition-all shadow-[0_0_30px_rgba(196,245,66,0.3)] hover:shadow-[0_0_40px_rgba(196,245,66,0.45)] hover:-translate-y-0.5"
                >
                  QUERO ASSINAR AGORA
                  <ArrowRight className="w-5 h-5" />
                </a>
                <a
                  href="#trilhas"
                  className="inline-flex items-center gap-2 border border-fortify-border text-slate-300 font-medium px-6 py-3.5 rounded-xl hover:border-fortify-purple/50 hover:text-white transition-all"
                >
                  Confira as trilhas
                </a>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative flex justify-center lg:justify-end"
          >
            <div className="relative w-[280px] sm:w-[340px]">
              <div className="absolute -right-4 top-6 w-full h-[420px] rounded-2xl bg-fortify-card border border-fortify-border/50 rotate-6 opacity-40" />
              <div className="absolute -right-2 top-3 w-full h-[420px] rounded-2xl bg-fortify-card border border-fortify-border/60 rotate-3 opacity-60" />

              <div className="relative glass-strong rounded-2xl overflow-hidden purple-glow animate-float">
                <div className="absolute top-4 left-4 z-20">
                  <span className="text-[10px] tracking-widest text-fortify-purple-light font-medium bg-fortify-purple/30 px-2.5 py-1 rounded-full border border-fortify-purple/40">
                    10ª EDIÇÃO
                  </span>
                </div>
                <div className="h-[300px] relative">
                  <HackerSilhouette />
                </div>
                <div className="p-6 relative z-10 bg-fortify-darker/80 border-t border-fortify-border/50">
                  <h3 className="font-display font-bold text-xl text-white mb-1">
                    CAPTURE THE FLAG
                  </h3>
                  <p className="text-fortify-neon font-semibold text-sm">
                    Prêmio de R$ 15.000
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-20 grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {features.map((f, i) => (
            <div
              key={i}
              className="glass rounded-xl p-5 flex gap-4 hover:border-fortify-purple/40 transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-fortify-purple/15 flex items-center justify-center shrink-0 group-hover:bg-fortify-purple/25 transition-colors">
                <f.icon className="w-5 h-5 text-fortify-purple-light" />
              </div>
              <div>
                <h3 className="font-medium text-white text-sm mb-0.5">
                  {f.title}
                </h3>
                <p className="text-xs text-slate-500">{f.desc}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
