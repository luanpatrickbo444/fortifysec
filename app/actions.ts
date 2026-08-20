'use server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdmin, requireCompany, requireUser } from '@/lib/auth'
import { ensureApplicationProfile } from '@/lib/profile-sync'
import { createHash, randomUUID } from 'node:crypto'
import { createRangeSession, destroyRangeSession, hasRangeProvider } from '@/lib/range-provider'

function asBool(v:FormDataEntryValue|null){return String(v||'false')==='true'}
function safeExternalUrl(value:string){try{const u=new URL(value);return u.protocol==='https:'||u.protocol==='http:'?u.toString():null}catch{return null}}
function safeAdminReturn(value:FormDataEntryValue|null,fallback='/admin'){const v=String(value||'');return v.startsWith('/admin/')||v==='/admin'?v:fallback}

function safeSlug(value:string){return value.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,80)}


type AdminDb=ReturnType<typeof createAdminClient>

async function getRangePolicy(admin:AdminDb,userId:string,role:string,hasEnrollment:boolean){
 const code=role==='admin'?'admin':hasEnrollment?'pro':'free'
 const {data}=await admin.from('range_plan_limits').select('code,max_concurrent_sessions,max_ttl_minutes,monthly_minutes').eq('code',code).maybeSingle()
 return data||{code,max_concurrent_sessions:role==='admin'?10:1,max_ttl_minutes:role==='admin'?240:60,monthly_minutes:0}
}

async function ensureRangeCapacity(admin:AdminDb,userId:string,role:string,hasEnrollment:boolean,requestedTtl:number){
 const policy=await getRangePolicy(admin,userId,role,hasEnrollment)
 const nowDate=new Date();const now=nowDate.toISOString()
 await admin.from('lab_sessions').update({status:'expired',stopped_at:now,ended_reason:'ttl'}).eq('user_id',userId).eq('status','running').lt('expires_at',now)
 const {count}=await admin.from('lab_sessions').select('id',{count:'exact',head:true}).eq('user_id',userId).eq('status','running').gt('expires_at',now)
 if(role!=='admin' && Number(count||0)>=Number(policy.max_concurrent_sessions||1)) throw new Error('Limite de sessões simultâneas atingido.')
 let ttl=Math.min(Math.max(15,Number(requestedTtl||60)),Number(policy.max_ttl_minutes||60))
 const monthlyLimit=Number(policy.monthly_minutes||0)
 if(role!=='admin'&&monthlyLimit>0){
  const monthStart=new Date(Date.UTC(nowDate.getUTCFullYear(),nowDate.getUTCMonth(),1)).toISOString()
  const {data:usage}=await admin.from('lab_sessions').select('started_at,stopped_at,expires_at').eq('user_id',userId).gte('started_at',monthStart)
  const used=Math.ceil((usage||[]).reduce((sum:number,row:any)=>{const start=new Date(row.started_at).getTime();const stop=Math.min(Date.now(),new Date(row.stopped_at||row.expires_at||now).getTime());return sum+Math.max(0,stop-start)},0)/60_000)
  const remaining=monthlyLimit-used
  if(remaining<15)throw new Error('Franquia mensal de Cyber Range atingida.')
  ttl=Math.min(ttl,remaining)
 }
 return ttl
}

async function auditRange(admin:AdminDb,input:{eventType:string,userId?:string|null,labId?:string|null,challengeId?:string|null,eventId?:string|null,providerSessionId?:string|null,details?:Record<string,unknown>}){
 try{await admin.from('range_audit_log').insert({event_type:input.eventType,user_id:input.userId||null,lab_id:input.labId||null,challenge_id:input.challengeId||null,ctf_event_id:input.eventId||null,provider_session_id:input.providerSessionId||null,details:input.details||{}})}catch{}
}

function newDynamicFlag(){
 return `fortify{${randomUUID().replace(/-/g,'')}}`
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get('email') || '').trim().toLowerCase()
  const password = String(formData.get('password') || '')

  if (!email || !password) {
    redirect('/login?erro=' + encodeURIComponent('Informe e-mail e senha.'))
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (!error && data.user) {
    const synced = await ensureApplicationProfile(data.user)

    // O login só precisa destes campos para decidir acesso e destino.
    // Usar um tipo mínimo evita incompatibilidade entre o perfil completo
    // retornado pela sincronização e o fallback consultado pelo próprio usuário.
    let profile: { role: string | null; blocked: boolean | null } | null = synced
      ? { role: synced.role, blocked: synced.blocked }
      : null

    if (!profile) {
      const own = await supabase
        .from('profiles')
        .select('role,blocked')
        .eq('id', data.user.id)
        .maybeSingle()

      profile = own.data
        ? {
            role: own.data.role == null ? null : String(own.data.role),
            blocked: own.data.blocked == null ? null : Boolean(own.data.blocked),
          }
        : null
    }

    if (profile?.blocked) {
      await supabase.auth.signOut()
      redirect('/login?erro=' + encodeURIComponent('Esta conta está temporariamente indisponível.'))
    }

    redirect('/painel')
  }

  const authMessage = String(error?.message || '').toLowerCase()
  if (authMessage.includes('email not confirmed') || authMessage.includes('email_not_confirmed')) {
    redirect('/login?erro=' + encodeURIComponent('Confirme seu e-mail antes de entrar.'))
  }
  if (authMessage.includes('rate limit') || authMessage.includes('too many')) {
    redirect('/login?erro=' + encodeURIComponent('Muitas tentativas. Aguarde um pouco e tente novamente.'))
  }

  let accountExists = true
  try {
    const admin = createAdminClient()
    const { data: existingProfile } = await admin
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle()
    accountExists = Boolean(existingProfile)
  } catch {
    accountExists = true
  }

  if (!accountExists) {
    redirect('/cadastro?novo=1&email=' + encodeURIComponent(email))
  }

  redirect('/login?erro=' + encodeURIComponent('Senha incorreta. Tente novamente ou recupere sua senha.'))
}

export async function adminLoginAction(formData: FormData) {
  const email = String(formData.get('email') || '').trim().toLowerCase()
  const password = String(formData.get('password') || '')
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error || !data.user) {
    return redirect('/admin/login?erro=' + encodeURIComponent('Credenciais inválidas.'))
  }

  const profile = await ensureApplicationProfile(data.user)
  if (!profile) {
    await supabase.auth.signOut()
    return redirect('/admin/login?erro=' + encodeURIComponent('Perfil administrativo não está sincronizado. Execute o patch de usuários no Supabase.'))
  }
  if (profile.blocked) {
    await supabase.auth.signOut()
    return redirect('/admin/login?erro=' + encodeURIComponent('Esta conta está temporariamente indisponível.'))
  }
  if (String(profile.role) !== 'admin') {
    await supabase.auth.signOut()
    return redirect('/admin/login?erro=' + encodeURIComponent('Esta conta existe, mas ainda não possui role admin.'))
  }

  return redirect('/admin')
}
export async function registerAction(formData: FormData) {
  const name = String(formData.get('name') || '').trim()
  const email = String(formData.get('email') || '').trim().toLowerCase()
  const password = String(formData.get('password') || '')
  if (name.length < 2 || password.length < 8) {
    redirect('/cadastro?erro=' + encodeURIComponent('Informe nome e senha com pelo menos 8 caracteres'))
  }

  const supabase = await createClient()
  const site = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name }, emailRedirectTo: `${site}/auth/callback` },
  })
  if (error) redirect('/cadastro?erro=' + encodeURIComponent(error.message))

  if (data.user) await ensureApplicationProfile(data.user)
  redirect('/login?sucesso=' + encodeURIComponent('Cadastro realizado. Confirme seu e-mail para entrar.'))
}
export async function resetPasswordAction(formData: FormData) {const email=String(formData.get('email')||'').trim().toLowerCase();const supabase=await createClient();const site=process.env.NEXT_PUBLIC_SITE_URL||'http://localhost:3000';await supabase.auth.resetPasswordForEmail(email,{redirectTo:`${site}/auth/callback?next=/atualizar-senha`});redirect('/recuperar-senha?sucesso=1')}
export async function updatePasswordAction(formData: FormData) {const password=String(formData.get('password')||'');if(password.length<8) redirect('/atualizar-senha?erro=Senha%20muito%20curta');const supabase=await createClient();const {error}=await supabase.auth.updateUser({password});if(error) redirect('/atualizar-senha?erro='+encodeURIComponent(error.message));redirect('/painel')}

