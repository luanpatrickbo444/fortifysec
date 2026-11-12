import { isAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
export async function GET(){if(!await isAdmin())return Response.json({error:'Não autorizado'},{status:401});const {data,error}=await supabaseAdmin().from('companies').select('id,name,slug,active,verified,created_at').order('created_at',{ascending:false});return error?Response.json({error:'Erro ao listar'},{status:500}):Response.json({items:data});}
export async function POST(req:Request){if(!await isAdmin())return Response.json({error:'Não autorizado'},{status:401});const b=await req.json().catch(()=>({}));const name=String(b.name||'').trim(),slug=String(b.slug||'').trim().toLowerCase();if(name.length<2||name.length>120||!/^[a-z0-9-]{3,80}$/.test(slug))return Response.json({error:'Nome ou slug inválido'},{status:400});
 // Existing schema requires created_by -> profiles.id. Admin must be a real Supabase admin profile.
 const adminId=process.env.FORTIFYSEC_ADMIN_USER_ID;
 if(!adminId)return Response.json({error:'Configure FORTIFYSEC_ADMIN_USER_ID com o UUID do administrador Supabase'},{status:503});
 const {data,error}=await supabaseAdmin().from('companies').insert({name,slug,created_by:adminId,active:true,verified:false}).select().single();return error?Response.json({error:'Não foi possível criar empresa'},{status:500}):Response.json({item:data},{status:201});}
