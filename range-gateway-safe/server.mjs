import http from 'node:http'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { timingSafeEqual } from 'node:crypto'

const PORT = Number(process.env.PORT || 8790)
const HOST = String(process.env.LISTEN_HOST || '0.0.0.0')
const PUBLIC_BASE_URL = String(process.env.PUBLIC_BASE_URL || `http://127.0.0.1:${PORT}`).replace(/\/$/, '')
const GATEWAY_API_KEY = String(process.env.GATEWAY_API_KEY || '')
const NODE_KEY = String(process.env.RANGE_PROVIDER_API_KEY || '')
const NODES = String(process.env.RANGE_PROVIDER_URLS || '').split(',').map(v => v.trim().replace(/\/$/, '')).filter(Boolean)
const STATE_FILE = resolve(process.env.STATE_FILE || './data/gateway-state.json')

if (!GATEWAY_API_KEY) throw new Error('GATEWAY_API_KEY is required')
if (!NODE_KEY) throw new Error('RANGE_PROVIDER_API_KEY is required')
if (!NODES.length) throw new Error('RANGE_PROVIDER_URLS must contain at least one node')

let state = { sessions: {} }
try { state = JSON.parse(await readFile(STATE_FILE, 'utf8')) } catch {}

async function save() {
  await mkdir(dirname(STATE_FILE), { recursive: true })
  await writeFile(STATE_FILE, JSON.stringify(state, null, 2), { mode: 0o600 })
}
function json(res, status, body) {
  const data = Buffer.from(JSON.stringify(body))
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'content-length': data.length, 'cache-control': 'no-store' })
  res.end(data)
}
function safeEqual(a,b) {
  const x=Buffer.from(String(a)); const y=Buffer.from(String(b))
  return x.length===y.length && timingSafeEqual(x,y)
}
function authorized(req) {
  const value=String(req.headers.authorization||'')
  return value.startsWith('Bearer ') && safeEqual(value.slice(7),GATEWAY_API_KEY)
}
async function body(req) {
  const chunks=[]; let size=0
  for await (const chunk of req) {
    size += chunk.length
    if (size > 64*1024) throw Object.assign(new Error('body too large'),{statusCode:413})
    chunks.push(chunk)
  }
  return chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {}
}
async function nodeFetch(base,path,init={}) {
  return fetch(`${base}${path}`, {
    ...init,
    cache:'no-store',
    headers:{
      ...(init.headers||{}),
      Authorization:`Bearer ${NODE_KEY}`,
    },
  })
}
async function inspectNodes() {
  return Promise.all(NODES.map(async base => {
    try {
      const response=await nodeFetch(base,'/stats')
      if(!response.ok) return {base,ok:false,status:response.status,available:0,capacity:0,running:0}
      const data=await response.json()
      return {base,ok:true,...data}
    } catch(error) {
      return {base,ok:false,error:error instanceof Error?error.message:String(error),available:0,capacity:0,running:0}
    }
  }))
}
async function chooseNode() {
  const nodes=(await inspectNodes()).filter(n=>n.ok && Number(n.available||0)>0)
  if(!nodes.length) throw Object.assign(new Error('no range node has available capacity'),{statusCode:503})
  nodes.sort((a,b)=>{
    const aUse=Number(a.running||0)/Math.max(1,Number(a.capacity||1))
    const bUse=Number(b.running||0)/Math.max(1,Number(b.capacity||1))
    return aUse-bUse || Number(b.available||0)-Number(a.available||0)
  })
  return nodes[0]
}
async function createSession(input) {
  const node=await chooseNode()
  const response=await nodeFetch(node.base,'/sessions',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify(input),
  })
  const data=await response.json().catch(()=>({}))
  if(!response.ok) throw Object.assign(new Error(data.error||`node ${response.status}`),{statusCode:response.status})
  if(data.session_id) {
    state.sessions[String(data.session_id)]={node:node.base,created_at:new Date().toISOString()}
    await save()
  }
  return {...data,gateway_node:node.base}
}
async function destroySession(id) {
  const mapped=state.sessions[id]?.node
  const candidates=mapped?[mapped]:NODES
  for(const node of candidates) {
    try {
      const response=await nodeFetch(node,`/sessions/${encodeURIComponent(id)}`,{method:'DELETE'})
      if(response.ok || response.status===404) {
        delete state.sessions[id]
        await save()
        return response.ok
      }
    } catch {}
  }
  return false
}

const server=http.createServer(async(req,res)=>{
  try {
    const url=new URL(req.url||'/',PUBLIC_BASE_URL)
    if(req.method==='GET' && url.pathname==='/health') {
      const nodes=await inspectNodes()
      return json(res,200,{ok:nodes.some(n=>n.ok),nodes:nodes.map(n=>({node:n.node||n.base,ok:n.ok,running:n.running||0,capacity:n.capacity||0,available:n.available||0}))})
    }
    if(!authorized(req)) return json(res,401,{error:'unauthorized'})
    if(req.method==='GET' && url.pathname==='/stats') {
      const nodes=await inspectNodes()
      const online=nodes.filter(n=>n.ok)
      return json(res,200,{
        ok:online.length>0,
        node:'range-gateway',
        running:online.reduce((s,n)=>s+Number(n.running||0),0),
        capacity:online.reduce((s,n)=>s+Number(n.capacity||0),0),
        available:online.reduce((s,n)=>s+Number(n.available||0),0),
        estimated_active_cost_cents:online.reduce((s,n)=>s+Number(n.estimated_active_cost_cents||0),0),
        dynamic_flags:online.length>0 && online.every(n=>Boolean(n.dynamic_flags)),
        nodes,
      })
    }
    if(req.method==='POST' && url.pathname==='/sessions') {
      const input=await body(req)
      if(!input.user_id||!input.lab_id) return json(res,400,{error:'user_id and lab_id are required'})
      return json(res,201,await createSession(input))
    }
    const match=url.pathname.match(/^\/sessions\/([0-9a-f-]{36})$/i)
    if(req.method==='DELETE' && match) {
      const ok=await destroySession(match[1])
      return json(res,ok?200:404,{ok})
    }
    return json(res,404,{error:'not found'})
  } catch(error) {
    console.error('[range-gateway]',error)
    return json(res,error?.statusCode||500,{error:error?.message||'internal error'})
  }
})

server.listen(PORT,HOST,()=>console.log(`Fortify Range Gateway listening on ${HOST}:${PORT}`))