export async function updateProfileAction(formData:FormData){
 const {supabase,user}=await requireUser()
 const name=String(formData.get('name')||'').trim()
 if(name.length<2)redirect('/painel/perfil?erro=nome')
 const payload={
  name,
  headline:String(formData.get('headline')||'').trim(),
  github_url:safeExternalUrl(String(formData.get('github_url')||'').trim()),
  linkedin_url:safeExternalUrl(String(formData.get('linkedin_url')||'').trim()),
  profile_public:asBool(formData.get('profile_public')),
  open_to_work:asBool(formData.get('open_to_work')),
  updated_at:new Date().toISOString(),
 }
 // Server-side own-profile write: authenticated user is fixed to user.id, so legacy RLS
 // cannot silently discard profile changes while another user's profile remains unreachable.
 const admin=createAdminClient()
 const {data:updated,error}=await admin.from('profiles')
  .update(payload)
  .eq('id',user.id)
  .select('id,name,headline,github_url,linkedin_url,profile_public,open_to_work')
  .maybeSingle()
 if(error||!updated){
  console.error('[profile:update]',error)
  redirect('/painel/perfil?erro=salvar')
 }
 await supabase.auth.updateUser({data:{name}}).catch(()=>null)
 revalidatePath('/painel/perfil')
 revalidatePath('/painel')
 revalidatePath('/talentos')
 redirect('/painel/perfil?salvo=1')
}


export async function startLabAction(formData:FormData){
 const {user}=await requireUser();const labId=String(formData.get('lab_id')||'');const slug=String(formData.get('slug')||'');const admin=createAdminClient()
 if(!labId)redirect('/painel/labs')
 const [{data:profile},{data:enrollment},{data:lab}]=await Promise.all([
  admin.from('profiles').select('role,blocked').eq('id',user.id).maybeSingle(),
  admin.from('enrollments').select('id').eq('user_id',user.id).eq('status','active').limit(1).maybeSingle(),
  admin.from('labs').select('id,connection_url,provider_lab_id,estimated_minutes,published').eq('id',labId).eq('published',true).maybeSingle(),
 ])
 const role=String(profile?.role||'student');const canAccess=!profile?.blocked&&(role==='admin'||Boolean(enrollment));if(!canAccess||!lab)redirect('/painel/labs')
 const now=new Date().toISOString();await admin.from('lab_sessions').update({status:'expired',stopped_at:now,ended_reason:'ttl'}).eq('user_id',user.id).eq('lab_id',labId).eq('status','running').lt('expires_at',now)
 const {data:running}=await admin.from('lab_sessions').select('id').eq('user_id',user.id).eq('lab_id',labId).eq('status','running').gt('expires_at',now).maybeSingle()
 if(!running){
  let ttl:number
  try{ttl=await ensureRangeCapacity(admin,user.id,role,Boolean(enrollment),lab.estimated_minutes||60)}catch(error:any){redirect(`/painel/labs/${slug}?erro=`+encodeURIComponent(String(error?.message||'Limite de sessões atingido.')))}
  let connectionUrl=lab.connection_url||null;let providerSessionId:string|null=null;let targetAddress:string|null=null;let vpnDownloadUrl:string|null=null;let providerBaseUrl:string|null=null;let providerKind:string|null=null;let estimatedCostCents=0;let expires=new Date(Date.now()+ttl*60_000).toISOString()
  if(hasRangeProvider()){
   try{const data=await createRangeSession({userId:user.id,labId:String(lab.provider_lab_id||lab.id),ttlMinutes:ttl});if(data){connectionUrl=data.connectionUrl||connectionUrl;providerSessionId=data.sessionId;targetAddress=data.targetAddress||null;vpnDownloadUrl=data.vpnDownloadUrl||null;providerBaseUrl=data.providerBaseUrl;providerKind=data.providerKind;estimatedCostCents=data.estimatedCostCents;if(data.expiresAt)expires=data.expiresAt}}
   catch(error:any){await auditRange(admin,{eventType:'session_provision_failed',userId:user.id,labId,details:{message:String(error?.message||error)}});redirect(`/painel/labs/${slug}?erro=provider`)}
  }
  const {error}=await admin.from('lab_sessions').insert({user_id:user.id,lab_id:labId,status:'running',connection_url:connectionUrl,provider_session_id:providerSessionId,target_address:targetAddress,vpn_download_url:vpnDownloadUrl,provider_base_url:providerBaseUrl,provider_kind:providerKind,estimated_cost_cents:estimatedCostCents,expires_at:expires})
  if(error){if(providerSessionId)await destroyRangeSession(providerSessionId,providerBaseUrl);redirect(`/painel/labs/${slug}?erro=sessao`)}
  await auditRange(admin,{eventType:'session_started',userId:user.id,labId,providerSessionId,details:{provider:providerKind,expires_at:expires,estimated_cost_cents:estimatedCostCents}})
 }
 revalidatePath(`/painel/labs/${slug}`);redirect(`/painel/labs/${slug}`)
}

export async function stopLabAction(formData:FormData){
 const {user}=await requireUser();const labId=String(formData.get('lab_id')||'');const slug=String(formData.get('slug')||'');const admin=createAdminClient()
 const {data:session}=await admin.from('lab_sessions').select('id,provider_session_id,provider_base_url').eq('user_id',user.id).eq('lab_id',labId).eq('status','running').maybeSingle()
 if(session?.provider_session_id)await destroyRangeSession(String(session.provider_session_id),session.provider_base_url?String(session.provider_base_url):null)
 await admin.from('lab_sessions').update({status:'stopped',stopped_at:new Date().toISOString(),ended_reason:'user'}).eq('user_id',user.id).eq('lab_id',labId).eq('status','running')
 await auditRange(admin,{eventType:'session_stopped',userId:user.id,labId,providerSessionId:session?.provider_session_id||null,details:{reason:'user'}})
 revalidatePath('/painel/labs');if(slug){revalidatePath(`/painel/labs/${slug}`);redirect(`/painel/labs/${slug}`)}
}

