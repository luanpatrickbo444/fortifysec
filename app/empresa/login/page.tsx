import Link from 'next/link'
import { Building2, ShieldCheck } from 'lucide-react'
import { companyLoginAction } from '@/app/actions'
import { SubmitButton } from '@/components/ui/SubmitButton'

export default async function CompanyLogin({searchParams}:{searchParams:Promise<{erro?:string,sucesso?:string}>}){
 const q=await searchParams
 return <main className="auth-page"><section className="auth-card"><div className="auth-mark"><Building2 size={26}/></div><div className="kicker">FORTIFYSEC / EMPLOYER</div><h1>Área da empresa</h1><p className="muted">Acesse para publicar vagas e acompanhar candidatos.</p>{q.erro&&<div className="alert danger-alert">{q.erro}</div>}{q.sucesso&&<div className="alert success-alert">{q.sucesso}</div>}<form action={companyLoginAction}><div className="field"><label>E-mail corporativo</label><input type="email" name="email" required autoComplete="email"/></div><div className="field"><label>Senha</label><input type="password" name="password" required autoComplete="current-password"/></div><SubmitButton className="btn full-btn" idleLabel="ENTRAR COMO EMPRESA →" pendingLabel="AUTENTICANDO..."/></form><div className="security-note"><ShieldCheck size={14}/><span>Empresas precisam ser validadas antes de publicar vagas.</span></div><p className="auth-foot">Ainda não cadastrou a empresa? <Link href="/empresa/cadastro">Criar conta empresarial</Link></p></section></main>
}
