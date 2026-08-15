'use server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdmin, requireUser } from '@/lib/auth'
import { ensureApplicationProfile } from '@/lib/profile-sync'

function asBool(v:FormDataEntryValue|null){return String(v||'false')==='true'}
function safeExternalUrl(value:string){try{const u=new URL(value);return u.protocol==='https:'||u.protocol==='http:'?u.toString():null}catch{return null}}
function safeAdminReturn(value:FormDataEntryValue|null,fallback='/admin'){const v=String(value||'');return v.startsWith('/admin/')||v==='/admin'?v:fallback}

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

    // Se a sincronização server-side estiver indisponível, ainda tentamos a leitura do próprio perfil.
    let profile = synced
    if (!profile) {
      const own = await supabase
        .from('profiles')
        .select('role,blocked')
        .eq('id', data.user.id)
        .maybeSingle()
      profile = own.data
    }

    if (profile?.blocked) {
      await supabase.auth.signOut()
      redirect('/login?erro=' + encodeURIComponent('Esta conta está temporariamente indisponível.'))
    }

    redirect(String(profile?.role) === 'admin' ? '/admin' : '/dashboard')
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
    redirect('/admin/login?erro=' + encodeURIComponent('Credenciais inválidas.'))
  }

  const profile = await ensureApplicationProfile(data.user)
  if (!profile) {
    await supabase.auth.signOut()
    redirect('/admin/login?erro=' + encodeURIComponent('Perfil administrativo não está sincronizado. Execute o patch de usuários no Supabase.'))
  }
  if (profile.blocked) {
    await supabase.auth.signOut()
    redirect('/admin/login?erro=' + encodeURIComponent('Esta conta está temporariamente indisponível.'))
  }
  if (String(profile.role) !== 'admin') {
    await supabase.auth.signOut()
    redirect('/admin/login?erro=' + encodeURIComponent('Esta conta existe, mas ainda não possui role admin.'))
  }

  redirect('/admin')
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
export async function updatePasswordAction(formData: FormData) {const password=String(formData.get('password')||'');if(password.length<8) redirect('/atualizar-senha?erro=Senha%20muito%20curta');const supabase=await createClient();const {error}=await supabase.auth.updateUser({password});if(error) redirect('/atualizar-senha?erro='+encodeURIComponent(error.message));redirect('/dashboard')}

export async function updateProfileAction(formData:FormData){
 const {supabase,user}=await requireUser(); const name=String(formData.get('name')||'').trim(); if(name.length<2)redirect('/painel/perfil?erro=nome')
 const payload={name,headline:String(formData.get('headline')||'').trim(),github_url:safeExternalUrl(String(formData.get('github_url')||'').trim()),linkedin_url:safeExternalUrl(String(formData.get('linkedin_url')||'').trim()),profile_public:asBool(formData.get('profile_public')),open_to_work:asBool(formData.get('open_to_work'))}
 const {error}=await supabase.from('profiles').update(payload).eq('id',user.id);if(error)redirect('/painel/perfil?erro=salvar'); revalidatePath('/painel/perfil'); revalidatePath('/talentos');redirect('/painel/perfil?salvo=1')
}