export async function submitChallengeAction(formData:FormData){
 const {supabase}=await requireUser();const challengeId=String(formData.get('challenge_id')||'');const slug=String(formData.get('slug')||'');const flag=String(formData.get('flag')||'').trim();const eventId=String(formData.get('ctf_event_id')||'')
 if(!challengeId||!flag)redirect(`/painel/desafios/${slug}?result=invalid${eventId?`&ctf=${encodeURIComponent(eventId)}`:''}`)
 const rpc=eventId?'submit_ctf_flag':'submit_challenge_flag'
 const args=eventId?{event_uuid:eventId,challenge_uuid:challengeId,candidate_flag:flag}:{challenge_uuid:challengeId,candidate_flag:flag}
 const {data,error}=await supabase.rpc(rpc,args as any)
 if(error||!data)redirect(`/painel/desafios/${slug}?result=invalid${eventId?`&ctf=${encodeURIComponent(eventId)}`:''}`)
 revalidatePath('/painel');revalidatePath('/painel/ranking');revalidatePath('/painel/ctf');if(eventId)revalidatePath(`/painel/ctf/${eventId}`)
 redirect(`/painel/desafios/${slug}?result=solved${eventId?`&ctf=${encodeURIComponent(eventId)}`:''}`)
}

export async function startChallengeTargetAction(formData:FormData){
 const {user}=await requireUser();const challengeId=String(formData.get('challenge_id')||'');const slug=String(formData.get('slug')||'');const eventId=String(formData.get('ctf_event_id')||'');const admin=createAdminClient()
 const [{data:profile},{data:enrollment},{data:challenge}]=await Promise.all([
  admin.from('profiles').select('role,blocked').eq('id',user.id).maybeSingle(),
  admin.from('enrollments').select('id').eq('user_id',user.id).eq('status','active').limit(1).maybeSingle(),
  admin.from('challenges').select('id,lab_id,published,dynamic_flag_enabled,labs(id,provider_lab_id,estimated_minutes,connection_url,published)').eq('id',challengeId).eq('published',true).maybeSingle(),
 ])
 const role=String(profile?.role||'student');const canAccess=!profile?.blocked&&(role==='admin'||Boolean(enrollment));const lab=Array.isArray((challenge as any)?.labs)?(challenge as any).labs[0]:(challenge as any)?.labs
 if(!canAccess||!challenge||!challenge.lab_id||!lab||!lab.published)redirect(`/painel/desafios/${slug}`)
 let eventEndsAt:string|null=null
 if(eventId){
  const nowMs=Date.now();const [{data:participant},{data:eventLink}]=await Promise.all([
   admin.from('ctf_participants').select('event_id').eq('event_id',eventId).eq('user_id',user.id).maybeSingle(),
   admin.from('ctf_event_challenges').select('event_id,challenge_id,ctf_events(status,starts_at,ends_at)').eq('event_id',eventId).eq('challenge_id',challengeId).maybeSingle(),
  ])
  const event=Array.isArray((eventLink as any)?.ctf_events)?(eventLink as any).ctf_events[0]:(eventLink as any)?.ctf_events;const live=event?.status==='live'&&new Date(event.starts_at).getTime()<=nowMs&&new Date(event.ends_at).getTime()>=nowMs
  if(!participant||!eventLink||!live)redirect(`/painel/ctf/${eventId}`);eventEndsAt=String(event.ends_at)
 }
 const now=new Date().toISOString();await admin.from('lab_sessions').update({status:'expired',stopped_at:now,ended_reason:'ttl'}).eq('user_id',user.id).eq('lab_id',challenge.lab_id).eq('status','running').lt('expires_at',now)
 const {data:existingRunning}=await admin.from('lab_sessions').select('id,ctf_event_id,challenge_id,provider_session_id,provider_base_url').eq('user_id',user.id).eq('lab_id',challenge.lab_id).eq('status','running').gt('expires_at',now).maybeSingle()
 let running=existingRunning
 // A generic Lab session must not be reused by a dynamic-flag CTF, otherwise that
 // target never received the participant-specific flag. Recycle it safely first.
 if(running&&eventId&&challenge.dynamic_flag_enabled&&(running.ctf_event_id!==eventId||running.challenge_id!==challengeId)){
  if(running.provider_session_id)await destroyRangeSession(String(running.provider_session_id),running.provider_base_url?String(running.provider_base_url):null)
  await admin.from('lab_sessions').update({status:'stopped',stopped_at:new Date().toISOString(),ended_reason:'ctf_rebind'}).eq('id',running.id)
  running=null
 }
 if(!running){
  let ttl:number
  try{ttl=await ensureRangeCapacity(admin,user.id,role,Boolean(enrollment),lab.estimated_minutes||60)}catch(error:any){redirect(`/painel/desafios/${slug}?result=limit${eventId?`&ctf=${encodeURIComponent(eventId)}`:''}`)}
  if(eventEndsAt){ttl=Math.max(15,Math.min(ttl,Math.ceil((new Date(eventEndsAt).getTime()-Date.now())/60_000)))}
  let expires=new Date(Date.now()+ttl*60_000).toISOString();let dynamicFlag:string|null=null
  if(eventId&&challenge.dynamic_flag_enabled&&!hasRangeProvider())redirect(`/painel/desafios/${slug}?result=provider${eventId?`&ctf=${encodeURIComponent(eventId)}`:''}`)
  if(eventId&&challenge.dynamic_flag_enabled){
   dynamicFlag=newDynamicFlag();const {error:flagError}=await admin.rpc('issue_ctf_dynamic_flag',{p_event_id:eventId,p_challenge_id:challengeId,p_user_id:user.id,p_flag:dynamicFlag,p_expires_at:expires});if(flagError){console.error('[CTF_DYNAMIC_FLAG]',flagError);redirect(`/painel/desafios/${slug}?result=flag${eventId?`&ctf=${encodeURIComponent(eventId)}`:''}`)}
  }
  let connectionUrl=lab.connection_url||null;let providerSessionId:string|null=null;let targetAddress:string|null=null;let vpnDownloadUrl:string|null=null;let providerBaseUrl:string|null=null;let providerKind:string|null=null;let estimatedCostCents=0
  if(hasRangeProvider()){
   try{const data=await createRangeSession({userId:user.id,labId:String(lab.provider_lab_id||lab.id),ttlMinutes:ttl,dynamicFlag,challengeId,eventId:eventId||null});if(data){connectionUrl=data.connectionUrl||connectionUrl;providerSessionId=data.sessionId;targetAddress=data.targetAddress||null;vpnDownloadUrl=data.vpnDownloadUrl||null;providerBaseUrl=data.providerBaseUrl;providerKind=data.providerKind;estimatedCostCents=data.estimatedCostCents;if(data.expiresAt)expires=data.expiresAt}}
   catch(error:any){await auditRange(admin,{eventType:'challenge_provision_failed',userId:user.id,labId:challenge.lab_id,challengeId,eventId:eventId||null,details:{message:String(error?.message||error)}});redirect(`/painel/desafios/${slug}?result=provider${eventId?`&ctf=${encodeURIComponent(eventId)}`:''}`)}
  }
  const {error}=await admin.from('lab_sessions').insert({user_id:user.id,lab_id:challenge.lab_id,status:'running',connection_url:connectionUrl,provider_session_id:providerSessionId,target_address:targetAddress,vpn_download_url:vpnDownloadUrl,ctf_event_id:eventId||null,challenge_id:challengeId,provider_base_url:providerBaseUrl,provider_kind:providerKind,estimated_cost_cents:estimatedCostCents,expires_at:expires})
  if(error){if(providerSessionId)await destroyRangeSession(providerSessionId,providerBaseUrl);redirect(`/painel/desafios/${slug}?result=session${eventId?`&ctf=${encodeURIComponent(eventId)}`:''}`)}
  await auditRange(admin,{eventType:'challenge_session_started',userId:user.id,labId:challenge.lab_id,challengeId,eventId:eventId||null,providerSessionId,details:{dynamic_flag:Boolean(dynamicFlag),provider:providerKind,expires_at:expires,estimated_cost_cents:estimatedCostCents}})
 }
 revalidatePath(`/painel/desafios/${slug}`);redirect(`/painel/desafios/${slug}${eventId?`?ctf=${encodeURIComponent(eventId)}`:''}`)
}

