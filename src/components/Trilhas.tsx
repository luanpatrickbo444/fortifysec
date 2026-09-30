"use client";

import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";

const modules = [
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

export default function Trilhas() {
  return (
    <section id="trilhas" className="py-24 relative">
      <div className="absolute inset-0 bg-grid opacity-40 pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="text-xs tracking-[0.25em] text-fortify-purple-light font-medium uppercase">
            Confira as trilhas
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mt-3">
            Não importa o seu nível.
            <br />
            <span className="text-slate-400">Vá do zero ao profissional.</span>
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-3 max-w-4xl mx-auto">
          {modules.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className="glass rounded-xl px-5 py-4 flex items-center gap-3 hover:border-fortify-purple/40 hover:bg-fortify-purple/5 transition-all group cursor-default"
            >
              <div className="w-2 h-2 rounded-full bg-fortify-purple group-hover:bg-fortify-neon transition-colors shrink-0" />
              <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
                {m}
              </span>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-10">
          <div className="inline-flex items-center gap-2 text-sm text-slate-500">
            <BookOpen className="w-4 h-4" />
            12 módulos · +360 horas · atualizações contínuas
          </div>
        </div>
      </div>
    </section>
  );
}
