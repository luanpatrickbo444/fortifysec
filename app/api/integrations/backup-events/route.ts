import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request:Request){
  const secret=request.headers.get('x-fortify-ingest-secret')
  if(!process.env.FORTIFY_INGEST_SECRET || secret!==process.env.FORTIFY_INGEST_SECRET) return NextResponse.json({error:'unauthorized'},{status:401})
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL, service=process.env.SUPABASE_SERVICE_ROLE_KEY
  if(!url || !service) return NextResponse.json({error:'server_not_configured'},{status:503})
  const body=await request.json().catch(()=>null) as Record<string,unknown>|null
  if(!body) return NextResponse.json({error:'invalid_payload'},{status:400})
  const organizationId=String(body.organization_id||'')
  const provider=String(body.provider||'')
  const externalId=String(body.external_id||'')
  const assetName=String(body.asset_name||body.asset||'')
  const eventType=String(body.event_type||'backup.updated')
  if(!organizationId||!provider||!externalId||!assetName) return NextResponse.json({error:'organization_id, provider, external_id and asset_name are required'},{status:400})
  const supabase=createClient(url,service,{auth:{persistSession:false,autoRefreshToken:false}})
  const normalizedStatus=String(body.status||'unknown').toLowerCase()
  const assetStatus=normalizedStatus==='success'?'protected':normalizedStatus==='running'?'protected':'warning'
  const {data:asset,error:assetError}=await supabase.from('cloud_protected_assets').upsert({organization_id:organizationId,name:assetName,asset_type:String(body.asset_type||'workload'),owner_area:body.owner_area?String(body.owner_area):null,policy_name:body.policy_name?String(body.policy_name):null,status:assetStatus,provider_ref:body.provider_ref?String(body.provider_ref):null,protected_bytes:Number(body.protected_bytes||0)},{onConflict:'organization_id,name'}).select('id').single()
  if(assetError) return NextResponse.json({error:'asset_upsert_failed'},{status:500})
  const {error:eventError}=await supabase.from('cloud_integration_events').insert({provider,event_type:eventType,external_id:externalId,organization_id:organizationId,payload:body})
  if(eventError) return NextResponse.json({error:'event_insert_failed'},{status:500})
  const {error:jobError}=await supabase.from('cloud_backup_jobs').upsert({organization_id:organizationId,asset_id:asset.id,provider,external_job_id:externalId,status:normalizedStatus,started_at:body.started_at||null,finished_at:body.finished_at||null,bytes_processed:Number(body.bytes_processed||0),retention_label:body.retention_label?String(body.retention_label):null,details:body},{onConflict:'organization_id,provider,external_job_id'})
  if(jobError) return NextResponse.json({error:'job_upsert_failed'},{status:500})
  return NextResponse.json({ok:true,asset_id:asset.id},{status:202})
}