export async function stopChallengeTargetAction(formData:FormData){
 const {user}=await requireUser();const labId=String(formData.get('lab_id')||'');const slug=String(formData.get('slug')||'');const eventId=String(formData.get('ctf_event_id')||'');const admin=createAdminClient()
 const {data:session}=await admin.from('lab_sessions').select('id,provider_session_id,provider_base_url,challenge_id').eq('user_id',user.id).eq('lab_id',labId).eq('status','running').maybeSingle()
 if(session?.provider_session_id)await destroyRangeSession(String(session.provider_session_id),session.provider_base_url?String(session.provider_base_url):null)
 await admin.from('lab_sessions').update({status:'stopped',stopped_at:new Date().toISOString(),ended_reason:'user'}).eq('user_id',user.id).eq('lab_id',labId).eq('status','running')
 await auditRange(admin,{eventType:'challenge_session_stopped',userId:user.id,labId,challengeId:session?.challenge_id||null,eventId:eventId||null,providerSessionId:session?.provider_session_id||null,details:{reason:'user'}})
 revalidatePath(`/painel/desafios/${slug}`);redirect(`/painel/desafios/${slug}${eventId?`?ctf=${encodeURIComponent(eventId)}`:''}`)
}

export async function joinCtfAction(formData:FormData){
 const {user}=await requireUser();const eventId=String(formData.get('event_id')||'');if(!eventId)return;const admin=createAdminClient();const [{data:event},{data:profile},{data:enrollment}]=await Promise.all([admin.from('ctf_events').select('id,status,starts_at,ends_at').eq('id',eventId).maybeSingle(),admin.from('profiles').select('role,blocked').eq('id',user.id).maybeSingle(),admin.from('enrollments').select('id').eq('user_id',user.id).eq('status','active').limit(1).maybeSingle()]);const canAccess=!profile?.blocked&&(String(profile?.role||'')==='admin'||Boolean(enrollment));if(!canAccess||!event||event.status==='finished'||new Date(event.ends_at).getTime()<=Date.now())redirect('/painel/ctf');await admin.from('ctf_participants').upsert({event_id:eventId,user_id:user.id},{onConflict:'event_id,user_id'});revalidatePath('/painel/ctf');revalidatePath(`/painel/ctf/${eventId}`);redirect(`/painel/ctf/${eventId}`)
}

export async function adminSetEnrollmentAction(formData:FormData){await requireAdmin();const userId=String(formData.get('user_id')||'');const courseId=String(formData.get('course_id')||'');const status=String(formData.get('status')||'active');if(!userId||!courseId||!['active','pending','blocked','expired'].includes(status))return;const admin=createAdminClient();await admin.from('enrollments').upsert({user_id:userId,course_id:courseId,status,source:'admin',activated_at:status==='active'?new Date().toISOString():null},{onConflict:'user_id,course_id'});revalidatePath('/admin/matriculas');revalidatePath('/painel/cursos');revalidatePath('/painel/labs');revalidatePath('/painel/desafios');revalidatePath('/painel')}
export async function adminCreateCourseAction(formData:FormData){await requireAdmin();const admin=createAdminClient();const title=String(formData.get('title')||'').trim();const slug=String(formData.get('slug')||'').trim().toLowerCase().replace(/[^a-z0-9-]/g,'-');const description=String(formData.get('description')||'').trim();const price=slug==='formacao-fortifysec'?99.90:Number(formData.get('price')||0);if(!title||!slug)return;await admin.from('courses').insert({title,slug,description,price_cents:Math.round(price*100),published:true});revalidatePath('/admin/cursos');revalidatePath('/painel/cursos')}
export async function adminToggleUserAction(formData:FormData){const {user}=await requireAdmin();const userId=String(formData.get('user_id')||'');if(userId===user.id)return;const blocked=String(formData.get('blocked')||'false')==='true';const admin=createAdminClient();await admin.from('profiles').update({blocked:!blocked}).eq('id',userId);if(!blocked)await admin.from('lab_sessions').update({status:'revoked',stopped_at:new Date().toISOString()}).eq('user_id',userId).eq('status','running');revalidatePath('/admin/usuarios')}
export async function adminCreateLabAction(formData:FormData){await requireAdmin();const admin=createAdminClient();const title=String(formData.get('title')||'').trim();const slug=String(formData.get('slug')||'').trim().toLowerCase().replace(/[^a-z0-9-]/g,'-');if(!title||!slug)return;await admin.from('labs').insert({title,slug,description:String(formData.get('description')||''),difficulty:String(formData.get('difficulty')||'Easy'),estimated_minutes:Number(formData.get('estimated_minutes')||60),connection_url:String(formData.get('connection_url')||'')||null,provider_lab_id:String(formData.get('provider_lab_id')||'')||null,instructions:String(formData.get('instructions')||''),tags:String(formData.get('tags')||'').split(',').map(s=>s.trim()).filter(Boolean),published:true});revalidatePath('/admin/labs');revalidatePath('/painel/labs')}
export async function adminCreateChallengeAction(formData:FormData){
 await requireAdmin();const admin=createAdminClient();const title=String(formData.get('title')||'').trim();const slug=String(formData.get('slug')||'').trim().toLowerCase().replace(/[^a-z0-9-]/g,'-');const flag=String(formData.get('flag')||'').trim();const labId=String(formData.get('lab_id')||'')||null;if(!title||!slug||!flag)redirect('/admin/desafios?erro='+encodeURIComponent('Preencha título, slug e flag do Challenge.'));
 if(labId){const {data:lab,error:labError}=await admin.from('labs').select('id').eq('id',labId).maybeSingle();if(labError||!lab)redirect('/admin/desafios?erro='+encodeURIComponent('O Lab selecionado não existe.'))}
 const flagHash=`\\x${createHash('sha256').update(flag,'utf8').digest('hex')}`;
 const {data:newChallenge,error}=await admin.from('challenges').insert({title,slug,description:String(formData.get('description')||''),category:String(formData.get('category')||'Web'),difficulty:String(formData.get('difficulty')||'Easy'),xp_reward:Math.max(0,Number(formData.get('xp_reward')||50)),briefing:String(formData.get('briefing')||''),flag_hash:flagHash,published:true,lab_id:labId,dynamic_flag_enabled:Boolean(labId)}).select('id').single();
 if(error||!newChallenge){console.error('[ADMIN_CHALLENGE_CREATE]',error||'challenge id not returned');redirect('/admin/desafios?erro='+encodeURIComponent(error?.message||'Não foi possível gravar o Challenge.'))}
 revalidatePath('/admin/desafios');revalidatePath('/admin/ctf');revalidatePath('/painel/desafios');redirect('/admin/desafios?criado=1')
}

