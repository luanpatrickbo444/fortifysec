"use client";

import { motion } from "framer-motion";
import { ArrowRight, Trophy, Shield, FlaskConical, Award, Users, Laptop } from "lucide-react";

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

export default function Hero() {
  return (
    <section className="relative min-h-screen pt-28 pb-16 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-glow-purple pointer-events-none" />
      <div className="absolute inset-0 bg-glow-neon pointer-events-none" />
      <div className="absolute inset-0 bg-grid pointer-events-none opacity-60" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left content */}
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

          {/* Right - CTF Card stack */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative flex justify-center lg:justify-end"
          >
            <div className="relative w-[280px] sm:w-[320px]">
              {/* Back cards */}
              <div className="absolute -right-4 top-6 w-full h-[380px] rounded-2xl bg-fortify-card border border-fortify-border/50 rotate-6 opacity-40" />
              <div className="absolute -right-2 top-3 w-full h-[380px] rounded-2xl bg-fortify-card border border-fortify-border/60 rotate-3 opacity-60" />

              {/* Main card */}
              <div className="relative glass-strong rounded-2xl overflow-hidden purple-glow animate-float">
                <div className="absolute top-4 left-4 z-10">
                  <span className="text-[10px] tracking-widest text-fortify-purple-light font-medium bg-fortify-purple/20 px-2.5 py-1 rounded-full">
                    10ª EDIÇÃO
                  </span>
                </div>
                <div className="h-[280px] bg-gradient-to-br from-fortify-purple/30 via-fortify-dark to-fortify-darker flex items-center justify-center relative">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(124,58,237,0.3),transparent_60%)]" />
                  <div className="relative text-center">
                    <Trophy className="w-16 h-16 text-fortify-neon mx-auto mb-3 drop-shadow-[0_0_15px_rgba(196,245,66,0.5)]" />
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-fortify-purple to-indigo-900 mx-auto flex items-center justify-center border-2 border-fortify-purple-light/30">
                      <span className="text-3xl">🛡️</span>
                    </div>
                  </div>
                </div>
                <div className="p-6">
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

        {/* Feature grid */}
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
