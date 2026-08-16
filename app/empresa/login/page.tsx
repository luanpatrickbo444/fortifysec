import Link from 'next/link'
import { KeyRound, ShieldCheck } from 'lucide-react'
import { companyLoginAction } from '@/app/actions'
import { CompanyAuthShell } from '@/components/CompanyAuthShell'
import { SubmitButton } from '@/components/ui/SubmitButton'

export default async function CompanyLogin({searchParams}:{searchParams:Promise<{erro?:string,sucesso?:string}>}){
  const q=await searchParams

  return (
    <CompanyAuthShell
      eyebrow="FORTIFYSEC / EMPLOYER"
      title="Área da empresa"
      description="Entre no Employer Console para gerenciar vagas, candidatos e talentos."
    >
      {q.erro&&<div className="alert danger-alert">{q.erro}</div>}
      {q.sucesso&&<div className="alert success-alert">{q.sucesso}</div>}

      <form action={companyLoginAction} className="company-auth-form">
        <div className="field">
          <label>E-mail corporativo</label>
          <input type="email" name="email" required autoComplete="email" placeholder="voce@empresa.com.br"/>
        </div>
        <div className="field">
          <label>Senha</label>
          <input type="password" name="password" required autoComplete="current-password" placeholder="••••••••"/>
        </div>
        <SubmitButton className="btn full-btn company-login-btn" idleLabel="ENTRAR NO EMPLOYER CONSOLE →" pendingLabel="AUTENTICANDO..."/>
      </form>

      <div className="company-security-note">
        <ShieldCheck size={15}/>
        <span>Publicações ficam disponíveis somente após a validação da empresa.</span>
      </div>

      <div className="company-auth-switch">
        <KeyRound size={14}/>
        <span>Ainda não tem acesso?</span>
        <Link href="/empresa/cadastro">CRIAR CONTA EMPRESARIAL</Link>
      </div>
    </CompanyAuthShell>
  )
}