export async function adminCreateCtfAction(formData:FormData){
 const {supabase}=await requireAdmin();const title=String(formData.get('title')||'').trim();const starts=String(formData.get('starts_at')||'');const ends=String(formData.get('ends_at')||'');if(!title||!starts||!ends)redirect('/admin/ctf?erro='+encodeURIComponent('Preencha título, início e fim do CTF.'));
 const startDate=new Date(starts);const endDate=new Date(ends);if(!Number.isFinite(startDate.getTime())||!Number.isFinite(endDate.getTime())||endDate<=startDate){console.error('[ADMIN_CTF_CREATE] invalid date range',{starts,ends});redirect('/admin/ctf?erro='+encodeURIComponent('A data final precisa ser posterior à data inicial.'))}
 const {data:newId,error}=await supabase.rpc('admin_create_ctf_safe',{p_title:title,p_description:String(formData.get('description')||''),p_starts_at:startDate.toISOString(),p_ends_at:endDate.toISOString(),p_prize_text:String(formData.get('prize_text')||''),p_status:String(formData.get('status')||'scheduled')});
 if(error||!newId){console.error('[ADMIN_CTF_CREATE]',error||'ctf id not returned');redirect('/admin/ctf?erro='+encodeURIComponent(error?.message||'Não foi possível criar o CTF.'))}
 revalidatePath('/admin/ctf');revalidatePath('/painel/ctf');redirect('/admin/ctf?criado=1')
}

export async function adminCreateLessonAction(formData:FormData){
 const {supabase}=await requireAdmin();const courseId=String(formData.get('course_id')||'');const moduleId=String(formData.get('module_id')||'')||null;const title=String(formData.get('title')||'').trim();const rawPosition=Number(formData.get('position')||0);const position=Number.isFinite(rawPosition)&&rawPosition>0?Math.trunc(rawPosition):null;const returnTo=safeAdminReturn(formData.get('return_to'),'/admin/aulas');if(!courseId||!title)redirect(`${returnTo}?erro=dados`);
 const {data:newId,error}=await supabase.rpc('admin_create_lesson_safe',{p_course_id:courseId,p_module_id:moduleId,p_title:title,p_summary:String(formData.get('summary')||'').trim(),p_content:String(formData.get('content')||''),p_video_url:safeExternalUrl(String(formData.get('video_url')||'').trim()),p_position:position,p_xp_reward:Math.max(0,Number(formData.get('xp_reward')||10)),p_published:asBool(formData.get('published'))});
 if(error||!newId){console.error('[ADMIN_LESSON_CREATE]',error||'lesson id not returned');redirect(`${returnTo}?erro=salvar`)}
 revalidatePath('/admin/aulas');revalidatePath(returnTo);revalidatePath('/painel/cursos');redirect(`${returnTo}?criada=1`)
}

export async function adminToggleCourseAction(formData:FormData){await requireAdmin();const admin=createAdminClient();const courseId=String(formData.get('course_id')||'');const published=String(formData.get('published')||'false')==='true';await admin.from('courses').update({published:!published}).eq('id',courseId);revalidatePath('/admin/cursos');revalidatePath('/painel/cursos')}
export async function adminSetUserRoleAction(formData:FormData){const {user}=await requireAdmin();const target=String(formData.get('user_id')||'');const role=String(formData.get('role')||'student');if(!target||target===user.id||!['student','admin'].includes(role))return;const admin=createAdminClient();await admin.from('profiles').update({role}).eq('id',target);revalidatePath('/admin/usuarios')}


export async function adminCreateModuleAction(formData:FormData){
 await requireAdmin();const admin=createAdminClient();const courseId=String(formData.get('course_id')||'');const title=String(formData.get('title')||'').trim();const position=Number(formData.get('position')||1);const returnTo=safeAdminReturn(formData.get('return_to'),'/admin/cursos');if(!courseId||!title||position<1)redirect(`${returnTo}?erro=modulo`);const {error}=await admin.from('course_modules').insert({course_id:courseId,title,description:String(formData.get('description')||'').trim(),position,published:true});if(error)redirect(`${returnTo}?erro=modulo`);revalidatePath(returnTo);redirect(`${returnTo}?modulo=1`)
}

export async function adminUpdateCourseAction(formData:FormData){
 await requireAdmin();const admin=createAdminClient();const courseId=String(formData.get('course_id')||'');const title=String(formData.get('title')||'').trim();const slug=String(formData.get('slug')||'').trim().toLowerCase().replace(/[^a-z0-9-]/g,'-');const price=slug==='formacao-fortifysec'?99.90:Math.max(0,Number(formData.get('price')||0));if(!courseId||!title||!slug)return;await admin.from('courses').update({title,slug,description:String(formData.get('description')||'').trim(),price_cents:Math.round(price*100),published:asBool(formData.get('published')),updated_at:new Date().toISOString()}).eq('id',courseId);revalidatePath('/admin/cursos');revalidatePath(`/admin/cursos/${courseId}`);revalidatePath('/painel/cursos')
}

export async function adminToggleModuleAction(formData:FormData){
 await requireAdmin();const admin=createAdminClient();const id=String(formData.get('module_id')||'');const published=asBool(formData.get('published'));const returnTo=safeAdminReturn(formData.get('return_to'),'/admin/cursos');if(!id)return;await admin.from('course_modules').update({published:!published,updated_at:new Date().toISOString()}).eq('id',id);revalidatePath(returnTo)
}

export async function adminToggleLessonAction(formData:FormData){
 const {supabase}=await requireAdmin();const id=String(formData.get('lesson_id')||'');const published=asBool(formData.get('published'));const returnTo=safeAdminReturn(formData.get('return_to'),'/admin/aulas');if(!id)return;const {error}=await supabase.rpc('admin_set_lesson_published_safe',{p_lesson_id:id,p_published:!published});if(error){console.error('[ADMIN_LESSON_TOGGLE]',error);return}revalidatePath('/admin/aulas');revalidatePath(returnTo);revalidatePath('/painel/cursos')
}

export async function adminDeleteLessonAction(formData:FormData){
 const {supabase}=await requireAdmin();const id=String(formData.get('lesson_id')||'');const returnTo=safeAdminReturn(formData.get('return_to'),'/admin/aulas');if(!id)return;const {error}=await supabase.rpc('admin_delete_lesson_safe',{p_lesson_id:id});if(error){console.error('[ADMIN_LESSON_DELETE]',error);return}revalidatePath('/admin/aulas');revalidatePath(returnTo);revalidatePath('/painel/cursos')
}

export async function adminToggleLabPublishedAction(formData:FormData){
 await requireAdmin();const admin=createAdminClient();const id=String(formData.get('lab_id')||'');const published=asBool(formData.get('published'));if(!id)return;await admin.from('labs').update({published:!published,updated_at:new Date().toISOString()}).eq('id',id);revalidatePath('/admin/labs');revalidatePath('/painel/labs')
}

