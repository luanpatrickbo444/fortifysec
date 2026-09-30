"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "Preciso de experiência prévia?",
    a: "Não. A trilha começa no absoluto zero: Linux, redes, programação e depois pentest. Quem já atua em TI acelera os módulos iniciais.",
  },
  {
    q: "Por quanto tempo tenho acesso?",
    a: "No plano Básico você tem 12 meses. Nos planos Completo e Premium o acesso é vitalício, incluindo todas as atualizações futuras.",
  },
  {
    q: "As certificações são práticas?",
    a: "Sim. Todas as 4 certificações (FYCP, FYWP, FYAP e FYES) exigem prova prática real: exploração, relatório e entrevista técnica — exatamente como no mercado.",
  },
  {
    q: "Tem garantia?",
    a: "Sim. 7 dias de garantia incondicional. Se não gostar, devolvemos 100% do valor, sem perguntas.",
  },
  {
    q: "Como funciona o CTF?",
    a: "Dois campeonatos por ano com cenários realistas (web, infra, wireless e forense). O primeiro lugar de cada edição leva R$ 15.000 no PIX. Incluso em qualquer plano.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="py-24 relative">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">
            Perguntas frequentes
          </h2>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((f, i) => (
            <div
              key={i}
              className="glass rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left"
              >
                <span className="font-medium text-white text-sm pr-4">
                  {f.q}
                </span>
                <ChevronDown
                  className={cn(
                    "w-5 h-5 text-slate-400 shrink-0 transition-transform",
                    open === i && "rotate-180 text-fortify-neon"
                  )}
                />
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <p className="px-6 pb-5 text-sm text-slate-400 leading-relaxed">
                      {f.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
