"use client";

import { motion } from "framer-motion";
import { Trophy, Flag, Users, Gift } from "lucide-react";

function ChampionShadow() {
  return (
    <div className="absolute inset-0 flex items-end justify-center pointer-events-none overflow-hidden rounded-3xl">
      {/* Soft purple mist */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-48 bg-fortify-purple/20 blur-3xl" />
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-32 h-32 bg-fortify-neon/10 blur-2xl" />

      {/* Tall mysterious silhouette */}
      <svg
        viewBox="0 0 160 220"
        className="absolute bottom-0 w-[55%] max-w-[180px] opacity-40"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="silGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a1a2e" stopOpacity="0.9" />
            <stop offset="70%" stopColor="#0a0a12" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#0a0a12" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Head */}
        <ellipse cx="80" cy="40" rx="28" ry="32" fill="url(#silGrad)" />
        {/* Neck */}
        <rect x="70" y="68" width="20" height="18" fill="#0d0d18" />
        {/* Shoulders + torso */}
        <path
          d="M30 90 Q80 75 130 90 L145 200 Q80 230 15 200 Z"
          fill="url(#silGrad)"
        />
        {/* Hood outline glow */}
        <ellipse
          cx="80"
          cy="38"
          rx="30"
          ry="34"
          fill="none"
          stroke="#7c3aed"
          strokeWidth="1"
          opacity="0.35"
        />
      </svg>

      {/* Question mark hint — suspense */}
      <div className="absolute top-[28%] left-1/2 -translate-x-1/2 text-fortify-purple/50 font-display text-4xl font-bold select-none">
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

              <div className="relative glass-strong rounded-3xl overflow-hidden purple-glow min-h-[340px]">
                {/* Silhouette background — suspense */}
                <ChampionShadow />

                {/* Prize content on top */}
                <div className="relative z-10 p-10 text-center flex flex-col items-center justify-center min-h-[340px]">
                  <Trophy className="w-12 h-12 text-fortify-neon mb-3 drop-shadow-[0_0_20px_rgba(196,245,66,0.5)]" />
                  <p className="text-sm text-slate-400 mb-1">Prêmio</p>
                  <p className="font-display text-5xl font-bold text-white neon-text mb-1">
                    R$ 15.000
                  </p>
                  <p className="text-sm text-fortify-neon font-medium mb-6">
                    no PIX para o primeiro lugar
                  </p>
                  <div className="flex justify-center gap-6 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" /> 2x por ano
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Gift className="w-3.5 h-3.5" /> R$ 30k anual
                    </span>
                  </div>
                  <p className="mt-6 text-[11px] tracking-widest text-fortify-purple-light/70 uppercase">
                    Quem será o próximo?
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
