import { isAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
export async function POST(req:Request){if(!await isAdmin())return Response.json({error:'Não autorizado'},{status:401});const b=await req.json().catch(()=>({}));
 if(typeof b.email!=='string'||!/^\S+@\S+\.\S+$/.test(b.email)||typeof b.password!=='string'||b.password.length<12||typeof b.company_id!=='string')return Response.json({error:'Dados inválidos; senha mínima de 12 caracteres'},{status:400});
 const admin=supabaseAdmin();const {data:company}=await admin.from('companies').select('id').eq('id',b.company_id).maybeSingle();if(!company)return Response.json({error:'Empresa não encontrada'},{status:404});
 const {data:created,error:createError}=await admin.auth.admin.createUser({email:b.email,password:b.password,email_confirm:true});if(createError||!created.user)return Response.json({error:'Não foi possível criar usuário; e-mail pode estar em uso'},{status:409});
 const {error:memberError}=await admin.from('company_members').insert({company_id:company.id,user_id:created.user.id,member_role:'recruiter'});
 if(memberError){await admin.auth.admin.deleteUser(created.user.id);return Response.json({error:'Falha ao vincular recrutador; conta revertida'},{status:500});}
 return Response.json({ok:true,user_id:created.user.id},{status:201});}
