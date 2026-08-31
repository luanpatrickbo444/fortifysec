import Link from 'next/link'
import { signupAction } from '@/app/actions'
import { Building2, ShieldCheck, UserPlus } from 'lucide-react'

export default async function Cadastro({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const q = await searchParams
  return <main className="login-page">
    <section className="login-visual"><Link className="brand login-brand" href="/"><span className="brand-bracket">[</span>FORTIFY<span>SEC</span><span className="brand-bracket">]</span><small>CLOUD</small></Link><div><div className="kicker">CUSTOMER ONBOARDING</div><h1>COMECE A<br/><em>PROTEGER.</em></h1><p>Crie sua conta, descreva o ambiente e acompanhe o provisionamento diretamente pelo portal.</p><div className="login-proof"><span><Building2/>Organização corporativa</span><span><ShieldCheck/>Proteção gerenciada</span></div></div></section>
    <section className="login-panel"><form action={signupAction} className="login-card"><div className="login-icon"><UserPlus/></div><span className="section-index">CRIAR CONTA</span><h2>Iniciar onboarding</h2>{q.error && <div className="form-error">Não foi possível criar a conta. Confira os dados; a senha deve ter pelo menos 8 caracteres.</div>}<label>Nome completo<input name="full_name" required placeholder="Seu nome" autoComplete="name"/></label><label>E-mail corporativo<input type="email" name="email" required placeholder="voce@empresa.com.br" autoComplete="email"/></label><label>Senha<input type="password" name="password" minLength={8} required placeholder="mínimo 8 caracteres" autoComplete="new-password"/></label><label>Confirmar senha<input type="password" name="confirm_password" minLength={8} required placeholder="repita a senha" autoComplete="new-password"/></label><button className="btn full" type="submit">CRIAR CONTA →</button><p className="login-help">Já tem acesso? <Link href="/acesso">Entrar no portal</Link> · Prefere falar antes? <Link href="/contato">Solicitar diagnóstico</Link></p></form></section>
  </main>
}
