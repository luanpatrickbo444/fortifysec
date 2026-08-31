import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/auth'
import { demoAssets, demoBackups, demoOrg, demoRecovery, demoReports } from '@/lib/demo-data'
import { resolvePortalOrganization } from '@/lib/portal-org'
import { FORTIFY_TIME_ZONE, formatDatePtBr, formatDateTimePtBr, localDateKey, localWeekday } from '@/lib/datetime'

type OrgContext = { id: string; name: string; plan: string; status: string; provider: string | null }

type BackupAutomation = {
  tone: 'green' | 'cyan' | 'warning'
  label: string
  message: string
  timezone: string
  weekday: string
  todayHasBackup: boolean
  lastBackup: string
  lastBackupAt: string | null
  nextBackup: string
  nextBackupAt: string | null
  lastSync: string
}

async function getOrg(): Promise<{ demo: boolean; org: OrgContext | null }> {
  const user = await requireUser()
  if (user.demo) return { demo: true, org: null }
  const supabase = await createClient()
  const portal = await resolvePortalOrganization(supabase!, user.id)
  return { demo: false, org: portal.org }
}


async function readOrganizationTelemetry(supabase:any, organizationId:string){
  const full=await supabase.from('cloud_organizations')
    .select('provider,provider_storage_bytes,provider_immutable_storage_bytes,provider_usage_synced_at,last_provider_sync_at')
    .eq('id',organizationId).maybeSingle()
  if(!full.error) return {data:full.data as any,error:null as string|null,usageSchemaReady:true}
  const legacy=await supabase.from('cloud_organizations')
    .select('provider,last_provider_sync_at')
    .eq('id',organizationId).maybeSingle()
  return {data:legacy.data as any,error:full.error?.message??'telemetry query failed',usageSchemaReady:false}
}

function latestAssetSync(assets:any[]){
  const times=assets.map((a:any)=>a.last_sync_at).filter(Boolean).map((v:string)=>new Date(v)).filter((d:Date)=>Number.isFinite(d.getTime())).sort((a:Date,b:Date)=>b.getTime()-a.getTime())
  return times[0]?.toISOString()??null
}

function formatBytes(bytes: number) {
  if (!bytes) return '0 B'
  const units = ['B','KB','MB','GB','TB','PB']; let v=bytes, i=0
  while(v>=1024 && i<units.length-1){v/=1024;i++}
  return `${v>=10||i<3?v.toFixed(0):v.toFixed(1)} ${units[i]}`
}

function sourceFromJobDetails(details:any) {
  if (!details || typeof details !== 'object') return null
  const values = [
    details?.context?.Persistent?.Name,
    details?.context?.name,
    details?.context?.resource_name,
    details?.context?.target?.name,
    details?.context?.workload?.name,
    details?.context?.machine?.name,
    details?.resourceName,
    details?.resource_name,
    details?.asset_name,
    details?.source_name,
  ]
  return values.find((value) => typeof value === 'string' && value.trim())?.trim() ?? null
}

function normalizeBackupRows(rows:any[], fallbackAssetName?:string|null){
  const mapped=rows.map((j:any)=>({
    source:j.cloud_protected_assets?.name??sourceFromJobDetails(j.details)??fallbackAssetName??'Ativo aguardando identificação',
    target:String(j.provider??'Provider').toLowerCase()==='acronis'?'Acronis Cloud':(j.provider??'Provider'),
    last:j.finished_at?formatDateTimePtBr(j.finished_at):'Pendente',
    status:j.status==='success'?'Protegido':j.status==='running'?'Executando':'Atenção',
    retention:j.retention_label??'Conforme política',
    finishedAt:j.finished_at??null,
    assetId:j.asset_id??null,
    externalId:j.external_job_id??j.id,
  }))
  const seen=new Set<string>()
  return mapped.filter((row:any)=>{
    const ts=row.finishedAt?new Date(row.finishedAt).getTime():0
    const bucket=ts?Math.floor(ts/60000):0
    const key=`${row.assetId??row.source}|${bucket}|${row.status}`
    if(seen.has(key))return false
    seen.add(key);return true
  })
}