export async function adminToggleChallengePublishedAction(formData:FormData){
 await requireAdmin();const admin=createAdminClient();const id=String(formData.get('challenge_id')||'').trim();const published=asBool(formData.get('published'));if(!id)redirect('/admin/desafios?erro='+encodeURIComponent('Challenge inválido.'));const {error}=await admin.from('challenges').update({published:!published,updated_at:new Date().toISOString()}).eq('id',id);if(error){console.error('[ADMIN_CHALLENGE_TOGGLE]',error);redirect('/admin/desafios?erro='+encodeURIComponent(error.message||'Não foi possível atualizar o Challenge.'))}revalidatePath('/admin/desafios');revalidatePath('/admin/ctf');revalidatePath('/painel/desafios');redirect('/admin/desafios')
}

export async function adminUpdateCtfStatusAction(formData:FormData){
 const {supabase}=await requireAdmin();const id=String(formData.get('event_id')||'').trim();const status=String(formData.get('status')||'scheduled');if(!id||!['scheduled','live','finished'].includes(status))redirect('/admin/ctf?erro='+encodeURIComponent('CTF ou status inválido.'));const {error}=await supabase.rpc('admin_update_ctf_status_safe',{p_event_id:id,p_status:status});if(error){console.error('[ADMIN_CTF_STATUS]',error);redirect('/admin/ctf?erro='+encodeURIComponent(error.message||'Não foi possível atualizar o status.'))}revalidatePath('/admin/ctf');revalidatePath('/painel/ctf');revalidatePath(`/painel/ctf/${id}`);redirect('/admin/ctf?status=1')
}

export async function adminLinkChallengeToCtfAction(formData:FormData){
 await requireAdmin();const admin=createAdminClient();const eventId=String(formData.get('event_id')||'').trim();const challengeId=String(formData.get('challenge_id')||'').trim();const rawPosition=Number(formData.get('position')||1);const position=Number.isFinite(rawPosition)&&rawPosition>0?Math.trunc(rawPosition):1;
 if(!eventId||!challengeId)redirect('/admin/ctf?erro='+encodeURIComponent('Selecione um CTF e um Challenge.'));
 const [{data:event,error:eventError},{data:challenge,error:challengeError}]=await Promise.all([
  admin.from('ctf_events').select('id,title').eq('id',eventId).maybeSingle(),
  admin.from('challenges').select('id,title,published').eq('id',challengeId).maybeSingle(),
 ]);
 if(eventError||!event){console.error('[ADMIN_CTF_LINK_EVENT]',eventError||'ctf not found');redirect('/admin/ctf?erro='+encodeURIComponent('CTF não encontrado.'))}
 if(challengeError||!challenge){console.error('[ADMIN_CTF_LINK_CHALLENGE]',challengeError||'challenge not found');redirect('/admin/ctf?erro='+encodeURIComponent('Challenge não encontrado.'))}
 if(!challenge.published)redirect('/admin/ctf?erro='+encodeURIComponent('O Challenge precisa estar publicado antes de ser vinculado.'));
 const {error}=await admin.from('ctf_event_challenges').upsert({event_id:eventId,challenge_id:challengeId,position},{onConflict:'event_id,challenge_id'});
 if(error){console.error('[ADMIN_CTF_LINK]',error);redirect('/admin/ctf?erro='+encodeURIComponent(error.message||'Não foi possível vincular o Challenge.'))}
 revalidatePath('/admin/ctf');revalidatePath('/painel/ctf');revalidatePath(`/painel/ctf/${eventId}`);redirect('/admin/ctf?vinculado=1')
}

export async function adminUnlinkChallengeFromCtfAction(formData:FormData){
 await requireAdmin();const admin=createAdminClient();const eventId=String(formData.get('event_id')||'').trim();const challengeId=String(formData.get('challenge_id')||'').trim();if(!eventId||!challengeId)redirect('/admin/ctf?erro='+encodeURIComponent('Vínculo de CTF inválido.'));const {error}=await admin.from('ctf_event_challenges').delete().eq('event_id',eventId).eq('challenge_id',challengeId);if(error){console.error('[ADMIN_CTF_UNLINK]',error);redirect('/admin/ctf?erro='+encodeURIComponent(error.message||'Não foi possível remover o Challenge do CTF.'))}revalidatePath('/admin/ctf');revalidatePath('/painel/ctf');revalidatePath(`/painel/ctf/${eventId}`);redirect('/admin/ctf?removido=1')
}

export async function adminUpdateSiteSettingsAction(formData:FormData){
 await requireAdmin();const admin=createAdminClient();const payload={announcement:String(formData.get('announcement')||'').trim().slice(0,180),support_email:String(formData.get('support_email')||'').trim().toLowerCase(),academy_cta:String(formData.get('academy_cta')||'').trim().slice(0,60),labs_cta:String(formData.get('labs_cta')||'').trim().slice(0,60),ctf_prize_label:String(formData.get('ctf_prize_label')||'').trim().slice(0,60),maintenance_mode:asBool(formData.get('maintenance_mode'))};await admin.from('site_settings').upsert({key:'platform',value:payload,updated_at:new Date().toISOString()},{onConflict:'key'});revalidatePath('/admin/site');revalidatePath('/');revalidatePath('/academy');revalidatePath('/labs');revalidatePath('/ctf')
}


export async function companyRegisterAction(formData:FormData){
 const name=String(formData.get('name')||'').trim();const companyName=String(formData.get('company_name')||'').trim();const email=String(formData.get('email')||'').trim().toLowerCase();const password=String(formData.get('password')||'')
 if(name.length<2||companyName.length<2||password.length<8)redirect('/empresa/cadastro?erro='+encodeURIComponent('Preencha nome, empresa e senha com pelo menos 8 caracteres.'))
 const supabase=await createClient();const site=process.env.NEXT_PUBLIC_SITE_URL||'http://localhost:3000';const {data,error}=await supabase.auth.signUp({email,password,options:{data:{name},emailRedirectTo:`${site}/auth/callback?next=/empresa`}})
 if(error||!data.user)redirect('/empresa/cadastro?erro='+encodeURIComponent(error?.message||'Não foi possível criar a conta.'))
 await ensureApplicationProfile(data.user);const admin=createAdminClient();const base=safeSlug(companyName)||'empresa';const slug=`${base}-${data.user.id.slice(0,8)}`;const {data:company,error:companyError}=await admin.from('companies').insert({name:companyName,slug,created_by:data.user.id,verified:false,active:true}).select('id').single()
 if(companyError||!company)redirect('/empresa/cadastro?erro='+encodeURIComponent('Conta criada, mas não foi possível cadastrar a empresa.'))
 await admin.from('company_members').insert({company_id:company.id,user_id:data.user.id,member_role:'owner'})
 redirect('/empresa/login?sucesso='+encodeURIComponent('Empresa cadastrada. Confirme seu e-mail e aguarde a validação da FortifySec.'))
}

