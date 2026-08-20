import http from 'node:http'
import { execFile as execFileCb } from 'node:child_process'
import { promisify } from 'node:util'
import { randomBytes, randomUUID, timingSafeEqual } from 'node:crypto'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import {
  checkLocalDockerAccess,
  destroyLocalDocker,
  localDockerConfigurationStatus,
  provisionLocalDocker,
} from './providers/local-docker.mjs'
import {
  checkGcpAccess,
  cleanupExpiredGcpResources,
  destroyGcpVm,
  gcpConfigurationStatus,
  provisionGcpVm,
} from './providers/gcp.mjs'

const execFile = promisify(execFileCb)
const PORT = Number(process.env.PORT || 8787)
const LISTEN_HOST = String(process.env.LISTEN_HOST || '0.0.0.0')
const API_KEY = String(process.env.PROVIDER_API_KEY || '')
const PUBLIC_BASE_URL = String(process.env.PUBLIC_BASE_URL || `http://127.0.0.1:${PORT}`).replace(/\/$/, '')
const WG_INTERFACE = String(process.env.WG_INTERFACE || 'wg0')
const WG_ENDPOINT = String(process.env.WG_ENDPOINT || '')
const WG_SERVER_PUBLIC_KEY = String(process.env.WG_SERVER_PUBLIC_KEY || '')
const WG_CLIENT_DNS = String(process.env.WG_CLIENT_DNS || '')
const GCP_EGRESS_INTERFACE = String(process.env.GCP_EGRESS_INTERFACE || '')
const STATE_FILE = resolve(process.env.STATE_FILE || './data/state.json')
const LABS_FILE = resolve(process.env.LABS_FILE || './labs.json')
const MAX_TTL = Math.max(15, Number(process.env.MAX_TTL_MINUTES || 240))
const MAX_ACTIVE_SESSIONS = Math.max(1, Number(process.env.MAX_ACTIVE_SESSIONS || 100))
const MAX_SESSIONS_PER_USER = Math.max(1, Number(process.env.MAX_SESSIONS_PER_USER || 1))
const GCP_SWEEP_INTERVAL_MS = Math.max(60_000, Number(process.env.GCP_SWEEP_INTERVAL_MS || 300_000))

if (!API_KEY) throw new Error('PROVIDER_API_KEY is required')

const state = { sessions: {} }
const reservedSlots = new Set()
const provisioningKeys = new Set()
let labs = {}
let lastGcpSweep = 0

async function loadJson(path, fallback) {
  try { return JSON.parse(await readFile(path, 'utf8')) } catch { return fallback }
}
async function saveState() {
  await mkdir(dirname(STATE_FILE), { recursive: true })
  await writeFile(STATE_FILE, JSON.stringify(state, null, 2), { mode: 0o600 })
}
async function boot() {
  const persisted = await loadJson(STATE_FILE, { sessions: {} })
  state.sessions = persisted?.sessions || {}
  labs = await loadJson(LABS_FILE, {})
  if (!Object.keys(labs).length) throw new Error(`No labs loaded from ${LABS_FILE}`)
  const usesGcp = Object.values(labs).some(def => providerType(def) === 'gcp')
  if (usesGcp && !WG_ENDPOINT) throw new Error('WG_ENDPOINT is required when GCP labs are configured')
}

