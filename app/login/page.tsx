"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { browserSupabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setIsError(false);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");
    const fullName = String(form.get("fullName") || "").trim();

    try {
      const supabase = browserSupabase();
      const result = mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { full_name: fullName },
              emailRedirectTo: `${location.origin}/login`,
            },
          });

      if (result.error) throw result.error;
      if (mode === "register" && !result.data.session) {
        setMessage("Conta criada. Confirme o link enviado ao seu e-mail.");
      } else {
        router.push("/area");
        router.refresh();
      }
    } catch (error) {
      setIsError(true);
      setMessage(error instanceof Error ? error.message : "Não foi possível entrar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="portal-root auth-layout">
      <section className="auth-panel">
        <Link className="portal-logo" href="/">
          <span className="portal-logo-mark">F/</span> FORTIFYSEC
        </Link>

        <div className="auth-panel-main">
          <span className="portal-label">{"// ÁREA RESTRITA"}</span>
          <h1 className="auth-title">
            {mode === "login" ? <>BEM-VINDO<br />DE VOLTA.</> : <>INICIE SUA<br />MISSÃO.</>}
          </h1>
          <p className="auth-description">
            {mode === "login"
              ? "Entre para continuar suas aulas, acompanhar o progresso e acessar os laboratórios."
              : "Crie sua conta com o mesmo e-mail que será usado no pagamento."}
          </p>

          <div className="auth-tabs" role="tablist" aria-label="Acesso à conta">
            <button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")} type="button">ENTRAR</button>
            <button className={mode === "register" ? "active" : ""} onClick={() => setMode("register")} type="button">CRIAR CONTA</button>
          </div>

          <form className="auth-form" onSubmit={submit}>
            {mode === "register" && (
              <label className="portal-field">
                <span>NOME COMPLETO</span>
                <input name="fullName" required autoComplete="name" placeholder="Como devemos chamar você?" />
              </label>
            )}
            <label className="portal-field">
              <span>E-MAIL</span>
              <input name="email" type="email" required autoComplete="email" placeholder="voce@email.com" />
            </label>
            <label className="portal-field">
              <span>SENHA</span>
              <input name="password" type="password" minLength={8} required autoComplete={mode === "login" ? "current-password" : "new-password"} placeholder="Mínimo de 8 caracteres" />
            </label>

            <div className="auth-form-footer">
              {mode === "login" ? <Link className="portal-text-button" href="/recuperar-senha">Esqueci minha senha</Link> : <span />}
              <button className="portal-button" disabled={loading} type="submit">
                {loading ? "PROCESSANDO..." : mode === "login" ? "ENTRAR NA PLATAFORMA →" : "CRIAR MINHA CONTA →"}
              </button>
            </div>
          </form>

          {message && <p className={`portal-alert ${isError ? "error" : ""}`} role="status">{message}</p>}
        </div>

        <p className="auth-footnote">CONEXÃO CRIPTOGRAFADA · AMBIENTE PROTEGIDO<br />FORTIFYSEC © 2026</p>
      </section>

      <aside className="auth-visual" aria-hidden="true">
        <div className="auth-radar"><div className="auth-shield">F/</div></div>
        <div className="auth-status"><b>● SISTEMA ONLINE</b><br />AUTHENTICATION GATEWAY<br />TLS 1.3 · AES-256</div>
      </aside>
    </main>
  );
}
