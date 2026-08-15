import { CreditCard } from 'lucide-react'
import { DashboardShell } from '@/components/DashboardShell'
import { requireUser } from '@/lib/auth'

export default async function Payments(){
 const {supabase,user}=await requireUser()
 const [{data:profile},{data:payments}]=await Promise.all([
   supabase.from('profiles').select('role').eq('id',user.id).single(),
   supabase.from('payments').select('id,status,amount_cents,provider,created_at,updated_at,courses(title)').eq('user_id',user.id).order('created_at',{ascending:false})
 ])
 return <DashboardShell admin={profile?.role==='admin'}><div className="page-head"><div><div className="kicker">ACCOUNT / PAYMENTS</div><h1>Pagamentos</h1><p>Acompanhe suas compras, pagamentos e histórico de acesso.</p></div><CreditCard size={24}/></div><div className="tablewrap"><table><thead><tr><th>Curso</th><th>Valor</th><th>Provider</th><th>Status</th><th>Data</th></tr></thead><tbody>{(payments||[]).map((p:any)=><tr key={p.id}><td>{p.courses?.title||'Curso'}</td><td>R$ {(p.amount_cents/100).toFixed(2).replace('.',',')}</td><td className="mono">{p.provider}</td><td><span className={`pill ${p.status==='approved'?'active':p.status==='rejected'||p.status==='cancelled'?'danger':'locked'}`}>{p.status}</span></td><td>{new Date(p.created_at).toLocaleString('pt-BR')}</td></tr>)}</tbody></table>{!payments?.length&&<div className="empty-state">Nenhum pagamento registrado ainda.</div>}</div></DashboardShell>
}