function json(res, status, body) {
  const data = Buffer.from(JSON.stringify(body))
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'content-length': data.length, 'cache-control': 'no-store' })
  res.end(data)
}
function safeEqual(a, b) {
  const x = Buffer.from(String(a)); const y = Buffer.from(String(b))
  return x.length === y.length && timingSafeEqual(x, y)
}
function authorized(req) {
  const auth = String(req.headers.authorization || '')
  return auth.startsWith('Bearer ') && safeEqual(auth.slice(7), API_KEY)
}
async function body(req) {
  const chunks = []; let size = 0
  for await (const chunk of req) {
    size += chunk.length
    if (size > 64 * 1024) throw Object.assign(new Error('body too large'), { statusCode: 413 })
    chunks.push(chunk)
  }
  return chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {}
}
function providerType(def) {
  const raw = String(def?.provider || def?.type || 'local_docker').toLowerCase()
  if (['local', 'local_docker', 'docker_local', 'docker'].includes(raw)) return 'local_docker'
  if (['gcp', 'gcp_vm', 'google', 'google_cloud', 'google_compute'].includes(raw)) return 'gcp'
  return raw
}
function runningFor(userId, labId) {
  return Object.values(state.sessions).find(s => s.status === 'running' && s.userId === userId && s.labId === labId && new Date(s.expiresAt).getTime() > Date.now())
}
function activeSessions() {
  return Object.values(state.sessions).filter(s => s.status === 'running' && new Date(s.expiresAt).getTime() > Date.now())
}
function runningForUser(userId) {
  return activeSessions().filter(s => s.userId === userId)
}
function estimatedCostCents(def, ttlMinutes) {
  const rate = Math.max(0, Number(def?.estimated_cost_cents_per_hour || 0))
  return Math.ceil(rate * (Math.max(1, ttlMinutes) / 60))
}
function slotInUse(slot) {
  return reservedSlots.has(slot) || Object.values(state.sessions).some(s => s.slot === slot && ['running', 'provisioning'].includes(s.status))
}
function allocateSlot() {
  for (let n = 10; n <= 240; n++) {
    if (!slotInUse(n)) { reservedSlots.add(n); return n }
  }
  throw Object.assign(new Error('range capacity exhausted'), { statusCode: 503 })
}
function releaseSlot(slot) { if (slot) reservedSlots.delete(slot) }
async function run(cmd, args, opts = {}) {
  const { stdout = '', stderr = '' } = await execFile(cmd, args, { timeout: 60_000, maxBuffer: 2 * 1024 * 1024, ...opts })
  return { stdout: String(stdout).trim(), stderr: String(stderr).trim() }
}
async function wgKeyPair() {
  const priv = (await run('wg', ['genkey'])).stdout
  const pub = (await run('bash', ['-lc', `printf '%s' "$WG_PRIVATE" | wg pubkey`], { env: { ...process.env, WG_PRIVATE: priv } })).stdout
  return { priv, pub }
}
async function getServerPublicKey() {
  if (WG_SERVER_PUBLIC_KEY) return WG_SERVER_PUBLIC_KEY
  return (await run('wg', ['show', WG_INTERFACE, 'public-key'])).stdout
}
function vpnConfig({ clientPrivateKey, clientIp, targetRoutes, serverPublicKey }) {
  return `[Interface]\nPrivateKey = ${clientPrivateKey}\nAddress = ${clientIp}/32${WG_CLIENT_DNS ? `\nDNS = ${WG_CLIENT_DNS}` : ''}\n\n[Peer]\nPublicKey = ${serverPublicKey}\nEndpoint = ${WG_ENDPOINT}\nAllowedIPs = ${targetRoutes}\nPersistentKeepalive = 25\n`
}
function sessionTargetAddress(def, targetIp) {
  const portHint = def.port ? `:${Number(def.port)}` : ''
  return def.scheme ? `${def.scheme}://${targetIp}${portHint}` : `${targetIp}${portHint}`
}
async function addWireGuardPeer(clientPublicKey, clientIp) {
  await run('wg', ['set', WG_INTERFACE, 'peer', clientPublicKey, 'allowed-ips', `${clientIp}/32`])
}
async function removeWireGuardPeer(clientPublicKey) {
  if (clientPublicKey) await run('wg', ['set', WG_INTERFACE, 'peer', clientPublicKey, 'remove']).catch(() => {})
}
async function removeRule(args) { await run('iptables', ['-D', ...args]).catch(() => {}) }
async function egressInterfaceFor(targetIp) {
  if (GCP_EGRESS_INTERFACE) return GCP_EGRESS_INTERFACE
  const { stdout } = await run('ip', ['route', 'get', targetIp])
  const match = stdout.match(/\bdev\s+(\S+)/)
  if (!match) throw new Error(`Could not discover egress interface for ${targetIp}`)
  return match[1]
}