export async function companyLoginAction(formData:FormData){
 const email=String(formData.get('email')||'').trim().toLowerCase()
 const password=String(formData.get('password')||'')
 const supabase=await createClient()
 const {data,error}=await supabase.auth.signInWithPassword({email,password})
 if(error||!data.user)redirect('/empresa/login?erro='+encodeURIComponent('Credenciais inválidas.'))

 await ensureApplicationProfile(data.user)
 const admin=createAdminClient()
 const {data:member}=await admin
   .from('company_members')
   .select('company_id,companies(active)')
   .eq('user_id',data.user.id)
   .limit(1)
   .maybeSingle()

 const company=Array.isArray((member as any)?.companies)?(member as any).companies[0]:(member as any)?.companies
 if(!member||!company?.active){
   await supabase.auth.signOut()
   redirect('/empresa/login?erro='+encodeURIComponent('Conta sem empresa ativa vinculada.'))
 }
 redirect('/empresa')
}

export async function companyUpdateProfileAction(formData:FormData){
 const {company}=await requireCompany();const admin=createAdminClient();const website=safeExternalUrl(String(formData.get('website')||'').trim());await admin.from('companies').update({description:String(formData.get('description')||'').trim(),website,location:String(formData.get('location')||'').trim()}).eq('id',company.id);revalidatePath('/empresa');redirect('/empresa?salvo=1')
}

export async function companyCreateJobAction(formData:FormData){
 const {user,company}=await requireCompany()
 const status=String(formData.get('status')||'draft')==='published'?'published':'draft'
 if(status==='published'&&!company.verified)redirect('/empresa/vagas/nova?erro='+encodeURIComponent('A empresa precisa ser validada pela FortifySec antes de publicar vagas. Salve como rascunho enquanto a validação está pendente.'))
 const title=String(formData.get('title')||'').trim();if(title.length<3)redirect('/empresa/vagas/nova?erro='+encodeURIComponent('Informe o título da vaga.'))
 const salaryMin=Number(formData.get('salary_min')||0)||null;const salaryMax=Number(formData.get('salary_max')||0)||null;if(salaryMin!==null&&salaryMax!==null&&salaryMax<salaryMin)redirect('/empresa/vagas/nova?erro='+encodeURIComponent('O salário máximo não pode ser menor que o mínimo.'))
 const admin=createAdminClient();const slug=`${safeSlug(company.slug)}-${safeSlug(title)}-${randomUUID().slice(0,6)}`
 const payload={company_id:company.id,created_by:user.id,title,slug,description:String(formData.get('description')||'').trim(),requirements:String(formData.get('requirements')||'').trim(),location:String(formData.get('location')||'').trim(),work_mode:String(formData.get('work_mode')||'remote'),employment_type:String(formData.get('employment_type')||'full_time'),seniority:String(formData.get('seniority')||'').trim(),salary_min:salaryMin,salary_max:salaryMax,status,published_at:status==='published'?new Date().toISOString():null}
 const {error}=await admin.from('jobs').insert(payload);if(error)redirect('/empresa/vagas/nova?erro='+encodeURIComponent(error.message));revalidatePath('/empresa');revalidatePath('/empresa/vagas');revalidatePath('/vagas');redirect('/empresa/vagas?criada=1')
}

export async function companySetJobStatusAction(formData:FormData){
 const {company}=await requireCompany();const jobId=String(formData.get('job_id')||'');const status=String(formData.get('status')||'draft');if(!['draft','published','closed'].includes(status))return;if(status==='published'&&!company.verified)redirect('/empresa/vagas?erro=validacao');const admin=createAdminClient();await admin.from('jobs').update({status,published_at:status==='published'?new Date().toISOString():null}).eq('id',jobId).eq('company_id',company.id);revalidatePath('/empresa');revalidatePath('/empresa/vagas');revalidatePath('/vagas')
}

export async function companyUpdateJobAction(formData:FormData){
 const {company}=await requireCompany()
 const jobId=String(formData.get('job_id')||'')
 if(!jobId)redirect('/empresa/vagas')
 const title=String(formData.get('title')||'').trim()
 if(title.length<3)redirect(`/empresa/vagas/${jobId}/editar?erro=`+encodeURIComponent('Informe o título da vaga.'))
 const salaryMin=Number(formData.get('salary_min')||0)||null
 const salaryMax=Number(formData.get('salary_max')||0)||null
 if(salaryMin!==null&&salaryMax!==null&&salaryMax<salaryMin)redirect(`/empresa/vagas/${jobId}/editar?erro=`+encodeURIComponent('O salário máximo não pode ser menor que o mínimo.'))
 const requestedStatus=String(formData.get('status')||'draft')
 const status=requestedStatus==='published'?'published':requestedStatus==='closed'?'closed':'draft'
 if(status==='published'&&!company.verified)redirect(`/empresa/vagas/${jobId}/editar?erro=`+encodeURIComponent('A empresa precisa ser validada antes de publicar vagas.'))
 const admin=createAdminClient()
 const payload={
  title,
  description:String(formData.get('description')||'').trim(),
  requirements:String(formData.get('requirements')||'').trim(),
  location:String(formData.get('location')||'').trim(),
  work_mode:String(formData.get('work_mode')||'remote'),
  employment_type:String(formData.get('employment_type')||'full_time'),
  seniority:String(formData.get('seniority')||'').trim(),
  salary_min:salaryMin,
  salary_max:salaryMax,
  status,
  published_at:status==='published'?new Date().toISOString():null,
  updated_at:new Date().toISOString(),
 }
 const {error}=await admin.from('jobs').update(payload).eq('id',jobId).eq('company_id',company.id)
 if(error)redirect(`/empresa/vagas/${jobId}/editar?erro=`+encodeURIComponent(error.message))
 revalidatePath('/empresa');revalidatePath('/empresa/vagas');revalidatePath(`/empresa/vagas/${jobId}/editar`);revalidatePath('/vagas')
 redirect('/empresa/vagas?salvo=1')
}

export async function companySaveTalentAction(formData:FormData){
 const {user,company}=await requireCompany()
 const talentId=String(formData.get('talent_id')||'')
 if(!talentId||talentId===user.id)return
 const admin=createAdminClient()
 const {data:talent}=await admin.from('profiles').select('id,profile_public,blocked').eq('id',talentId).maybeSingle()
 if(!talent||!talent.profile_public||talent.blocked)return
 await admin.from('company_talent_shortlist').upsert({company_id:company.id,talent_user_id:talentId,added_by:user.id,status:'saved',updated_at:new Date().toISOString()},{onConflict:'company_id,talent_user_id'})
 revalidatePath('/empresa/talentos')
}

export async function companyRemoveTalentAction(formData:FormData){
 const {company}=await requireCompany()
 const talentId=String(formData.get('talent_id')||'')
 if(!talentId)return
 const admin=createAdminClient()
 await admin.from('company_talent_shortlist').delete().eq('company_id',company.id).eq('talent_user_id',talentId)
 revalidatePath('/empresa/talentos')
}

export async function applyToJobAction(formData:FormData){
 const {user}=await requireUser();const jobId=String(formData.get('job_id')||'');const slug=String(formData.get('slug')||'');const admin=createAdminClient();const {data:job}=await admin.from('jobs').select('id,status,company_id,companies(verified,active)').eq('id',jobId).maybeSingle();const co=Array.isArray((job as any)?.companies)?(job as any).companies[0]:(job as any)?.companies;if(!job||job.status!=='published'||!co?.verified||!co?.active)redirect('/vagas');await admin.from('job_applications').upsert({job_id:jobId,user_id:user.id,cover_note:String(formData.get('cover_note')||'').trim(),status:'submitted'},{onConflict:'job_id,user_id'});revalidatePath(`/vagas/${slug}`);revalidatePath('/painel/perfil');redirect(`/vagas/${slug}?aplicado=1`)
}

