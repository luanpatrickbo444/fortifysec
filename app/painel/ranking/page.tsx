import { Crown, Medal, Trophy } from 'lucide-react'
import { DashboardShell } from '@/components/DashboardShell'
import { requireUser } from '@/lib/auth'

const podiumClass=['first','second','third']
export default async function Ranking(){
 const {supabase,user}=await requireUser();const [{data:p},{data:ranking}]=await Promise.all([supabase.from('profiles').select('role').eq('id',user.id).single(),supabase.rpc('get_leaderboard',{limit_count:100})]);const rows=ranking||[];const top=rows.slice(0,3)
 return <DashboardShell admin={p?.role==='admin'}>
   <div className="page-head internal-page-head"><div><div className="kicker">COMMUNITY / LEADERBOARD</div><h1>Ranking técnico</h1><p>XP é concedido por ações validadas: aulas concluídas e Challenges resolvidos.</p></div><span className="pill"><Trophy size={13}/> TOP {rows.length}</span></div>
   {top.length>0&&<section className="podium-grid">{top.map((r:any,i:number)=><article key={r.id} className={`podium-card ${podiumClass[i]}`}><div className="podium-position">{i===0?<Crown size={23}/>:<Medal size={21}/>}<span>#{i+1}</span></div><div className="podium-avatar">{String(r.name||'?').slice(0,1).toUpperCase()}</div><h3>{r.name}</h3><p>{r.headline||'Cybersecurity Operator'}</p><strong>{r.xp} XP</strong><div className="podium-bar"><span/></div></article>)}</section>}
   <div className="ranking-panel"><div className="panel-head"><div><span className="section-index">GLOBAL RANK</span><h3>Classificação geral</h3></div><span className="mono tiny-label">LIVE SCOREBOARD</span></div><div className="tablewrap rank-table"><table><thead><tr><th>Posição</th><th>Operador</th><th>Headline</th><th>XP</th></tr></thead><tbody>{rows.map((r:any,i:number)=><tr key={r.id} className={r.id===user.id?'current-user-row':''}><td className="rank">#{String(i+1).padStart(2,'0')}</td><td><div className="rank-operator"><span className="mini-avatar">{String(r.name||'?').slice(0,1).toUpperCase()}</span><strong>{r.name}</strong>{r.id===user.id&&<span className="tag green">YOU</span>}</div></td><td>{r.headline||'—'}</td><td><span className="xp-score">{r.xp} XP</span></td></tr>)}</tbody></table></div></div>
 </DashboardShell>
}