function localResponse(session) {
  return {
    session_id: session.id,
    connection_url: session.targetUrl,
    vpn_download_url: null,
    target_address: session.targetUrl,
    expires_at: session.expiresAt,
    access_mode: 'direct',
    provider: session.provider,
    estimated_cost_cents: Number(session.estimatedCostCents || 0),
  }
}
function gcpResponse(session) {
  return {
    session_id: session.id,
    connection_url: `${PUBLIC_BASE_URL}/vpn/${session.token}`,
    vpn_download_url: `${PUBLIC_BASE_URL}/vpn/${session.token}`,
    target_address: sessionTargetAddress(session.def, session.targetIp),
    expires_at: session.expiresAt,
    access_mode: 'vpn',
    provider: session.provider,
    estimated_cost_cents: Number(session.estimatedCostCents || 0),
  }
}

async function provisionLocalSession({ id, userId, labId, expiresAt, def, context, estimatedCostCents }) {
  const local = await provisionLocalDocker({ sessionId: id, userId, labId, expiresAt, def, context })
  const session = { id, provider: 'local_docker', status: 'running', userId, labId, targetUrl: local.targetUrl, expiresAt, estimatedCostCents, createdAt: new Date().toISOString(), local }
  state.sessions[id] = session
  await saveState()
  return localResponse(session)
}

async function provisionGcpSession({ id, userId, labId, expiresAt, def, slot, context, estimatedCostCents }) {
  const clientIp = `10.77.${slot}.2`
  const token = randomBytes(24).toString('base64url')
  const { priv: clientPrivateKey, pub: clientPublicKey } = await wgKeyPair()
  const serverPublicKey = await getServerPublicKey()
  let gcp = null
  let peerAdded = false
  let forwardRulesAdded = false
  let egressInterface = null

  try {
    gcp = await provisionGcpVm({ sessionId: id, userId, labId, expiresAt, def, context })
    const targetIp = gcp.targetIp
    const targetRoute = `${targetIp}/32`
    egressInterface = await egressInterfaceFor(targetIp)

    await addWireGuardPeer(clientPublicKey, clientIp)
    peerAdded = true

    // Per-session forwarding: this WireGuard peer can reach only its own private VM.
    await run('iptables', ['-I', 'FORWARD', '1', '-i', WG_INTERFACE, '-o', egressInterface, '-s', `${clientIp}/32`, '-d', targetRoute, '-j', 'ACCEPT'])
    await run('iptables', ['-I', 'FORWARD', '1', '-i', egressInterface, '-o', WG_INTERFACE, '-s', targetRoute, '-d', `${clientIp}/32`, '-m', 'conntrack', '--ctstate', 'ESTABLISHED,RELATED', '-j', 'ACCEPT'])
    forwardRulesAdded = true

    const config = vpnConfig({ clientPrivateKey, clientIp, targetRoutes: targetRoute, serverPublicKey })
    const session = {
      id, provider: 'gcp', status: 'running', userId, labId, slot, targetIp, targetRoute, clientIp, clientPublicKey,
      token, config, expiresAt, gcp, egressInterface, estimatedCostCents, def: { scheme: def.scheme || null, port: def.port || null }, createdAt: new Date().toISOString(),
    }
    state.sessions[id] = session
    await saveState()
    return gcpResponse(session)
  } catch (error) {
    if (forwardRulesAdded && gcp?.targetIp && egressInterface) {
      const route = `${gcp.targetIp}/32`
      await removeRule(['FORWARD', '-i', WG_INTERFACE, '-o', egressInterface, '-s', `${clientIp}/32`, '-d', route, '-j', 'ACCEPT'])
      await removeRule(['FORWARD', '-i', egressInterface, '-o', WG_INTERFACE, '-s', route, '-d', `${clientIp}/32`, '-m', 'conntrack', '--ctstate', 'ESTABLISHED,RELATED', '-j', 'ACCEPT'])
    }
    if (peerAdded) await removeWireGuardPeer(clientPublicKey)
    if (gcp) await destroyGcpVm(gcp).catch(() => {})
    throw error
  }
}