export async function startLabAction(formData:FormData){
 const {user}=await requireUser(); const labId=String(formData.get('lab_id')||''); const slug=String(formData.get('slug')||'')
 const admin=createAdminClient(); const now=new Date().toISOString(); await admin.from('lab_sessions').update({status:'expired',stopped_at:now}).eq('user_id',user.id).eq('lab_id',labId).eq('status','running').lt('expires_at',now); const [{data:access},{data:lab},{data:running}]=await Promise.all([
  admin.from('enrollments').select('id').eq('user_id',user.id).eq('status','active').limit(1).maybeSingle(),
  admin.from('labs').select('id,connection_url,provider_lab_id,estimated_minutes,published').eq('id',labId).eq('published',true).maybeSingle(),
  admin.from('lab_sessions').select('id').eq('user_id',user.id).eq('lab_id',labId).eq('status','running').maybeSingle()
 ])
 if(!access||!lab)redirect('/painel/labs')
 if(!running){let connectionUrl=lab.connection_url;let providerSessionId:string|null=null;let expires=new Date(Date.now()+Math.max(15,lab.estimated_minutes||60)*60_000).toISOString();const provider=process.env.LAB_PROVIDER_API_URL;if(provider){const res=await fetch(`${provider.replace(/\/$/,'')}/sessions`,{method:'POST',headers:{'Content-Type':'application/json',...(process.env.LAB_PROVIDER_API_KEY?{Authorization:`Bearer ${process.env.LAB_PROVIDER_API_KEY}`}:{})},body:JSON.stringify({user_id:user.id,lab_id:lab.provider_lab_id||lab.id,ttl_minutes:lab.estimated_minutes||60}),cache:'no-store'});if(!res.ok)redirect(`/painel/labs/${slug}?erro=provider`);const data=await res.json();connectionUrl=String(data.connection_url||connectionUrl||'');providerSessionId=data.session_id?String(data.session_id):null;if(data.expires_at)expires=String(data.expires_at)}await admin.from('lab_sessions').insert({user_id:user.id,lab_id:labId,status:'running',connection_url:connectionUrl,provider_session_id:providerSessionId,expires_at:expires})}
 revalidatePath(`/painel/labs/${slug}`);redirect(`/painel/labs/${slug}`)
}
export async function stopLabAction(formData:FormData){
 const {user}=await requireUser();const labId=String(formData.get('lab_id')||'');const slug=String(formData.get('slug')||'');const admin=createAdminClient();
 const {data:session}=await admin.from('lab_sessions').select('id,provider_session_id').eq('user_id',user.id).eq('lab_id',labId).eq('status','running').maybeSingle();
 if(session?.provider_session_id&&process.env.LAB_PROVIDER_API_URL){await fetch(`${process.env.LAB_PROVIDER_API_URL.replace(/\/$/,'')}/sessions/${encodeURIComponent(session.provider_session_id)}`,{method:'DELETE',headers:process.env.LAB_PROVIDER_API_KEY?{Authorization:`Bearer ${process.env.LAB_PROVIDER_API_KEY}`}:{},cache:'no-store'}).catch(()=>null)}
 await admin.from('lab_sessions').update({status:'stopped',stopped_at:new Date().toISOString()}).eq('user_id',user.id).eq('lab_id',labId).eq('status','running');
 revalidatePath('/painel/labs');if(slug){revalidatePath(`/painel/labs/${slug}`);redirect(`/painel/labs/${slug}`)}
}


export async function submitChallengeAction(formData:FormData){const {supabase}=await requireUser();const challengeId=String(formData.get('challenge_id')||'');const slug=String(formData.get('slug')||'');const flag=String(formData.get('flag')||'').trim();if(!challengeId||!flag)redirect(`/painel/desafios/${slug}?result=invalid`);const {data,error}=await supabase.rpc('submit_challenge_flag',{challenge_uuid:challengeId,candidate_flag:flag});if(error||!data)redirect(`/painel/desafios/${slug}?result=invalid`);revalidatePath('/dashboard');revalidatePath('/painel/ranking');redirect(`/painel/desafios/${slug}?result=solved`)}

export async function adminSetEnrollmentAction(formData:FormData){await requireAdmin();const userId=String(formData.get('user_id')||'');const courseId=String(formData.get('course_id')||'');const status=String(formData.get('status')||'active');if(!userId||!courseId||!['active','pending','blocked','expired'].includes(status))return;const admin=createAdminClient();await admin.from('enrollments').upsert({user_id:userId,course_id:courseId,status,source:'admin',activated_at:status==='active'?new Date().toISOString():null},{onConflict:'user_id,course_id'});revalidatePath('/admin/matriculas');revalidatePath('/painel/cursos')}
export async function adminCreateCourseAction(formData:FormData){await requireAdmin();const admin=createAdminClient();const title=String(formData.get('title')||'').trim();const slug=String(formData.get('slug')||'').trim().toLowerCase().replace(/[^a-z0-9-]/g,'-');const description=String(formData.get('description')||'').trim();const price=Number(formData.get('price')||0);if(!title||!slug)return;await admin.from('courses').insert({title,slug,description,price_cents:Math.round(price*100),published:true});revalidatePath('/admin/cursos');revalidatePath('/painel/cursos')}
export async function adminToggleUserAction(formData:FormData){const {user}=await requireAdmin();const userId=String(formData.get('user_id')||'');if(userId===user.id)return;const blocked=String(formData.get('blocked')||'false')==='true';const admin=createAdminClient();await admin.from('profiles').update({blocked:!blocked}).eq('id',userId);if(!blocked)await admin.from('lab_sessions').update({status:'revoked',stopped_at:new Date().toISOString()}).eq('user_id',userId).eq('status','running');revalidatePath('/admin/usuarios')}
export async function adminCreateLabAction(formData:FormData){await requireAdmin();const admin=createAdminClient();const title=String(formData.get('title')||'').trim();const slug=String(formData.get('slug')||'').trim().toLowerCase().replace(/[^a-z0-9-]/g,'-');if(!title||!slug)return;await admin.from('labs').insert({title,slug,description:String(formData.get('description')||''),difficulty:String(formData.get('difficulty')||'Easy'),estimated_minutes:Number(formData.get('estimated_minutes')||60),connection_url:String(formData.get('connection_url')||'')||null,provider_lab_id:String(formData.get('provider_lab_id')||'')||null,instructions:String(formData.get('instructions')||''),tags:String(formData.get('tags')||'').split(',').map(s=>s.trim()).filter(Boolean),published:true});revalidatePath('/admin/labs');revalidatePath('/painel/labs')}
export async function adminCreateChallengeAction(formData:FormData){await requireAdmin();const admin=createAdminClient();const title=String(formData.get('title')||'').trim();const slug=String(formData.get('slug')||'').trim().toLowerCase().replace(/[^a-z0-9-]/g,'-');const flag=String(formData.get('flag')||'').trim();if(!title||!slug||!flag)return;await admin.rpc('admin_create_challenge',{p_title:title,p_slug:slug,p_description:String(formData.get('description')||''),p_category:String(formData.get('category')||'Web'),p_difficulty:String(formData.get('difficulty')||'Easy'),p_xp_reward:Number(formData.get('xp_reward')||50),p_briefing:String(formData.get('briefing')||''),p_flag:flag});revalidatePath('/admin/desafios');revalidatePath('/painel/desafios')}

