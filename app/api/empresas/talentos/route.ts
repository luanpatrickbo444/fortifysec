import {companyContext,errorResponse} from '@/lib/empresas-auth';
import {arenaTalents} from '@/lib/empresas-arena';
export async function GET(req:Request){
 const c=await companyContext();if(!c)return errorResponse('Não autorizado',401);
 try{const result=await arenaTalents();const q=(new URL(req.url).searchParams.get('q')||'').toLocaleLowerCase('pt-BR').slice(0,80);return Response.json({...result,items:result.items.filter(t=>(t.name+' '+(t.headline||'')).toLocaleLowerCase('pt-BR').includes(q))});}
 catch{return errorResponse('Não foi possível consultar a Arena',502)}
}