async function provisionSession({ userId, labId, ttlMinutes, context = {} }) {
  const def = labs[labId]
  if (!def) throw Object.assign(new Error('unknown lab_id'), { statusCode: 404 })
  const type = providerType(def)
  if (!['local_docker', 'gcp'].includes(type)) throw Object.assign(new Error(`unsupported provider: ${type}`), { statusCode: 500 })

  const current = runningFor(userId, labId)
  if (current) return current.provider === 'gcp' ? gcpResponse(current) : localResponse(current)

  if (activeSessions().length >= MAX_ACTIVE_SESSIONS) {
    throw Object.assign(new Error('range capacity exhausted'), { statusCode: 503 })
  }
  if (runningForUser(userId).length >= MAX_SESSIONS_PER_USER) {
    throw Object.assign(new Error('user session limit reached'), { statusCode: 429 })
  }

  const key = `${userId}:${labId}`
  if (provisioningKeys.has(key)) throw Object.assign(new Error('session is already provisioning'), { statusCode: 409 })
  provisioningKeys.add(key)
  let slot = null

  try {
    const id = randomUUID()
    const ttl = Math.min(MAX_TTL, Math.max(15, Number(ttlMinutes || def.ttl_minutes || 60)))
    const expiresAt = new Date(Date.now() + ttl * 60_000).toISOString()
    const cost = estimatedCostCents(def, ttl)
    if (type === 'gcp') {
      slot = allocateSlot()
      return await provisionGcpSession({ id, userId, labId, expiresAt, def, slot, context, estimatedCostCents: cost })
    }
    return await provisionLocalSession({ id, userId, labId, expiresAt, def, context, estimatedCostCents: cost })
  } finally {
    releaseSlot(slot)
    provisioningKeys.delete(key)
  }
}

async function destroySession(id) {
  const s = state.sessions[id]
  if (!s) return false
  if (s.status !== 'running') return true

  if (s.provider === 'gcp') {
    await removeWireGuardPeer(s.clientPublicKey)
    const iface = s.egressInterface || (s.targetIp ? await egressInterfaceFor(s.targetIp).catch(() => null) : null)
    if (s.targetRoute && iface) {
      await removeRule(['FORWARD', '-i', WG_INTERFACE, '-o', iface, '-s', `${s.clientIp}/32`, '-d', s.targetRoute, '-j', 'ACCEPT'])
      await removeRule(['FORWARD', '-i', iface, '-o', WG_INTERFACE, '-s', s.targetRoute, '-d', `${s.clientIp}/32`, '-m', 'conntrack', '--ctstate', 'ESTABLISHED,RELATED', '-j', 'ACCEPT'])
    }
    await destroyGcpVm(s.gcp).catch(error => console.error('[gcp:destroy]', error?.message || error))
  } else {
    await destroyLocalDocker(s.local).catch(error => console.error('[local-docker:destroy]', error?.message || error))
  }

  s.status = 'stopped'
  s.stoppedAt = new Date().toISOString()
  s.config = null
  s.token = null
  await saveState()
  return true
}