function backupAutomationStatus(input:{rows:any[];assets:any[];lastSync?:string|null}): BackupAutomation{
  const now=new Date()
  const today=localDateKey(now)
  const successful=input.rows.filter((row:any)=>row.status==='Protegido'&&row.finishedAt)
  const todayHasBackup=successful.some((row:any)=>localDateKey(row.finishedAt)===today)
  const lastRow=successful[0]??input.rows.find((row:any)=>row.finishedAt)??null
  const nextCandidates=input.assets
    .map((asset:any)=>asset.next_backup_at)
    .filter(Boolean)
    .map((value:string)=>new Date(value))
    .filter((date:Date)=>Number.isFinite(date.getTime()))
    .sort((a:Date,b:Date)=>a.getTime()-b.getTime())
  const next=nextCandidates.find((date:Date)=>date.getTime()>=now.getTime())??nextCandidates[0]??null
  const nextKey=next?localDateKey(next):''
  const hasAssets=input.assets.length>0

  let tone:'green'|'cyan'|'warning'='cyan'
  let label='AGENDAMENTO ACRONIS'
  let message='Aguardando a Acronis informar o próximo horário da política.'
  if(todayHasBackup){tone='green';label='BACKUP EXECUTADO HOJE';message=`Há uma execução protegida registrada hoje (${localWeekday(now)}).`}
  else if(next){
    if(next.getTime()<now.getTime()){
      tone='warning';label='VERIFICAR AGENDAMENTO';message=`O próximo horário informado pela Acronis (${formatDateTimePtBr(next)}) já passou sem uma execução protegida correspondente.`
    }else if(nextKey===today){
      tone='cyan';label='BACKUP PREVISTO HOJE';message=`A próxima execução informada pela Acronis está prevista para ${formatDateTimePtBr(next)}.`
    }else{
      tone='green';label='SEM FALHA DE AGENDAMENTO';message=`Não há execução prevista para hoje. A próxima execução informada pela Acronis é ${formatDateTimePtBr(next)}.`
    }
  }else if(!hasAssets&&input.rows.length){
    tone='warning';label='INVENTÁRIO EM RECONCILIAÇÃO';message='A execução de backup chegou ao Fortify, mas o inventário do workload ainda precisa ser reconciliado com a Acronis.'
  }

  return {
    tone,label,message,
    timezone:FORTIFY_TIME_ZONE,
    weekday:localWeekday(now),
    todayHasBackup,
    lastBackup:lastRow?.last??'Sem execução',
    lastBackupAt:lastRow?.finishedAt??null,
    nextBackup:next?formatDateTimePtBr(next):'Não informado',
    nextBackupAt:next?.toISOString()??null,
    lastSync:input.lastSync?formatDateTimePtBr(input.lastSync):'Aguardando sincronização',
  }
}

