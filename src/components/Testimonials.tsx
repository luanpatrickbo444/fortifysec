"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    text: "Saí do absoluto zero. Em poucos meses já estava automatizando recon e escrevendo relatórios como no mercado.",
    author: "Aluno Fortify",
  },
  {
    text: "A prova prática foi pesada — três dias de exploração e dois de relatório. Exatamente o que o cliente cobra.",
    author: "Aluno Fortify",
  },
  {
    text: "O mix de ataque e defesa mudou meu olhar no SOC. Entendi a cadeia completa, não só o alerta do SIEM.",
    author: "Aluno Fortify",
  },
];

export default function Testimonials() {
  return (
    <section className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">
            Quem estudou, recomenda
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-2xl p-6 hover:border-fortify-purple/30 transition-all"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star
                    key={j}
                    className="w-4 h-4 fill-fortify-neon text-fortify-neon"
                  />
                ))}
              </div>
              <p className="text-sm text-slate-300 leading-relaxed mb-5">
                &ldquo;{t.text}&rdquo;
              </p>
              <p className="text-xs text-slate-500 font-medium">{t.author}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
