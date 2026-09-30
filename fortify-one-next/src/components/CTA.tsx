"use client";

import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck } from "lucide-react";

export default function CTA() {
  return (
    <section className="py-24 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-strong rounded-3xl p-10 sm:p-14 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-fortify-purple/20 via-transparent to-fortify-neon/5 pointer-events-none" />
          <div className="relative z-10">
            <ShieldCheck className="w-12 h-12 text-fortify-neon mx-auto mb-5" />
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mb-3">
              Experimente 7 dias ou tenha seu dinheiro de volta
            </h2>
            <p className="text-slate-400 max-w-lg mx-auto mb-8">
              A maior formação prática de cibersegurança para quem quer sair do
              tutorial e atuar de verdade.
            </p>
            <a
              href="https://mpago.li/2JmjDYP"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-fortify-neon text-fortify-darker font-bold px-8 py-4 rounded-xl hover:bg-fortify-neon-dim transition-all shadow-[0_0_30px_rgba(196,245,66,0.3)] hover:shadow-[0_0_40px_rgba(196,245,66,0.45)] hover:-translate-y-0.5"
            >
              QUERO ASSINAR AGORA
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
