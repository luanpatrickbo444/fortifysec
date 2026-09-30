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
      {/* Matrix-ish dots */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(124,58,237,0.5) 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
      />
      {/* Glow behind figure */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full bg-fortify-purple/40 blur-3xl" />
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full bg-fortify-neon/20 blur-2xl" />

      {/* Person silhouette (hooded) */}
      <svg
        viewBox="0 0 200 280"
        className="relative z-10 w-[70%] max-w-[200px] h-auto drop-shadow-[0_0_30px_rgba(124,58,237,0.5)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Hood / head */}
        <ellipse cx="100" cy="72" rx="42" ry="48" fill="#0d0d18" />
        <path
          d="M58 70 Q100 20 142 70 L142 95 Q100 110 58 95 Z"
          fill="#12121f"
        />
        {/* Face shadow */}
        <ellipse cx="100" cy="78" rx="28" ry="32" fill="#080810" />
        {/* Eyes glow */}
        <ellipse cx="88" cy="76" rx="5" ry="3" fill="#c4f542" opacity="0.9">
          <animate
            attributeName="opacity"
            values="0.5;1;0.5"
            dur="3s"
            repeatCount="indefinite"
          />
        </ellipse>
        <ellipse cx="112" cy="76" rx="5" ry="3" fill="#c4f542" opacity="0.9">
          <animate
            attributeName="opacity"
            values="0.5;1;0.5"
            dur="3s"
            repeatCount="indefinite"
          />
        </ellipse>
        {/* Body / hoodie */}
        <path
          d="M55 100 Q100 115 145 100 L160 220 Q100 250 40 220 Z"
          fill="#0d0d18"
        />
        <path
          d="M70 110 Q100 125 130 110 L140 200 Q100 220 60 200 Z"
          fill="#16162a"
        />
        {/* Shoulders */}
        <ellipse cx="100" cy="115" rx="55" ry="18" fill="#0a0a14" />
      </svg>

      {/* Scan line effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-fortify-neon/5 to-transparent animate-pulse pointer-events-none" />
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

          {/* CTF card stack with silhouette */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative flex justify-center lg:justify-end"
          >
            <div className="relative w-[280px] sm:w-[320px]">
              <div className="absolute -right-4 top-6 w-full h-[400px] rounded-2xl bg-fortify-card border border-fortify-border/50 rotate-6 opacity-40" />
              <div className="absolute -right-2 top-3 w-full h-[400px] rounded-2xl bg-fortify-card border border-fortify-border/60 rotate-3 opacity-60" />

              <div className="relative glass-strong rounded-2xl overflow-hidden purple-glow animate-float">
                <div className="absolute top-4 left-4 z-20">
                  <span className="text-[10px] tracking-widest text-fortify-purple-light font-medium bg-fortify-purple/20 px-2.5 py-1 rounded-full">
                    10ª EDIÇÃO
                  </span>
                </div>
                <div className="h-[280px] bg-gradient-to-b from-fortify-purple/20 via-fortify-dark to-fortify-darker relative">
                  <HackerSilhouette />
                </div>
                <div className="p-6 relative z-10">
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
