"use client";

import { motion } from "framer-motion";
import { Check, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Básico",
    price: "1.997",
    installments: "12x de R$ 197",
    href: "https://mpago.la/2qB2gTv",
    features: [
      "Acesso à grade completa",
      "Labs práticos",
      "Certificado de conclusão",
      "Acesso por 12 meses",
    ],
    popular: false,
  },
  {
    name: "Completo",
    price: "2.997",
    installments: "12x de R$ 297",
    href: "https://mpago.la/1voYnoa",
    features: [
      "Tudo do Básico",
      "Acesso vitalício",
      "Comunidade exclusiva",
      "Atualizações futuras",
      "Mentoria em grupo",
    ],
    popular: true,
  },
  {
    name: "Premium",
    price: "3.997",
    installments: "12x de R$ 397",
    href: "https://mpago.li/2JmjDYP",
    features: [
      "Tudo do Completo",
      "Mentoria 1:1 (4 sessões)",
      "Revisão de projetos",
      "Kit certificado físico",
      "Banco de talentos",
    ],
    popular: false,
  },
];

export default function Pricing() {
  return (
    <section id="planos" className="py-24 relative">
      <div className="absolute inset-0 bg-glow-purple opacity-50 pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">
            Escolha o seu acesso
          </h2>
          <p className="text-slate-400 mt-3">
            Tudo numa única assinatura. Cancele a garantia em 7 dias.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto items-start">
          {plans.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                "relative rounded-2xl p-7 transition-all",
                p.popular
                  ? "glass-strong border-fortify-neon/40 shadow-[0_0_40px_rgba(196,245,66,0.12)] scale-[1.02]"
                  : "glass hover:border-fortify-purple/40"
              )}
            >
              {p.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 bg-fortify-neon text-fortify-darker text-xs font-bold px-3 py-1 rounded-full">
                    <Zap className="w-3 h-3" /> MAIS POPULAR
                  </span>
                </div>
              )}

              <h3 className="font-display font-semibold text-lg text-white mb-1">
                {p.name}
              </h3>
              <div className="mb-1">
                <span className="text-sm text-slate-500">R$</span>
                <span className="font-display text-4xl font-bold text-white ml-1">
                  {p.price}
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-6">ou {p.installments}</p>

              <ul className="space-y-3 mb-8">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-slate-300">
                    <Check className="w-4 h-4 text-fortify-neon mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <a
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "block text-center font-semibold py-3 rounded-xl transition-all",
                  p.popular
                    ? "bg-fortify-neon text-fortify-darker hover:bg-fortify-neon-dim shadow-[0_0_20px_rgba(196,245,66,0.25)]"
                    : "border border-fortify-border text-white hover:border-fortify-purple/50 hover:bg-fortify-purple/10"
                )}
              >
                {p.popular ? "Quero esse" : "Começar"}
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
