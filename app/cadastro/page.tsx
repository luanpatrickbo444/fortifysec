import Link from 'next/link'
import { registerAction } from '@/lib/actions'
import { SubmitButton } from '@/components/ui/SubmitButton'

export default async function Cadastro({searchParams}:{searchParams:Promise<{erro?:string,email?:string,novo?:string}>}){
 const p=await searchParams
 return <div className="authwrap"><div className="authcard"><div className="eyebrow">NOVA CONTA</div><h1>Crie seu perfil</h1><p className="muted">{p.novo==='1'?'Não encontramos uma conta com esse e-mail. Crie seu acesso para continuar.':'Entre no ecossistema FortifySec e comece sua jornada em cybersecurity.'}</p>{p.erro&&<p className="error">{p.erro}</p>}<form action={registerAction}><div className="field"><label>Nome</label><input required name="name" autoComplete="name"/></div><div className="field"><label>E-mail</label><input required type="email" name="email" autoComplete="email" defaultValue={p.email||''}/></div><div className="field"><label>Senha</label><input required minLength={8} type="password" name="password" autoComplete="new-password"/></div><SubmitButton className="btn full-btn" idleLabel="CRIAR CONTA →" pendingLabel="CRIANDO CONTA..."/></form><p className="muted">Já tem conta? <Link href="/login">Entrar</Link></p></div></div>
}
