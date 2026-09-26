"use client";

import { GraduationCap, Menu, MessageCircle, X } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { CHECKOUT, WHATSAPP, WHATSAPP_LABEL } from "@/lib/links";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  const links = [
    { href: "#trilhas", label: "Trilhas" },
    { href: "#certificacoes", label: "Certificações" },
    { href: "#ctf", label: "CTF" },
    { href: "#planos", label: "Planos" },
    { href: "#contato", label: "Contato" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="display grid size-8 place-items-center rounded-md bg-fg text-sm font-bold text-bg">
            F
          </span>
          <span className="display font-semibold tracking-tight">FORTIFY</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-muted transition hover:text-fg"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <a
            href={WHATSAPP}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg"
          >
            <MessageCircle className="size-4 text-lime" />
            {WHATSAPP_LABEL}
          </a>
          <a
            href={CHECKOUT.default}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center rounded-md bg-lime px-4 text-sm font-semibold text-lime-fg hover:brightness-110"
          >
            Assinar
          </a>
        </div>

        <button
          type="button"
          className="grid size-10 place-items-center rounded-md border border-border md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-border bg-surface px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm text-muted hover:text-fg"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </a>
            ))}
            <a
              href={CHECKOUT.default}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex h-10 items-center justify-center rounded-md bg-lime text-sm font-semibold text-lime-fg"
            >
              Assinar agora
            </a>
          </nav>
        </div>
      ) : null}
    </header>
  );
}