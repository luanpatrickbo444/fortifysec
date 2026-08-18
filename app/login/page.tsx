import Link from 'next/link'
import { LockKeyhole, ShieldCheck } from 'lucide-react'
import { loginAction } from '@/app/actions'
import { SubmitButton } from '@/components/ui/SubmitButton'

export default async function Login({searchParams}:{searchParams:Promise<{erro?:string,sucesso?:string}>}){
 const p=await searchParams
 return <div className="authwrap login-page"><div className="authcard login-card"><div className="auth-icon"><LockKeyhole size={20}/></div><div className="eyebrow">FORTIFYSEC ACCESS</div><h1>Entrar na plataforma</h1><p className="muted">Continue sua trilha, acesse Labs, Challenges e acompanhe sua evolução.</p>{p.erro&&<p className="error">{p.erro}</p>}{p.sucesso&&<p className="success">{p.sucesso}</p>}<form action={loginAction}><div className="field"><label>E-mail</label><input required type="email" name="email" autoComplete="email" placeholder="voce@email.com"/></div><div className="field"><label>Senha</label><input required type="password" name="password" autoComplete="current-password" placeholder="••••••••"/></div><SubmitButton className="btn full-btn" idleLabel="ENTRAR NO RANGE →" pendingLabel="AUTENTICANDO..."/></form><div className="auth-links"><Link href="/recuperar-senha">Esqueci minha senha</Link><span>•</span><Link href="/cadastro">Criar conta</Link></div><Link className="admin-access-link" href="/admin/login"><ShieldCheck size={13}/> Acesso administrativo</Link></div></div>
}
