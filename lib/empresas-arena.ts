import 'server-only';
export type Talent={id:string;name:string;headline:string|null;xp:number|null};
export async function arenaTalents():Promise<{configured:boolean;items:Talent[]}>{
 const endpoint=process.env.FORTIFYSEC_ARENA_TALENTS_URL;
 const key=process.env.FORTIFYSEC_ARENA_READ_TOKEN;
 if(!endpoint||!key)return {configured:false,items:[]};
 const parsed=new URL(endpoint);
 if(parsed.protocol!=='https:' && !(parsed.hostname==='127.0.0.1'&&parsed.protocol==='http:'))throw Error('Endpoint Arena inseguro');
 const r=await fetch(endpoint,{headers:{Authorization:`Bearer ${key}`},cache:'no-store',signal:AbortSignal.timeout(8000)});
 if(!r.ok)throw Error('Arena indisponível');
 const payload=await r.json();
 if(!Array.isArray(payload.items))throw Error('Resposta Arena inválida');

 const valid = (x: unknown): x is {
   id: string;
   name: string;
   headline?: string | null;
   xp?: number | null;
   recruitment_opt_in: true;
 } => {
   if (typeof x !== 'object' || x === null) return false;
   const v = x as Record<string, unknown>;
   return typeof v.id === 'string'
     && typeof v.name === 'string'
     && v.recruitment_opt_in === true;
 };

 const items: Talent[] = (payload.items as unknown[])
   .filter(valid)
   .slice(0, 100)
   .map(x => ({
     id: x.id,
     name: x.name,
     headline: typeof x.headline === 'string' ? x.headline : null,
     xp: typeof x.xp === 'number' && Number.isFinite(x.xp)
       ? x.xp
       : null
   }));

 return {configured:true,items};
}
