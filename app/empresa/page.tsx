import Link from 'next/link'
import { CheckCircle2, LogIn } from 'lucide-react'
import { companyRegisterAction } from '@/app/actions'
import { CompanyAuthShell } from '@/components/CompanyAuthShell'
import { SubmitButton } from '@/components/ui/SubmitButton'

export default async function CompanyRegister({searchParams}:{searchParams:Promise<{erro?:string}>}){
  const q=await searchParams

  return (
    <CompanyAuthShell
      eyebrow="EMPLOYER NETWORK / SIGN UP"
      title="Cadastrar empresa"
      description="Crie o acesso do responsável pelo recrutamento. A FortifySec valida a organização antes da primeira publicação."
    >
      {q.erro&&<div className="alert danger-alert">{q.erro}</div>}

      <form action={companyRegisterAction} className="company-auth-form">
        <div className="two-col company-register-grid">
          <div className="field">
            <label>Seu nome</label>
            <input name="name" required autoComplete="name" placeholder="Nome do responsável"/>
          </div>
          <div className="field">
            <label>Empresa</label>
            <input name="company_name" required autoComplete="organization" placeholder="Nome da organização"/>
          </div>
        </div>
        <div className="field">
          <label>E-mail corporativo</label>
          <input type="email" name="email" required autoComplete="email" placeholder="voce@empresa.com.br"/>
        </div>
        <div className="field">
          <label>Senha</label>
          <input type="password" name="password" minLength={8} required autoComplete="new-password" placeholder="Mínimo de 8 caracteres"/>
        </div>
        <div className="company-form-hint"><CheckCircle2 size={13}/> A conta será vinculada automaticamente à empresa cadastrada.</div>
        <SubmitButton className="btn full-btn company-login-btn" idleLabel="CRIAR EMPLOYER ACCOUNT →" pendingLabel="CRIANDO CONTA..."/>
      </form>

      <div className="company-auth-switch">
        <LogIn size={14}/>
        <span>Já possui conta empresarial?</span>
        <Link href="/empresa/login">ENTRAR</Link>
      </div>
    </CompanyAuthShell>
  )
}