export async function getOverviewData(){
  const ctx=await getOrg()
  if(ctx.demo) return {org:{...demoOrg,storage:'1.8 TB',immutable:'620 GB',storageUpdated:'agora'},backups:demoBackups,recovery:demoRecovery,empty:false}
  if(!ctx.org) return {org:null,backups:[],recovery:[],empty:true}
  const supabase=await createClient()
  const [telemetryResult,{data:assets},{data:jobs},{data:recovery},{data:incidents}]=await Promise.all([
    readOrganizationTelemetry(supabase!,ctx.org.id),
    supabase!.from('cloud_protected_assets').select('id,name,protected_bytes,status,provider,next_backup_at,last_backup_at,last_sync_at').eq('organization_id',ctx.org.id),
    supabase!.from('cloud_backup_jobs').select('id,asset_id,status,finished_at,retention_label,provider,external_job_id,details,cloud_protected_assets(name)').eq('organization_id',ctx.org.id).order('finished_at',{ascending:false}).limit(20),
    supabase!.from('cloud_recovery_tests').select('status,completed_at,rto_seconds,cloud_protected_assets(name)').eq('organization_id',ctx.org.id).order('completed_at',{ascending:false}).limit(3),
    supabase!.from('cloud_incidents').select('id,status').eq('organization_id',ctx.org.id),
  ])
  const orgTelemetry=telemetryResult.data
  const assetRows=(assets??[]) as Array<{id?:string;name?:string;protected_bytes?:number|null;status?:string|null;provider?:string|null;next_backup_at?:string|null;last_backup_at?:string|null;last_sync_at?:string|null}>
  const logicalProtected=assetRows.reduce((sum,a)=>sum+Number(a.protected_bytes??0),0)
  const storageRaw=orgTelemetry?.provider_storage_bytes
  const immutableRaw=orgTelemetry?.provider_immutable_storage_bytes
  const storageBytes=storageRaw===null||storageRaw===undefined?null:Number(storageRaw)
  const immutableBytes=immutableRaw===null||immutableRaw===undefined?null:Number(immutableRaw)
  const health=assetRows.length?Math.round(assetRows.filter(a=>a.status==='protected').length/assetRows.length*100):0
  const fallbackName=assetRows.length===1?assetRows[0].name??null:null
  const back=normalizeBackupRows(jobs??[],fallbackName).slice(0,4)
  const rec=(recovery??[]).map((r:any)=>({date:r.completed_at?formatDatePtBr(r.completed_at):'Planejado',asset:r.cloud_protected_assets?.name??'Ativo',type:'Recovery test',result:r.status==='passed'?'Aprovado':r.status==='failed'?'Falhou':'Planejado',rto:r.rto_seconds?`${Math.floor(r.rto_seconds/60)}m`:'—'}))
  const openIncidents=(incidents??[]).filter((row:any)=>!['resolved','closed'].includes(String(row.status??'').toLowerCase())).length
  const effectiveLastSync=orgTelemetry?.last_provider_sync_at??latestAssetSync(assetRows)
  const usageDate=orgTelemetry?.provider_usage_synced_at??effectiveLastSync??null
  const automation=backupAutomationStatus({rows:normalizeBackupRows(jobs??[],fallbackName),assets:assetRows,lastSync:effectiveLastSync})
  return {org:{
    name:ctx.org.name,
    plan:ctx.org.plan,
    health,
    protected:logicalProtected>0?formatBytes(logicalProtected):(assetRows.length?`${assetRows.length} ativo${assetRows.length===1?'':'s'}`:'—'),
    storage:storageBytes===null?'—':formatBytes(storageBytes),
    immutable:immutableBytes===null?'—':formatBytes(immutableBytes),
    storageUpdated:usageDate?formatDateTimePtBr(usageDate):(telemetryResult.usageSchemaReady?'aguardando sincronização':'migration 006 pendente'),
    provider:orgTelemetry?.provider??ctx.org.provider??'Fortify',
    telemetryReady:telemetryResult.usageSchemaReady,
    assets:assetRows.length,
    lastBackup:automation.lastBackup,
    nextBackup:automation.nextBackup,
    lastSync:automation.lastSync,
    recovery:rec[0]?.date??'Sem teste',
    incidents:openIncidents,
  },backups:back,recovery:rec,automation,empty:false}
}

export async function getBackupsData(){
  const ctx=await getOrg();if(ctx.demo)return demoBackups;if(!ctx.org)return[]
  const s=await createClient()
  const [{data:assets},{data:jobs}]=await Promise.all([
    s!.from('cloud_protected_assets').select('name').eq('organization_id',ctx.org.id),
    s!.from('cloud_backup_jobs').select('id,asset_id,status,finished_at,retention_label,provider,external_job_id,details,cloud_protected_assets(name)').eq('organization_id',ctx.org.id).order('finished_at',{ascending:false}).limit(200),
  ])
  const fallbackName=(assets??[]).length===1?(assets?.[0] as any)?.name??null:null
  return normalizeBackupRows(jobs??[],fallbackName)
}

