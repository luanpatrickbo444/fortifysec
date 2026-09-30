"use client";

import { motion } from "framer-motion";
import { Trophy, Flag, Users, Gift } from "lucide-react";

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
                <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
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
            <div className="relative">
              <div className="absolute -inset-4 bg-fortify-neon/10 rounded-3xl blur-2xl" />
              <div className="relative glass-strong rounded-3xl p-10 text-center purple-glow">
                <Trophy className="w-14 h-14 text-fortify-neon mx-auto mb-4 drop-shadow-[0_0_20px_rgba(196,245,66,0.5)]" />
                <p className="text-sm text-slate-400 mb-1">Prêmio</p>
                <p className="font-display text-5xl font-bold text-white neon-text mb-1">
                  R$ 15.000
                </p>
                <p className="text-sm text-fortify-neon font-medium">
                  no PIX para o primeiro lugar
                </p>
                <div className="mt-6 flex justify-center gap-6 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" /> 2x por ano
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Gift className="w-3.5 h-3.5" /> R$ 30k anual
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
