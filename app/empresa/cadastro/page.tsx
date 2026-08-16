import Link from 'next/link'
import { Building2 } from 'lucide-react'
import { companyRegisterAction } from '@/app/actions'
import { SubmitButton } from '@/components/ui/SubmitButton'

export default async function CompanyRegister({searchParams}:{searchParams:Promise<{erro?:string}>}){
 const q=await searchParams
 return <main className="auth-page"><section className="auth-card"><div className="auth-mark"><Building2 size={26}/></div><div className="kicker">EMPLOYER NETWORK</div><h1>Cadastrar empresa</h1><p className="muted">Crie o acesso do recrutador. A FortifySec valida a empresa antes da primeira publicação.</p>{q.erro&&<div className="alert danger-alert">{q.erro}</div>}<form action={companyRegisterAction}><div className="field"><label>Seu nome</label><input name="name" required/></div><div className="field"><label>Empresa</label><input name="company_name" required/></div><div className="field"><label>E-mail corporativo</label><input type="email" name="email" required/></div><div className="field"><label>Senha</label><input type="password" name="password" minLength={8} required/></div><SubmitButton className="btn full-btn" idleLabel="CADASTRAR EMPRESA →" pendingLabel="CRIANDO CONTA..."/></form><p className="auth-foot">Já possui conta? <Link href="/empresa/login">Entrar</Link></p></section></main>
}