export async function adminCreateCtfAction(formData:FormData){await requireAdmin();const admin=createAdminClient();const title=String(formData.get('title')||'').trim();const starts=String(formData.get('starts_at')||'');const ends=String(formData.get('ends_at')||'');if(!title||!starts||!ends)return;await admin.from('ctf_events').insert({title,description:String(formData.get('description')||''),starts_at:new Date(starts).toISOString(),ends_at:new Date(ends).toISOString(),prize_text:String(formData.get('prize_text')||''),status:String(formData.get('status')||'scheduled')});revalidatePath('/admin/ctf');revalidatePath('/painel/ctf')}

export async function adminCreateLessonAction(formData:FormData){
 await requireAdmin();const admin=createAdminClient();const courseId=String(formData.get('course_id')||'');const moduleId=String(formData.get('module_id')||'')||null;const title=String(formData.get('title')||'').trim();const position=Number(formData.get('position')||1);const returnTo=safeAdminReturn(formData.get('return_to'),'/admin/aulas');if(!courseId||!title||position<1)redirect(`${returnTo}?erro=dados`);
 if(moduleId){const {data:module}=await admin.from('course_modules').select('id').eq('id',moduleId).eq('course_id',courseId).maybeSingle();if(!module)redirect(`${returnTo}?erro=modulo`)}
 const {error}=await admin.from('lessons').insert({course_id:courseId,module_id:moduleId,title,summary:String(formData.get('summary')||'').trim(),content:String(formData.get('content')||''),video_url:safeExternalUrl(String(formData.get('video_url')||'').trim()),position,xp_reward:Math.max(0,Number(formData.get('xp_reward')||10)),published:asBool(formData.get('published'))});if(error)redirect(`${returnTo}?erro=salvar`);revalidatePath('/admin/aulas');revalidatePath(returnTo);revalidatePath('/painel/cursos');redirect(`${returnTo}?criada=1`)
}

export async function adminToggleCourseAction(formData:FormData){await requireAdmin();const admin=createAdminClient();const courseId=String(formData.get('course_id')||'');const published=String(formData.get('published')||'false')==='true';await admin.from('courses').update({published:!published}).eq('id',courseId);revalidatePath('/admin/cursos');revalidatePath('/painel/cursos')}
export async function adminSetUserRoleAction(formData:FormData){const {user}=await requireAdmin();const target=String(formData.get('user_id')||'');const role=String(formData.get('role')||'student');if(!target||target===user.id||!['student','admin'].includes(role))return;const admin=createAdminClient();await admin.from('profiles').update({role}).eq('id',target);revalidatePath('/admin/usuarios')}


export async function adminCreateModuleAction(formData:FormData){
 await requireAdmin();const admin=createAdminClient();const courseId=String(formData.get('course_id')||'');const title=String(formData.get('title')||'').trim();const position=Number(formData.get('position')||1);const returnTo=safeAdminReturn(formData.get('return_to'),'/admin/cursos');if(!courseId||!title||position<1)redirect(`${returnTo}?erro=modulo`);const {error}=await admin.from('course_modules').insert({course_id:courseId,title,description:String(formData.get('description')||'').trim(),position,published:true});if(error)redirect(`${returnTo}?erro=modulo`);revalidatePath(returnTo);redirect(`${returnTo}?modulo=1`)
}

export async function adminUpdateCourseAction(formData:FormData){
 await requireAdmin();const admin=createAdminClient();const courseId=String(formData.get('course_id')||'');const title=String(formData.get('title')||'').trim();const slug=String(formData.get('slug')||'').trim().toLowerCase().replace(/[^a-z0-9-]/g,'-');const price=Math.max(0,Number(formData.get('price')||0));if(!courseId||!title||!slug)return;await admin.from('courses').update({title,slug,description:String(formData.get('description')||'').trim(),price_cents:Math.round(price*100),published:asBool(formData.get('published')),updated_at:new Date().toISOString()}).eq('id',courseId);revalidatePath('/admin/cursos');revalidatePath(`/admin/cursos/${courseId}`);revalidatePath('/painel/cursos')
}

