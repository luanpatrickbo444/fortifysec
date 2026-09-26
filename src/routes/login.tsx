import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CLASSROOM, TEMP_LOGIN } from "@/lib/links";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function login(e: React.FormEvent) {
    e.preventDefault();
    if (email.trim() === TEMP_LOGIN.email && password === TEMP_LOGIN.password) {
      window.location.href = CLASSROOM;
      return;
    }
    setError("Credenciais inválidas");
  }

  return (
    <main className="hero-wash relative flex min-h-screen items-center justify-center px-4">
      <div className="relative w-full max-w-md rounded-xl border border-border bg-surface p-8 shadow-2xl">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2">
          <span className="display grid size-10 place-items-center rounded-md bg-fg text-lg font-bold text-bg">
            F
          </span>
        </Link>
        <div className="mb-8 text-center">
          <h1 className="display one-title text-4xl font-light">Fortify Academy</h1>
          <p className="mt-3 text-sm text-muted">
            Acesse seus cursos, labs e certificações.
          </p>
        </div>

        <form onSubmit={login} className="space-y-4">
          <label className="block text-sm">
            <span className="mb-1 block text-muted">E-mail</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 w-full rounded-md border border-border bg-elevated px-4 text-fg outline-none focus:border-violet"
              placeholder="E-mail"
              autoComplete="username"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-muted">Senha</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 w-full rounded-md border border-border bg-elevated px-4 text-fg outline-none focus:border-violet"
              placeholder="Senha"
              autoComplete="current-password"
            />
          </label>
          {error ? (
            <p className="rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            className="h-12 w-full rounded-md bg-lime font-semibold text-lime-fg hover:brightness-110"
          >
            Entrar na plataforma
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-subtle">
          Acesso temporário para alunos. Depois você entra no Classroom.
        </p>
      </div>
    </main>
  );
}
