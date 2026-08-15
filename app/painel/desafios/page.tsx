import { notFound, redirect } from 'next/navigation'
import { CheckCircle2, Flag, ShieldCheck, Swords, TerminalSquare } from 'lucide-react'
import { DashboardShell } from '@/components/DashboardShell'
import { DifficultyMeter } from '@/components/ui/DifficultyMeter'
import { SubmitButton } from '@/components/ui/SubmitButton'
import { requireUser } from '@/lib/auth'
import { submitChallengeAction } from '@/app/actions'

export default async function ChallengePage({params,searchParams}:{params:Promise<{slug:string}>,searchParams:Promise<{result?:string}>}){
 const {slug}=await params;const query=await searchParams;const {supabase,user}=await requireUser()
 const [{data:p},{data:access},{data:c}]=await Promise.all([
  supabase.from('profiles').select('role').eq('id',user.id).single(),
  supabase.from('enrollments').select('id').eq('user_id',user.id).eq('status','active').limit(1).maybeSingle(),
  supabase.from('challenges').select('id,title,slug,description,category,difficulty,xp_reward,briefing').eq('slug',slug).eq('published',true).maybeSingle()
 ])
 if(!c)notFound();if(!access)redirect('/painel/cursos')
 const {data:solve}=await supabase.from('challenge_solves').select('id,solved_at').eq('user_id',user.id).eq('challenge_id',c.id).maybeSingle()
 return <DashboardShell admin={p?.role==='admin'}>
   <div className="challenge-workspace-head"><div><div className="kicker">MISSION / {c.category.toUpperCase()}</div><h1>{c.title}</h1><p>{c.description}</p></div><div className="mission-score"><span>REWARD</span><strong>+{c.xp_reward} XP</strong></div></div>
   <div className="mission-meta-bar"><DifficultyMeter difficulty={c.difficulty}/><span className="mission-divider"/><span className="mono"><Swords size={13}/> {c.category.toUpperCase()}</span><span className="mission-divider"/><span className={`mono ${solve?'terminal-green':''}`}>{solve?'PWNED':'UNSOLVED'}</span></div>
   {query.result==='invalid'&&<div className="alert danger-alert">Flag inválida. Revise sua exploração e tente novamente.</div>}{query.result==='solved'&&<div className="alert success-alert"><CheckCircle2 size={16}/> Flag correta. XP creditado no seu perfil.</div>}
   <div className="challenge-workspace-grid"><section className="card mission-briefing"><div className="panel-head"><div><span className="section-index">01 / BRIEFING</span><h3>Objetivo da missão</h3></div><Flag size={19}/></div><p className="muted briefing-text" style={{whiteSpace:'pre-wrap'}}>{c.briefing||'Analise o cenário e encontre a flag dentro do escopo proposto. Use somente os ativos disponibilizados pela FortifySec.'}</p><div className="scope-box"><ShieldCheck size={17}/><div><strong>Escopo autorizado</strong><span>Somente ambiente disponibilizado neste Challenge.</span></div></div></section><aside className="card flag-terminal"><div className="terminal-toolbar"><span><TerminalSquare size={15}/> FLAG SUBMISSION</span><span className={`pill ${solve?'active':''}`}>{solve?'VERIFIED':'AWAITING FLAG'}</span></div>{solve?<div className="pwned-state"><CheckCircle2 size={38}/><strong>CHALLENGE PWNED</strong><p>Resolvido em {solve.solved_at?new Date(solve.solved_at).toLocaleString('pt-BR'):'sessão anterior'}.</p><small>O XP desta missão já foi contabilizado.</small></div>:<><div className="terminal-instructions"><span className="terminal-green">fortify@challenge</span>:~$ submit --flag</div><form action={submitChallengeAction} className="flag-submit-form"><input type="hidden" name="challenge_id" value={c.id}/><input type="hidden" name="slug" value={c.slug}/><div className="field"><label>FLAG</label><input required name="flag" autoComplete="off" spellCheck={false} placeholder="FORTIFY{...}"/></div><SubmitButton className="btn full-btn" idleLabel="ENVIAR FLAG →" pendingLabel="VALIDANDO FLAG..."/></form><p className="security-copy">Envie a flag encontrada para concluir a missão e registrar sua pontuação.</p></>}</aside></div>
 </DashboardShell>
}
