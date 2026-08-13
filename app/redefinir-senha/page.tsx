"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { browserSupabase } from "@/lib/supabase";

export default function ResetPage() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password"));
    const confirmation = String(form.get("confirmation"));
    if (password !== confirmation) { setMessage("As senhas não coincidem."); setLoading(false); return; }
    try {
      const { error } = await browserSupabase().auth.updateUser({ password });
      if (error) throw error;
      router.push("/area");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível alterar a senha.");
    } finally {
      setLoading(false);
    }
  }

  return <main className="portal-root auth-layout">
    <section className="auth-panel">
      <Link className="portal-logo" href="/"><span className="portal-logo-mark">F/</span> FORTIFYSEC</Link>
      <div className="auth-panel-main">
        <span className="portal-label">{"// RECUPERAÇÃO DE ACESSO"}</span>
        <h1 className="auth-title">NOVA<br />SENHA.</h1>
        <p className="auth-description">Cadastre uma nova senha segura para continuar sua formação.</p>
        <form className="auth-form" onSubmit={submit}>
          <label className="portal-field"><span>NOVA SENHA</span><input name="password" type="password" minLength={8} required autoComplete="new-password" placeholder="Mínimo de 8 caracteres" /></label>
          <label className="portal-field"><span>CONFIRME A NOVA SENHA</span><input name="confirmation" type="password" minLength={8} required autoComplete="new-password" placeholder="Digite a senha novamente" /></label>
          <button className="portal-button" disabled={loading}>{loading ? "SALVANDO..." : "SALVAR E ENTRAR →"}</button>
        </form>
        {message && <p className="portal-alert error">{message}</p>}
        <div className="auth-back"><Link className="portal-text-button" href="/login">← VOLTAR PARA O LOGIN</Link></div>
      </div>
    </section>
    <aside className="auth-visual" aria-hidden="true"><div className="auth-radar"><div className="auth-shield">F/</div></div></aside>
  </main>;
}