export async function companyUpdateApplicationStatusAction(formData:FormData){
 const {company}=await requireCompany();const applicationId=String(formData.get('application_id')||'');const status=String(formData.get('status')||'viewed');if(!['submitted','viewed','interview','rejected','hired'].includes(status))return;const admin=createAdminClient();const {data:application}=await admin.from('job_applications').select('id,jobs(company_id)').eq('id',applicationId).maybeSingle();const job=Array.isArray((application as any)?.jobs)?(application as any).jobs[0]:(application as any)?.jobs;if(job?.company_id!==company.id)return;await admin.from('job_applications').update({status}).eq('id',applicationId);revalidatePath('/empresa/candidatos')
}

export async function adminVerifyCompanyAction(formData:FormData){
 await requireAdmin();const companyId=String(formData.get('company_id')||'');const verified=String(formData.get('verified')||'false')==='true';const admin=createAdminClient();await admin.from('companies').update({verified:!verified}).eq('id',companyId);revalidatePath('/admin/empresas');revalidatePath('/vagas')
}

// Cancela manualmente uma assinatura recorrente (além do cancelamento automático via webhook).
export async function adminCancelSubscriptionAction(formData:FormData){
 await requireAdmin();const admin=createAdminClient();const preapprovalId=String(formData.get('preapproval_id')||'');if(!preapprovalId)return
 const token=process.env.MERCADO_PAGO_ACCESS_TOKEN
 if(token){
  await fetch(`https://api.mercadopago.com/preapproval/${encodeURIComponent(preapprovalId)}`,{method:'PUT',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({status:'cancelled'})}).catch(()=>null)
 }
 const {data:sub}=await admin.from('subscriptions').select('user_id,course_id').eq('preapproval_id',preapprovalId).maybeSingle()
 await admin.from('subscriptions').update({status:'cancelled',updated_at:new Date().toISOString()}).eq('preapproval_id',preapprovalId)
 if(sub) await admin.from('enrollments').update({status:'expired'}).eq('user_id',sub.user_id).eq('course_id',sub.course_id)
 revalidatePath('/admin/matriculas')
}

export async function adminCreateLabTemplateAction(formData:FormData){
 await requireAdmin();const admin=createAdminClient();const providerLabId=String(formData.get('provider_lab_id')||'').trim();const title=String(formData.get('title')||'').trim();const provider=String(formData.get('provider')||'gcp_vm');if(!providerLabId||!title||!['gcp_vm','local_docker'].includes(provider))redirect('/admin/range?erro='+encodeURIComponent('Template inválido.'))
 const payload={provider_lab_id:providerLabId,title,provider,image_ref:String(formData.get('image_ref')||'').trim()||null,machine_type:String(formData.get('machine_type')||'').trim()||null,cpu:Number(formData.get('cpu')||0)||null,memory_mb:Number(formData.get('memory_mb')||0)||null,disk_gb:Number(formData.get('disk_gb')||0)||null,default_ttl_minutes:Math.max(15,Number(formData.get('default_ttl_minutes')||60)),estimated_cost_cents_per_hour:Math.max(0,Number(formData.get('estimated_cost_cents_per_hour')||0)),published:true,updated_at:new Date().toISOString()}
 const {error}=await admin.from('lab_templates').upsert(payload,{onConflict:'provider_lab_id'});if(error)redirect('/admin/range?erro='+encodeURIComponent(error.message));revalidatePath('/admin/range');redirect('/admin/range?template=1')
}

export async function adminUpdateRangePlanAction(formData:FormData){
 await requireAdmin();const admin=createAdminClient();const code=String(formData.get('code')||'');if(!['free','pro','admin'].includes(code))redirect('/admin/range?erro=plano');const payload={code,max_concurrent_sessions:Math.max(0,Number(formData.get('max_concurrent_sessions')||1)),max_ttl_minutes:Math.max(15,Number(formData.get('max_ttl_minutes')||60)),monthly_minutes:Math.max(0,Number(formData.get('monthly_minutes')||0)),updated_at:new Date().toISOString()};const {error}=await admin.from('range_plan_limits').upsert(payload,{onConflict:'code'});if(error)redirect('/admin/range?erro='+encodeURIComponent(error.message));revalidatePath('/admin/range');redirect('/admin/range?plano=1')
}

export async function adminUpdateCtfSecurityAction(formData:FormData){
 await requireAdmin();const admin=createAdminClient();const eventId=String(formData.get('event_id')||'').trim();if(!eventId)redirect('/admin/range?erro=ctf');const freezeRaw=String(formData.get('freeze_at')||'').trim();const attempts=Math.min(120,Math.max(3,Number(formData.get('max_attempts_per_minute')||10)));let freezeAt:string|null=null;if(freezeRaw){const d=new Date(freezeRaw);if(!Number.isFinite(d.getTime()))redirect('/admin/range?erro='+encodeURIComponent('Data de freeze inválida.'));freezeAt=d.toISOString()}
 const {error}=await admin.from('ctf_events').update({freeze_at:freezeAt,max_attempts_per_minute:attempts}).eq('id',eventId);if(error)redirect('/admin/range?erro='+encodeURIComponent(error.message));revalidatePath('/admin/range');revalidatePath('/admin/ctf');revalidatePath(`/painel/ctf/${eventId}`);redirect('/admin/range?ctf=1')
}

export async function adminMapChallengeSkillAction(formData:FormData){
 await requireAdmin();const admin=createAdminClient();const challengeId=String(formData.get('challenge_id')||'');const skillCode=String(formData.get('skill_code')||'');const weight=Math.min(10,Math.max(1,Number(formData.get('weight')||1)));if(!challengeId||!skillCode)redirect('/admin/range?erro=skill');const {error}=await admin.from('challenge_skills').upsert({challenge_id:challengeId,skill_code:skillCode,weight},{onConflict:'challenge_id,skill_code'});if(error)redirect('/admin/range?erro='+encodeURIComponent(error.message));revalidatePath('/admin/range');redirect('/admin/range?skill=1')
}

export async function adminStopRangeSessionAction(formData:FormData){
 await requireAdmin();const admin=createAdminClient();const sessionId=String(formData.get('session_id')||'').trim();if(!sessionId)redirect('/admin/range?erro=sessao');const {data:session}=await admin.from('lab_sessions').select('id,user_id,lab_id,challenge_id,ctf_event_id,provider_session_id,provider_base_url').eq('id',sessionId).maybeSingle();if(!session)redirect('/admin/range?erro=sessao');if(session.provider_session_id)await destroyRangeSession(String(session.provider_session_id),session.provider_base_url?String(session.provider_base_url):null);await admin.from('lab_sessions').update({status:'revoked',stopped_at:new Date().toISOString(),ended_reason:'admin'}).eq('id',sessionId).eq('status','running');await auditRange(admin,{eventType:'session_revoked_by_admin',userId:session.user_id,labId:session.lab_id,challengeId:session.challenge_id,eventId:session.ctf_event_id,providerSessionId:session.provider_session_id,details:{reason:'admin'}});revalidatePath('/admin/range');redirect('/admin/range?encerrada=1')
}
