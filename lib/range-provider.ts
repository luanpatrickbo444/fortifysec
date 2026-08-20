export type RangeSessionRequest = {
  userId: string
  labId: string
  ttlMinutes: number
  dynamicFlag?: string | null
  challengeId?: string | null
  eventId?: string | null
}

export type RangeSessionResult = {
  sessionId: string | null
  connectionUrl: string
  vpnDownloadUrl: string
  targetAddress: string
  expiresAt: string | null
  providerBaseUrl: string
  providerKind: string | null
  estimatedCostCents: number
}

export type RangeProviderHealth = {
  baseUrl: string
  ok: boolean
  sessions: number
  maxSessions: number | null
  availableSlots: number | null
  labs: number | null
  error?: string
}

function apiKey(){ return String(process.env.LAB_PROVIDER_API_KEY || '') }

export function configuredRangeProviderUrls(){
  const many=String(process.env.LAB_PROVIDER_API_URLS||'')
    .split(',').map(v=>v.trim()).filter(Boolean)
  const single=String(process.env.LAB_PROVIDER_API_URL||'').trim()
  return Array.from(new Set([...(many.length?many:[]),...(single?[single]:[])].map(v=>v.replace(/\/$/,''))))
}

export function hasRangeProvider(){ return configuredRangeProviderUrls().length>0 }

function authHeaders(extra:Record<string,string>={}){
  const key=apiKey()
  return {...extra,...(key?{Authorization:`Bearer ${key}`}:{})}
}

async function health(baseUrl:string):Promise<RangeProviderHealth>{
  try{
    const res=await fetch(`${baseUrl}/health`,{cache:'no-store',headers:authHeaders()})
    if(!res.ok)throw new Error(`HTTP ${res.status}`)
    const data=await res.json()
    return {
      baseUrl,
      ok:Boolean(data?.ok),
      sessions:Number(data?.sessions||0),
      maxSessions:Number.isFinite(Number(data?.max_sessions))?Number(data.max_sessions):null,
      availableSlots:Number.isFinite(Number(data?.available_slots))?Number(data.available_slots):null,
      labs:Number.isFinite(Number(data?.labs))?Number(data.labs):null,
    }
  }catch(error:any){
    return {baseUrl,ok:false,sessions:0,maxSessions:null,availableSlots:null,labs:null,error:String(error?.message||error)}
  }
}

export async function getRangeProvidersHealth(){
  return Promise.all(configuredRangeProviderUrls().map(health))
}

async function chooseProvider(){
  const urls=configuredRangeProviderUrls()
  if(!urls.length)return null
  if(urls.length===1)return urls[0]
  const results=await Promise.all(urls.map(health))
  const available=results.filter(h=>h.ok && (h.availableSlots===null || h.availableSlots>0))
  if(!available.length)throw new Error('Nenhum Range Provider está disponível agora.')
  available.sort((a,b)=>{
    const ar=a.maxSessions&&a.maxSessions>0?a.sessions/a.maxSessions:a.sessions
    const br=b.maxSessions&&b.maxSessions>0?b.sessions/b.maxSessions:b.sessions
    return ar-br
  })
  return available[0].baseUrl
}

export async function createRangeSession(input:RangeSessionRequest):Promise<RangeSessionResult|null>{
  const provider=await chooseProvider()
  if(!provider)return null
  const res=await fetch(`${provider}/sessions`,{
    method:'POST',cache:'no-store',headers:authHeaders({'Content-Type':'application/json'}),
    body:JSON.stringify({
      user_id:input.userId,
      lab_id:input.labId,
      ttl_minutes:input.ttlMinutes,
      dynamic_flag:input.dynamicFlag||undefined,
      challenge_id:input.challengeId||undefined,
      event_id:input.eventId||undefined,
    })
  })
  if(!res.ok){
    let message=`range provider ${res.status}`
    try{const data=await res.json();if(data?.error)message=String(data.error)}catch{}
    throw new Error(message)
  }
  const data=await res.json()
  return {
    sessionId:data.session_id?String(data.session_id):null,
    connectionUrl:data.connection_url?String(data.connection_url):'',
    vpnDownloadUrl:data.vpn_download_url?String(data.vpn_download_url):'',
    targetAddress:String(data.target_address||data.target_ip||''),
    expiresAt:data.expires_at?String(data.expires_at):null,
    providerBaseUrl:provider,
    providerKind:data.provider?String(data.provider):null,
    estimatedCostCents:Math.max(0,Number(data.estimated_cost_cents||0)||0),
  }
}

export async function destroyRangeSession(providerSessionId:string,providerBaseUrl?:string|null){
  if(!providerSessionId)return
  const urls=providerBaseUrl?[String(providerBaseUrl).replace(/\/$/,'')]:configuredRangeProviderUrls()
  if(!urls.length)return
  for(const provider of urls){
    try{
      const res=await fetch(`${provider}/sessions/${encodeURIComponent(providerSessionId)}`,{
        method:'DELETE',cache:'no-store',headers:authHeaders(),
      })
      if(res.ok||res.status===404)return
    }catch{}
  }
}
