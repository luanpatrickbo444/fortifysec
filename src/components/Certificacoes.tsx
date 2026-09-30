"use client";

import { motion } from "framer-motion";
import { Shield, Wifi, Smartphone, Eye, CheckCircle2 } from "lucide-react";

const certs = [
  {
    code: "FYCP",
    name: "Fortify Certified Pentester",
    hours: "180h",
    icon: Shield,
    color: "from-violet-600 to-purple-800",
  },
  {
    code: "FYWP",
    name: "Fortify Wireless Pentester",
    hours: "48h",
    icon: Wifi,
    color: "from-blue-600 to-indigo-800",
  },
  {
    code: "FYAP",
    name: "Fortify Android Pentester",
    hours: "64h",
    icon: Smartphone,
    color: "from-emerald-600 to-teal-800",
  },
  {
    code: "FYES",
    name: "Fortify Evasion Specialist",
    hours: "72h",
    icon: Eye,
    color: "from-rose-600 to-pink-800",
  },
];

const steps = [
  "Estude no streaming",
  "Pratique em labs e CTFs",
  "Tire dúvidas com pentesters",
  "Execute um pentest realístico",
  "Entregue um relatório de mercado",
  "Passe pela entrevista técnica",
  "Receba a certificação",
  "Kit físico em casa",
];

export default function Certificacoes() {
  return (
    <section id="certificacoes" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">
            Se torne um profissional certificado
          </h2>
          <p className="text-slate-400 mt-3 max-w-xl mx-auto">
            Comprove ao mercado sua expertise e receba o kit de certificação em
            casa.
          </p>
        </motion.div>

        {/* Cert cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-20">
          {certs.map((c, i) => (
            <motion.div
              key={c.code}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-2xl p-6 hover:border-fortify-purple/40 transition-all group hover:-translate-y-1"
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
              >
                <c.icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-mono text-fortify-purple-light tracking-wider">
                {c.code}
              </span>
              <h3 className="font-display font-semibold text-white mt-1 mb-2 text-sm leading-snug">
                {c.name}
              </h3>
              <p className="text-xs text-slate-500">
                {c.hours} · prova prática
              </p>
            </motion.div>
          ))}
        </div>

        {/* Journey steps */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h3 className="font-display text-xl font-semibold text-white text-center mb-8">
            Sua jornada até a certificação
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto">
            {steps.map((s, i) => (
              <div
                key={i}
                className="glass rounded-xl p-4 text-center hover:border-fortify-neon/30 transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-fortify-purple/20 text-fortify-purple-light font-bold text-sm flex items-center justify-center mx-auto mb-2">
                  {i + 1}
                </div>
                <p className="text-xs text-slate-400 leading-snug">{s}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