async function cleanupExpired() {
  for (const s of Object.values(state.sessions)) {
    if (s.status === 'running' && new Date(s.expiresAt).getTime() <= Date.now()) await destroySession(s.id).catch(error => console.error('[range:sweep]', error?.message || error))
  }
  if (Date.now() - lastGcpSweep >= GCP_SWEEP_INTERVAL_MS && gcpConfigurationStatus().configured) {
    lastGcpSweep = Date.now()
    cleanupExpiredGcpResources().catch(error => console.error('[gcp:orphan-sweep]', error?.message || error))
  }
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', PUBLIC_BASE_URL)

    if (req.method === 'GET' && url.pathname === '/healthz') {
      return json(res, 200, { ok: true })
    }

    const vpnMatch = url.pathname.match(/^\/vpn\/([A-Za-z0-9_-]+)$/)
    if (req.method === 'GET' && vpnMatch) {
      const session = Object.values(state.sessions).find(s => s.provider === 'gcp' && s.status === 'running' && s.token === vpnMatch[1])
      if (!session || new Date(session.expiresAt).getTime() <= Date.now()) return json(res, 404, { error: 'vpn config expired' })
      const data = Buffer.from(session.config)
      res.writeHead(200, {
        'content-type': 'text/plain; charset=utf-8',
        'content-disposition': `attachment; filename="fortify-${session.id.slice(0, 8)}.conf"`,
        'content-length': data.length,
        'cache-control': 'no-store, private',
      })
      return res.end(data)
    }

    if (!authorized(req)) return json(res, 401, { error: 'unauthorized' })

    if (req.method === 'GET' && url.pathname === '/health') {
      const running = Object.values(state.sessions).filter(s => s.status === 'running' && new Date(s.expiresAt).getTime() > Date.now())
      return json(res, 200, {
        ok: true,
        sessions: running.length,
        max_sessions: MAX_ACTIVE_SESSIONS,
        available_slots: Math.max(0, MAX_ACTIVE_SESSIONS - running.length),
        max_sessions_per_user: MAX_SESSIONS_PER_USER,
        local_sessions: running.filter(s => s.provider === 'local_docker').length,
        gcp_sessions: running.filter(s => s.provider === 'gcp').length,
        labs: Object.keys(labs).length,
        gcp: gcpConfigurationStatus(),
        local_docker: localDockerConfigurationStatus(),
      })
    }

    if (req.method === 'GET' && url.pathname === '/health/gcp') {
      const result = await checkGcpAccess()
      return json(res, result.ok ? 200 : 503, { ...result, config: gcpConfigurationStatus() })
    }

    if (req.method === 'GET' && url.pathname === '/health/local') {
      const result = await checkLocalDockerAccess()
      return json(res, result.ok ? 200 : 503, { ...result, config: localDockerConfigurationStatus() })
    }

    if (req.method === 'POST' && url.pathname === '/sessions') {
      const input = await body(req)
      if (!input.user_id || !input.lab_id) return json(res, 400, { error: 'user_id and lab_id are required' })
      const dynamicFlag = input.dynamic_flag ? String(input.dynamic_flag) : null
      if (dynamicFlag && (dynamicFlag.length < 12 || dynamicFlag.length > 256)) return json(res, 400, { error: 'invalid dynamic_flag' })
      const result = await provisionSession({
        userId: String(input.user_id),
        labId: String(input.lab_id),
        ttlMinutes: Number(input.ttl_minutes || 60),
        context: {
          dynamicFlag,
          challengeId: input.challenge_id ? String(input.challenge_id) : null,
          eventId: input.event_id ? String(input.event_id) : null,
        },
      })
      return json(res, 201, result)
    }

    const sessionMatch = url.pathname.match(/^\/sessions\/([0-9a-f-]{36})$/i)
    if (req.method === 'DELETE' && sessionMatch) {
      const removed = await destroySession(sessionMatch[1])
      return json(res, removed ? 200 : 404, { ok: removed })
    }

    return json(res, 404, { error: 'not found' })
  } catch (error) {
    console.error('[range]', error)
    return json(res, error?.statusCode || 500, { error: error?.message || 'internal error' })
  }
})

await boot()
await cleanupExpired()
setInterval(cleanupExpired, 30_000).unref()
server.listen(PORT, LISTEN_HOST, () => console.log(`Fortify Range Provider listening on ${LISTEN_HOST}:${PORT}`))
