import { GraduationCap, Menu, MessageCircle, X } from "lucide-react";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { CHECKOUT, WHATSAPP, WHATSAPP_LABEL } from "@/lib/links";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="display grid size-8 place-items-center rounded-md bg-fg text-lg font-bold text-bg">
            F
          </span>
          <span className="display text-lg font-semibold tracking-wide">
            FORTIFY
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm text-muted md:flex">
          <a href="#trilhas" className="hover:text-fg">
            Trilhas
          </a>
          <a href="#certificacoes" className="hover:text-fg">
            Certificações
          </a>
          <a href="#ctf" className="hover:text-fg">
            CTF
          </a>
          <a href="#planos" className="hover:text-fg">
            Planos
          </a>
        </nav>

        <div className="hidden items-center gap-2 sm:flex">
          <a
            href={WHATSAPP}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center gap-2 rounded-md border border-border px-3 text-sm text-fg hover:bg-elevated"
          >
            <MessageCircle className="size-4 text-lime" />
            <span className="hidden lg:inline">{WHATSAPP_LABEL}</span>
          </a>
          <Link
            to="/login"
            className="inline-flex h-10 items-center gap-2 rounded-md border border-border px-3 text-sm text-fg hover:bg-elevated"
          >
            <GraduationCap className="size-4" />
            Já sou aluno
          </Link>
          <a
            href={CHECKOUT.default}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden h-10 items-center rounded-md bg-lime px-4 text-sm font-semibold text-lime-fg hover:brightness-110 lg:inline-flex"
          >
            Quero assinar
          </a>
        </div>

        <button
          type="button"
          className="rounded-md p-2 text-fg md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Abrir menu"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-border px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3 text-sm">
            <a href="#trilhas" onClick={() => setOpen(false)}>
              Trilhas
            </a>
            <a href="#certificacoes" onClick={() => setOpen(false)}>
              Certificações
            </a>
            <a href="#ctf" onClick={() => setOpen(false)}>
              CTF
            </a>
            <a href="#planos" onClick={() => setOpen(false)}>
              Planos
            </a>
            <Link to="/login" onClick={() => setOpen(false)}>
              Já sou aluno
            </Link>
            <a
              href={WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-lime"
              onClick={() => setOpen(false)}
            >
              <MessageCircle className="size-4" /> {WHATSAPP_LABEL}
            </a>
            <a
              href={CHECKOUT.default}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center justify-center rounded-md bg-lime font-semibold text-lime-fg"
            >
              Quero assinar agora
            </a>
          </div>
        </div>
      ) : null}
    </header>
  );
}
