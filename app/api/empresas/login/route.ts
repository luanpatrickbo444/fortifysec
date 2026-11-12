import {NextResponse} from 'next/server';
import {empresasAdmin,empresasAuth} from '@/lib/empresas-supabase';

export const runtime='nodejs';
export async function POST(req:Request){
 const {email,password}=await req.json().catch(()=>({}));
 if(typeof email!=='string'||typeof password!=='string'||email.length>254||password.length>1024)return NextResponse.json({error:'Credenciais inválidas'},{status:400});
 const url=process.env.FS_EMPRESAS_SUPABASE_URL,key=process.env.FS_EMPRESAS_SUPABASE_ANON_KEY;
 if(!url||!key)return NextResponse.json({error:'Supabase não configurado'},{status:503});
 const auth=empresasAuth();
 const {data,error}=await auth.auth.signInWithPassword({email,password});
 if(error||!data.user||!data.session)return NextResponse.json({error:'E-mail ou senha inválidos'},{status:401});
 const admin=empresasAdmin();
 const {data:accounts,error:dbError}=await admin.from('fs_company_accounts').select('company_id,fs_companies(active)').eq('user_id',data.user.id);
 if(dbError)return NextResponse.json({error:'Estrutura empresarial não instalada'},{status:503});
 const allowed=(accounts||[]).some((a)=>{const c=Array.isArray(a.fs_companies)?a.fs_companies[0]:a.fs_companies;return c?.active===true});
 if(!allowed)return NextResponse.json({error:'Empresa não autorizada'},{status:403});
 const res=NextResponse.json({ok:true});res.cookies.set('fs_company_access',data.session.access_token,{httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',path:'/',maxAge:Math.min(data.session.expires_in,3600)});return res;
}
