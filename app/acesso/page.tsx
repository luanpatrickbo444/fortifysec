import Link from 'next/link'
import { loginAction } from '@/app/actions'
import { BarChart3, KeyRound, LockKeyhole, ShieldCheck } from 'lucide-react'

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string; created?: string }> }) {
  const q = await searchParams
  return <main className="login-page enterprise-login-page">
    <section className="login-visual enterprise-login-visual">
      <Link className="public-brand" href="/"><span className="public-brand-mark">F</span><span className="public-brand-copy"><b>Fortify Cloud</b><small>Managed Data Protection</small></span></Link>
      <div className="enterprise-login-copy">
        <div className="corp-eyebrow">CLIENT PROTECTION PORTAL</div>
        <h1>Visibilidade clara sobre a proteção dos seus <em>dados críticos.</em></h1>
        <p>Acompanhe ativos, backups, incidentes, testes de recuperação, relatórios e suporte em um ambiente corporativo único.</p>
        <div className="login-proof enterprise-login-proof"><span><ShieldCheck/>Postura de proteção</span><span><BarChart3/>Indicadores operacionais</span><span><LockKeyhole/>Acesso controlado</span></div>
      </div>
      <div className="enterprise-login-foot"><span>FORTIFY CLOUD</span><strong>BUSINESS CONTINUITY PLATFORM</strong></div>
    </section>
    <section className="login-panel enterprise-login-panel">
      <form action={loginAction} className="login-card enterprise-login-card">
        <div className="login-icon"><KeyRound/></div>
        <span className="section-index">ACESSO SEGURO</span>
        <h2>Entrar no portal</h2>
        <p className="login-card-copy">Use suas credenciais corporativas para acessar o ambiente Fortify Cloud.</p>
        {q.created && <div className="form-success">Conta criada. Se a confirmação de e-mail estiver ativa no Supabase, confirme seu endereço antes de entrar.</div>}
        {q.error && <div className="form-error">E-mail ou senha inválidos.</div>}
        <label>E-mail corporativo<input type="email" name="email" required placeholder="voce@empresa.com.br" autoComplete="email"/></label>
        <label>Senha<input type="password" name="password" required placeholder="••••••••" autoComplete="current-password"/></label>
        <button className="btn full" type="submit">ENTRAR NO PORTAL</button>
        <p className="login-help"><Link href="/cadastro">Criar conta</Link><span>·</span><Link href="/recuperar-senha">Recuperar senha</Link><span>·</span><Link href="/contato">Suporte</Link></p>
      </form>
    </section>
  </main>
}
