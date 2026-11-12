import { companyContext,errorResponse } from '@/lib/empresas-auth';
export async function GET(_req:Request,{params}:{params:Promise<{id:string}>}){
 const ctx=await companyContext();if(!ctx)return errorResponse('Não autorizado',401);
 const {id}=await params;if(!/^[0-9a-f-]{36}$/i.test(id))return errorResponse('ID inválido');
 const {data,error}=await ctx.admin.from('profiles').select('id,name,headline,xp,github_url,linkedin_url,open_to_work').eq('id',id).eq('role','student').eq('blocked',false).eq('profile_public',true).eq('open_to_work',true).maybeSingle();
 if(error||!data)return errorResponse('Talento indisponível',404);
 return Response.json({item:data});
}
