"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Phone, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "#trilhas", label: "Trilhas" },
  { href: "#certificacoes", label: "Certificações" },
  { href: "#ctf", label: "CTF" },
  { href: "#planos", label: "Planos" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-fortify-darker/90 backdrop-blur-xl border-b border-fortify-border/50 py-3"
          : "bg-transparent py-5"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-lg bg-fortify-purple flex items-center justify-center font-bold text-white text-lg group-hover:scale-105 transition-transform">
            F
          </div>
          <span className="font-display font-bold text-lg tracking-tight text-white">
            FORTIFY
          </span>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="https://wa.me/5565999221436"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-fortify-neon transition-colors"
          >
            <Phone className="w-4 h-4" />
            (65) 99922-1436
          </a>
          <a
            href="#planos"
            className="flex items-center gap-2 text-sm text-slate-300 border border-fortify-border rounded-lg px-4 py-2 hover:border-fortify-purple/50 transition-colors"
          >
            <GraduationCap className="w-4 h-4" />
            Já sou aluno
          </a>
          <a
            href="https://mpago.li/2JmjDYP"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-fortify-neon text-fortify-darker font-semibold text-sm px-5 py-2.5 rounded-lg hover:bg-fortify-neon-dim transition-colors shadow-[0_0_20px_rgba(196,245,66,0.25)]"
          >
            Quero assinar
          </a>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-white p-2"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-strong border-t border-fortify-border"
          >
            <div className="px-4 py-6 flex flex-col gap-4">
              {navLinks.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="text-slate-300 hover:text-white py-2"
                >
                  {l.label}
                </a>
              ))}
              <a
                href="https://mpago.li/2JmjDYP"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-fortify-neon text-fortify-darker font-semibold text-center py-3 rounded-lg mt-2"
              >
                Quero assinar
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
