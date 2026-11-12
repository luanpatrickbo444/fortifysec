import { companyContext } from '@/lib/empresas-auth';
export async function GET(){const ctx=await companyContext();return ctx?Response.json({company:ctx.company,email:ctx.user.email,role:'owner'}):Response.json({error:'Não autorizado'},{status:401});}