export async function adminToggleModuleAction(formData:FormData){
 await requireAdmin();const admin=createAdminClient();const id=String(formData.get('module_id')||'');const published=asBool(formData.get('published'));const returnTo=safeAdminReturn(formData.get('return_to'),'/admin/cursos');if(!id)return;await admin.from('course_modules').update({published:!published,updated_at:new Date().toISOString()}).eq('id',id);revalidatePath(returnTo)
}

export async function adminToggleLessonAction(formData:FormData){
 await requireAdmin();const admin=createAdminClient();const id=String(formData.get('lesson_id')||'');const published=asBool(formData.get('published'));const returnTo=safeAdminReturn(formData.get('return_to'),'/admin/aulas');if(!id)return;await admin.from('lessons').update({published:!published}).eq('id',id);revalidatePath('/admin/aulas');revalidatePath(returnTo);revalidatePath('/painel/cursos')
}

export async function adminDeleteLessonAction(formData:FormData){
 await requireAdmin();const admin=createAdminClient();const id=String(formData.get('lesson_id')||'');const returnTo=safeAdminReturn(formData.get('return_to'),'/admin/aulas');if(!id)return;await admin.from('lessons').delete().eq('id',id);revalidatePath('/admin/aulas');revalidatePath(returnTo);revalidatePath('/painel/cursos')
}

export async function adminToggleLabPublishedAction(formData:FormData){
 await requireAdmin();const admin=createAdminClient();const id=String(formData.get('lab_id')||'');const published=asBool(formData.get('published'));if(!id)return;await admin.from('labs').update({published:!published,updated_at:new Date().toISOString()}).eq('id',id);revalidatePath('/admin/labs');revalidatePath('/painel/labs')
}

export async function adminToggleChallengePublishedAction(formData:FormData){
 await requireAdmin();const admin=createAdminClient();const id=String(formData.get('challenge_id')||'');const published=asBool(formData.get('published'));if(!id)return;await admin.from('challenges').update({published:!published,updated_at:new Date().toISOString()}).eq('id',id);revalidatePath('/admin/desafios');revalidatePath('/painel/desafios')
}

export async function adminUpdateCtfStatusAction(formData:FormData){
 await requireAdmin();const admin=createAdminClient();const id=String(formData.get('event_id')||'');const status=String(formData.get('status')||'scheduled');if(!id||!['scheduled','live','finished'].includes(status))return;await admin.from('ctf_events').update({status}).eq('id',id);revalidatePath('/admin/ctf');revalidatePath('/painel/ctf')
}

export async function adminLinkChallengeToCtfAction(formData:FormData){
 await requireAdmin();const admin=createAdminClient();const eventId=String(formData.get('event_id')||'');const challengeId=String(formData.get('challenge_id')||'');const position=Math.max(1,Number(formData.get('position')||1));if(!eventId||!challengeId)return;await admin.from('ctf_event_challenges').upsert({event_id:eventId,challenge_id:challengeId,position},{onConflict:'event_id,challenge_id'});revalidatePath('/admin/ctf');revalidatePath('/painel/ctf')
}

export async function adminUnlinkChallengeFromCtfAction(formData:FormData){
 await requireAdmin();const admin=createAdminClient();const eventId=String(formData.get('event_id')||'');const challengeId=String(formData.get('challenge_id')||'');if(!eventId||!challengeId)return;await admin.from('ctf_event_challenges').delete().eq('event_id',eventId).eq('challenge_id',challengeId);revalidatePath('/admin/ctf');revalidatePath('/painel/ctf')
}

export async function adminUpdateSiteSettingsAction(formData:FormData){
 await requireAdmin();const admin=createAdminClient();const payload={announcement:String(formData.get('announcement')||'').trim().slice(0,180),support_email:String(formData.get('support_email')||'').trim().toLowerCase(),academy_cta:String(formData.get('academy_cta')||'').trim().slice(0,60),labs_cta:String(formData.get('labs_cta')||'').trim().slice(0,60),ctf_prize_label:String(formData.get('ctf_prize_label')||'').trim().slice(0,60),maintenance_mode:asBool(formData.get('maintenance_mode'))};await admin.from('site_settings').upsert({key:'platform',value:payload,updated_at:new Date().toISOString()},{onConflict:'key'});revalidatePath('/admin/site');revalidatePath('/');revalidatePath('/academy');revalidatePath('/labs');revalidatePath('/ctf')
}
