import {companyContext,errorResponse} from '@/lib/empresas-auth';
import {arenaTalents} from '@/lib/empresas-arena';
export async function GET(){const c=await companyContext();if(!c)return errorResponse('Não autorizado',401);const {data,error}=await c.admin.from('fs_company_selections').select('id,arena_talent_id,talent_name,created_at').eq('company_id',c.company.id).order('created_at',{ascending:false});return error?errorResponse('Falha ao listar selecionados',500):Response.json({items:data||[]});}
export async function POST(req:Request){const c=await companyContext();if(!c)return errorResponse('Não autorizado',401);const {talent_id}=await req.json().catch(()=>({}));if(typeof talent_id!=='string'||talent_id.length>128)return errorResponse('Identificador inválido');
 let talent;try{talent=(await arenaTalents()).items.find(t=>t.id===talent_id)}catch{return errorResponse('Arena indisponível',502)}
 if(!talent)return errorResponse('Talento não disponível para recrutamento',404);
 const {error}=await c.admin.from('fs_company_selections').upsert({company_id:c.company.id,arena_talent_id:talent.id,talent_name:talent.name},{onConflict:'company_id,arena_talent_id'});
 return error?errorResponse('Falha ao selecionar',500):Response.json({ok:true});}
