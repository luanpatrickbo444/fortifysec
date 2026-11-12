import 'server-only';
import { cookies } from 'next/headers';
import { empresasAdmin } from '@/lib/empresas-supabase';
export async function companyContext(){
 const token=(await cookies()).get('fs_company_access')?.value;
 if(!token)return null;
 const admin=empresasAdmin();
 const {data,error}=await admin.auth.getUser(token);
 if(error||!data.user)return null;
 const {data:accounts,error:dbError}=await admin.from('fs_company_accounts').select('company_id,fs_companies(id,name,active)').eq('user_id',data.user.id);
 if(dbError)return null;
 const a=(accounts||[]).find((v)=>{const c=Array.isArray(v.fs_companies)?v.fs_companies[0]:v.fs_companies;return c?.active===true});
 if(!a)return null;
 const c=Array.isArray(a.fs_companies)?a.fs_companies[0]:a.fs_companies;
 return {user:data.user,company:{id:c.id as string,name:c.name as string},admin};
}
export function errorResponse(message:string,status=400){return Response.json({error:message},{status});}