export async function getBackupsPageData(): Promise<{rows:any[];automation:BackupAutomation}>{
  const ctx=await getOrg()
  if(ctx.demo)return {rows:demoBackups,automation:{tone:'green',label:'BACKUP EXECUTADO HOJE',message:'Ambiente demonstrativo.',timezone:FORTIFY_TIME_ZONE,weekday:localWeekday(),todayHasBackup:true,lastBackup:'agora',lastBackupAt:new Date().toISOString(),nextBackup:'Conforme política',nextBackupAt:null,lastSync:'agora'}}
  if(!ctx.org)return {rows:[],automation:{tone:'warning',label:'SEM ORGANIZAÇÃO',message:'Nenhuma organização ativa.',timezone:FORTIFY_TIME_ZONE,weekday:localWeekday(),todayHasBackup:false,lastBackup:'Sem execução',lastBackupAt:null,nextBackup:'Não informado',nextBackupAt:null,lastSync:'Aguardando sincronização'}}
  const s=await createClient()
  const [{data:org},{data:assets},{data:jobs}]=await Promise.all([
    s!.from('cloud_organizations').select('last_provider_sync_at').eq('id',ctx.org.id).maybeSingle(),
    s!.from('cloud_protected_assets').select('id,name,next_backup_at,last_backup_at,last_sync_at,status').eq('organization_id',ctx.org.id),
    s!.from('cloud_backup_jobs').select('id,asset_id,status,finished_at,retention_label,provider,external_job_id,details,cloud_protected_assets(name)').eq('organization_id',ctx.org.id).order('finished_at',{ascending:false}).limit(200),
  ])
  const assetRows=assets??[]
  const fallbackName=assetRows.length===1?(assetRows[0] as any)?.name??null:null
  const rows=normalizeBackupRows(jobs??[],fallbackName)
  return {rows,automation:backupAutomationStatus({rows,assets:assetRows,lastSync:org?.last_provider_sync_at??latestAssetSync(assetRows)})}
}

export async function getAssetsData(){const ctx=await getOrg();if(ctx.demo)return demoAssets;if(!ctx.org)return[];const s=await createClient();let {data,error}=await s!.from('cloud_protected_assets').select('name,asset_type,owner_area,policy_name,status,provider,operating_system,cyberfit_score,last_backup_at,next_backup_at,last_sync_at,protected_bytes').eq('organization_id',ctx.org.id).order('name');if(error){const legacy=await s!.from('cloud_protected_assets').select('name,asset_type,owner_area,policy_name,status').eq('organization_id',ctx.org.id).order('name');data=legacy.data as any;error=legacy.error as any}return(data??[]).map((a:any)=>({name:a.name,type:a.asset_type,owner:a.owner_area??'—',policy:a.policy_name??'—',status:a.status==='protected'?'Protegido':a.status==='warning'?'Atenção':a.status,provider:a.provider??'—',os:a.operating_system??'—',cyberfit:a.cyberfit_score??null,lastBackup:a.last_backup_at?formatDateTimePtBr(a.last_backup_at):'—',nextBackup:a.next_backup_at?formatDateTimePtBr(a.next_backup_at):'—',lastSync:a.last_sync_at?formatDateTimePtBr(a.last_sync_at):'—',protectedBytes:Number(a.protected_bytes??0),protectedSize:formatBytes(Number(a.protected_bytes??0))}))}
export async function getRecoveryData(){const ctx=await getOrg();if(ctx.demo)return demoRecovery;if(!ctx.org)return[];const s=await createClient();const {data}=await s!.from('cloud_recovery_tests').select('test_type,status,completed_at,scheduled_at,rto_seconds,cloud_protected_assets(name)').eq('organization_id',ctx.org.id).order('created_at',{ascending:false});return(data??[]).map((r:any)=>({date:formatDatePtBr(r.completed_at??r.scheduled_at??new Date()),asset:r.cloud_protected_assets?.name??'Ativo',type:r.test_type,result:r.status==='passed'?'Aprovado':r.status==='failed'?'Falhou':'Planejado',rto:r.rto_seconds?`${Math.floor(r.rto_seconds/60)}m ${r.rto_seconds%60}s`:'—'}))}
export async function getReportsData(){
  const ctx=await getOrg();if(ctx.demo)return demoReports;if(!ctx.org)return[]
  const s=await createClient();const {data}=await s!.from('cloud_monthly_reports').select('*').eq('organization_id',ctx.org.id).order('reference_month',{ascending:false})
  return(data??[]).map((r:any)=>({
    id:r.id,
    month:new Date(`${r.reference_month}T12:00:00`).toLocaleDateString('pt-BR',{month:'long',year:'numeric'}),
    score:`${Number(r.health_score??0).toFixed(0)}%`,
    backups:`${Number(r.backup_success_rate??0).toFixed(1)}%`,
    tests:String(r.recovery_tests_passed??0),
    incidents:String(r.incidents_count??0),
    status:r.generation_status==='ready'?'Disponível':'Processando',
    url:r.report_url??null,
    source:r.source??'admin',
    generatedAt:r.generated_at??r.created_at,
  }))
}

