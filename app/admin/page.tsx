import { DashboardShell } from '@/components/DashboardShell'
import { requireAdmin } from '@/lib/auth'

export default async function AdminPayments(){
 const {supabase}=await requireAdmin()
 const {data:payments}=await supabase.from('payments').select('id,status,amount_cents,provider,external_reference,created_at,profiles(name,email),courses(title)').order('created_at',{ascending:false}).limit(300)
 return <DashboardShell admin><div className="page-head"><div><div className="kicker">ADMIN / PAYMENTS</div><h1>Pagamentos</h1><p>Visão operacional dos pagamentos recebidos do Mercado Pago. A aprovação é processada pelo webhook, não por botão de aluno.</p></div></div><div className="tablewrap"><table><thead><tr><th>Aluno</th><th>Curso</th><th>Valor</th><th>Status</th><th>Provider</th><th>Referência</th><th>Data</th></tr></thead><tbody>{(payments||[]).map((p:any)=><tr key={p.id}><td>{p.profiles?.name||p.profiles?.email||'—'}</td><td>{p.courses?.title||'—'}</td><td>R$ {(p.amount_cents/100).toFixed(2).replace('.',',')}</td><td><span className={`pill ${p.status==='approved'?'active':p.status==='rejected'||p.status==='cancelled'?'danger':'locked'}`}>{p.status}</span></td><td className="mono">{p.provider}</td><td className="mono">{p.external_reference||'—'}</td><td>{new Date(p.created_at).toLocaleString('pt-BR')}</td></tr>)}</tbody></table>{!payments?.length&&<div className="empty-state">Nenhum pagamento registrado.</div>}</div></DashboardShell>
}
