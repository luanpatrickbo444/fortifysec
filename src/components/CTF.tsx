"use client";

import { motion } from "framer-motion";
import { Trophy, Flag, Users, Gift } from "lucide-react";

function ChampionShadow() {
  return (
    <div className="absolute inset-0 flex items-end justify-center pointer-events-none overflow-hidden rounded-3xl">
      <div className="absolute inset-0 bg-gradient-to-t from-fortify-dark via-fortify-purple/25 to-transparent" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-72 h-56 bg-fortify-purple/30 blur-3xl" />
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-40 h-40 bg-fortify-neon/15 blur-2xl" />

      <svg
        viewBox="0 0 180 260"
        className="absolute bottom-0 w-[70%] max-w-[220px]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="champSil" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a1535" stopOpacity="0.95" />
            <stop offset="55%" stopColor="#0d0d18" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#0a0a12" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        <ellipse cx="90" cy="48" rx="36" ry="42" fill="#0d0d18" stroke="#7c3aed" strokeWidth="1.5" strokeOpacity="0.5" />
        <path
          d="M54 55 Q90 10 126 55 L126 85 Q90 100 54 85 Z"
          fill="#12121f"
          stroke="#7c3aed"
          strokeWidth="1"
          strokeOpacity="0.4"
        />
        <ellipse cx="78" cy="50" rx="5" ry="3" fill="#c4f542" opacity="0.35">
          <animate attributeName="opacity" values="0.2;0.5;0.2" dur="4s" repeatCount="indefinite" />
        </ellipse>
        <ellipse cx="102" cy="50" rx="5" ry="3" fill="#c4f542" opacity="0.35">
          <animate attributeName="opacity" values="0.2;0.5;0.2" dur="4s" repeatCount="indefinite" />
        </ellipse>
        <path
          d="M35 95 Q90 75 145 95 L160 250 Q90 280 20 250 Z"
          fill="url(#champSil)"
          stroke="#7c3aed"
          strokeWidth="1"
          strokeOpacity="0.3"
        />
        <ellipse cx="90" cy="100" rx="58" ry="18" fill="#0a0a14" opacity="0.9" />
      </svg>

      <div className="absolute top-[18%] left-1/2 -translate-x-1/2 font-display text-6xl font-bold text-fortify-purple/40 select-none drop-shadow-[0_0_20px_rgba(124,58,237,0.5)]">
        ?
      </div>
    </div>
  );
}

export default function CTF() {
  return (
    <section id="ctf" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-fortify-purple/5 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-xs tracking-[0.25em] text-fortify-neon font-medium uppercase">
              Capture the Flag
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mt-3 mb-4">
              Venha ser o novo campeão
            </h2>
            <p className="text-slate-400 leading-relaxed mb-8 max-w-md">
              Dois campeonatos por ano, cenários realistas e{" "}
              <strong className="text-fortify-neon">R$ 15.000 em PIX</strong>{" "}
              para o primeiro lugar de cada edição. Treine como no mercado.
            </p>

            <ul className="space-y-3">
              {[
                "Web, infra, wireless e forense no mesmo evento",
                "Hall da fama com os campeões de cada edição",
                "Incluso em qualquer plano Fortify One",
              ].map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-sm text-slate-300"
                >
                  <Flag className="w-4 h-4 text-fortify-neon mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex justify-center"
          >
            <div className="relative w-full max-w-sm">
              <div className="absolute -inset-4 bg-fortify-neon/10 rounded-3xl blur-2xl" />

              <div className="relative glass-strong rounded-3xl overflow-hidden purple-glow min-h-[380px]">
                <ChampionShadow />

                <div className="relative z-10 p-10 text-center flex flex-col items-center justify-end min-h-[380px] pb-10">
                  <div className="bg-fortify-darker/70 backdrop-blur-sm rounded-2xl px-8 py-6 border border-fortify-border/60">
                    <Trophy className="w-11 h-11 text-fortify-neon mx-auto mb-3 drop-shadow-[0_0_20px_rgba(196,245,66,0.5)]" />
                    <p className="text-sm text-slate-400 mb-1">Prêmio</p>
                    <p className="font-display text-5xl font-bold text-white neon-text mb-1">
                      R$ 15.000
                    </p>
                    <p className="text-sm text-fortify-neon font-medium mb-4">
                      no PIX para o primeiro lugar
                    </p>
                    <div className="flex justify-center gap-6 text-xs text-slate-500 mb-3">
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" /> 2x por ano
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Gift className="w-3.5 h-3.5" /> R$ 30k anual
                      </span>
                    </div>
                    <p className="text-[11px] tracking-[0.2em] text-fortify-purple-light uppercase">
                      Quem será o próximo?
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
