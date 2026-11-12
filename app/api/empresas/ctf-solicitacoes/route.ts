import {companyContext,errorResponse} from '@/lib/empresas-auth';
export async function GET(){const c=await companyContext();if(!c)return errorResponse('Não autorizado',401);const {data,error}=await c.admin.from('fs_company_ctf_requests').select('id,title,description,status,created_at').eq('company_id',c.company.id).order('created_at',{ascending:false});return error?errorResponse('Falha ao consultar solicitações',500):Response.json({items:data||[]});}
export async function POST(req:Request){const c=await companyContext();if(!c)return errorResponse('Não autorizado',401);const body=await req.json().catch(()=>({}));const title=typeof body.title==='string'?body.title.trim():'';const description=typeof body.description==='string'?body.description.trim():'';
 if(title.length<5||title.length>120||description.length<15||description.length>2000)return errorResponse('Informe título (5–120) e descrição (15–2000 caracteres)');
 const {data:selections,error:selectionError}=await c.admin.from('fs_company_selections').select('arena_talent_id').eq('company_id',c.company.id);
 if(selectionError)return errorResponse('Falha ao verificar candidatos',500);
 if(!selections?.length)return errorResponse('Selecione pelo menos um talento antes de solicitar o CTF');
 const {error}=await c.admin.from('fs_company_ctf_requests').insert({company_id:c.company.id,requested_by:c.user.id,title,description,selected_talent_ids:selections.map(x=>x.arena_talent_id),status:'requested'});
 return error?errorResponse('Falha ao solicitar CTF',500):Response.json({ok:true},{status:201});}
