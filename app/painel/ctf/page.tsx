import Link from 'next/link'
import { Flag, RadioTower, Swords, Trophy } from 'lucide-react'
import { SubmitButton } from '@/components/ui/SubmitButton'
import { requireUser } from '@/lib/auth'
import { joinCtfAction } from '@/app/actions'

export default async function Ctf(){
 const {supabase,user}=await requireUser();const [{data:events},{data:participants}]=await Promise.all([
  supabase.from('ctf_events').select('id,title,description,starts_at,ends_at,prize_text,status').order('starts_at',{ascending:false}).limit(20),
  supabase.from('ctf_participants').select('event_id').eq('user_id',user.id)
 ])
 const joined=new Set((participants||[]).map((p:any)=>p.event_id));const live=(events||[]).find((e:any)=>e.status==='live')
 return <><div className="page-head internal-page-head"><div><div className="kicker">COMPETE / CTF</div><h1>Capture The Flag</h1><p>Inscreva-se nos eventos, resolva as missões e dispute o ranking específico de cada CTF.</p></div><span className={`pill ${live?'active':''}`}><RadioTower size={13}/>{live?'EVENTO AO VIVO':'COMPETITION HUB'}</span></div>
 <div className="challenge-grid" style={{gridTemplateColumns:'repeat(auto-fit,minmax(320px,1fr))'}}>{(events||[]).map((e:any)=>{const isJoined=joined.has(e.id);const ended=e.status==='finished'||new Date(e.ends_at).getTime()<=Date.now();return <article className={`challenge-card ctf-player-card ${e.status}`} key={e.id}><div className="challenge-top"/><div className="challenge-body"><div className="panel-head"><span className={`pill ${e.status==='live'?'active':''}`}>{String(e.status).toUpperCase()}</span><Trophy size={17}/></div><h2>{e.title}</h2><p className="muted">{e.description}</p><div className="meta-row"><span>INÍCIO {new Date(e.starts_at).toLocaleString('pt-BR')}</span><span>FIM {new Date(e.ends_at).toLocaleString('pt-BR')}</span></div><div className="meta-row"><span>{e.prize_text||'PRÊMIO A DEFINIR'}</span><span>{isJoined?'INSCRITO':'NÃO INSCRITO'}</span></div>{isJoined?<Link className="btn full-btn" href={`/painel/ctf/${e.id}`}><Swords size={15}/> ABRIR EVENTO →</Link>:ended?<button className="btn secondary full-btn" disabled>EVENTO ENCERRADO</button>:<form action={joinCtfAction}><input type="hidden" name="event_id" value={e.id}/><SubmitButton className="btn full-btn" idleLabel="ENTRAR NO CTF →" pendingLabel="INSCRITANDO..."/></form>}</div></article>})}</div>{!events?.length&&<div className="empty-state">Nenhum CTF anunciado.</div>}</>
}