export async function getReportDetail(id:string){
  const ctx=await getOrg();if(ctx.demo||!ctx.org)return null
  const s=await createClient();const {data}=await s!.from('cloud_monthly_reports').select('*').eq('id',id).eq('organization_id',ctx.org.id).maybeSingle()
  return data??null
}
export async function getIncidentsData(){const ctx=await getOrg();if(ctx.demo)return[];if(!ctx.org)return[];const s=await createClient();const {data}=await s!.from('cloud_incidents').select('id,title,severity,status,opened_at,summary').eq('organization_id',ctx.org.id).order('opened_at',{ascending:false});return data??[]}
export async function getMembersData(){
  const ctx=await getOrg();
  if(ctx.demo)return [{name:'Marina Costa',area:'Gestora de TI',role:'Administrador'},{name:'Rafael Lima',area:'Infraestrutura',role:'Operador'},{name:'Fernanda Alves',area:'Financeiro',role:'Visualização'}]
  if(!ctx.org)return[]
  const s=await createClient();const {data:members}=await s!.from('cloud_organization_members').select('user_id,member_role').eq('organization_id',ctx.org.id)
  const ids=(members??[]).map((m:any)=>m.user_id);if(!ids.length)return[]
  const {data:profiles}=await s!.from('cloud_profiles').select('id,full_name').in('id',ids);const names=new Map((profiles??[]).map((p:any)=>[p.id,p.full_name]))
  return (members??[]).map((m:any)=>({name:names.get(m.user_id)||'Usuário',area:'Corporativo',role:m.member_role==='admin'?'Administrador':m.member_role==='operator'?'Operador':'Visualização'}))
}
export async function getTicketsData(){
  const ctx=await getOrg();if(ctx.demo)return [{id:'demo-1',subject:'Validação mensal de restore',priority:'normal',category:'recovery',status:'closed',created_at:new Date().toISOString(),updated_at:new Date().toISOString(),resolved_at:new Date().toISOString(),resolution_note:'Restore validado com sucesso.'}];if(!ctx.org)return[]
  const s=await createClient();const {data}=await s!.from('cloud_support_tickets')
    .select('id,subject,priority,category,status,created_at,updated_at,resolved_at,closed_at,resolution_note,last_reply_at')
    .eq('organization_id',ctx.org.id).order('updated_at',{ascending:false}).limit(50)
  return data??[]
}

export async function getTicketDetail(id:string){
  const ctx=await getOrg();if(ctx.demo||!ctx.org)return null
  const s=await createClient()
  const {data:ticket}=await s!.from('cloud_support_tickets').select('*').eq('id',id).eq('organization_id',ctx.org.id).maybeSingle()
  if(!ticket)return null
  const {data:messages}=await s!.from('cloud_support_ticket_messages').select('id,author_id,author_role,body,created_at').eq('ticket_id',id).eq('organization_id',ctx.org.id).order('created_at',{ascending:true})
  return {ticket,messages:messages??[]}
}
