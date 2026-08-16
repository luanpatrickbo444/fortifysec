import http from 'node:http'
import { execFile as execFileCb } from 'node:child_process'
import { promisify } from 'node:util'
import { randomBytes, randomUUID, timingSafeEqual } from 'node:crypto'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

const execFile = promisify(execFileCb)
const PORT = Number(process.env.PORT || 8787)
const API_KEY = String(process.env.PROVIDER_API_KEY || '')
const PUBLIC_BASE_URL = String(process.env.PUBLIC_BASE_URL || `http://127.0.0.1:${PORT}`).replace(/\/$/, '')
const WG_INTERFACE = String(process.env.WG_INTERFACE || 'wg0')
const WG_ENDPOINT = String(process.env.WG_ENDPOINT || '')
const WG_SERVER_PUBLIC_KEY = String(process.env.WG_SERVER_PUBLIC_KEY || '')
const WG_CLIENT_DNS = String(process.env.WG_CLIENT_DNS || '')
const STATE_FILE = resolve(process.env.STATE_FILE || './data/state.json')
const LABS_FILE = resolve(process.env.LABS_FILE || './labs.json')
const MAX_TTL = Math.max(15, Number(process.env.MAX_TTL_MINUTES || 240))

if (!API_KEY) throw new Error('PROVIDER_API_KEY is required')
if (!WG_ENDPOINT) throw new Error('WG_ENDPOINT is required, e.g. range.fortifysec.com.br:51820')

const state = { sessions: {} }
let labs = {}

async function loadJson(path, fallback) {
  try { return JSON.parse(await readFile(path, 'utf8')) } catch { return fallback }
}
async function saveState() {
  await mkdir(dirname(STATE_FILE), { recursive: true })
  await writeFile(STATE_FILE, JSON.stringify(state, null, 2), { mode: 0o600 })
}
async function boot() {
  Object.assign(state, await loadJson(STATE_FILE, { sessions: {} }))
  labs = await loadJson(LABS_FILE, {})
}

function json(res, status, body) {
  const data = Buffer.from(JSON.stringify(body))
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'content-length': data.length, 'cache-control': 'no-store' })
  res.end(data)
}
function unauthorized(res) { return json(res, 401, { error: 'unauthorized' }) }
function safeEqual(a, b) {
  const x = Buffer.from(a); const y = Buffer.from(b)
  return x.length === y.length && timingSafeEqual(x, y)
}
function authorized(req) {
  const auth = String(req.headers.authorization || '')
  return auth.startsWith('Bearer ') && safeEqual(auth.slice(7), API_KEY)
}
async function body(req) {
  const chunks = []; let size = 0
  for await (const chunk of req) { size += chunk.length; if (size > 64 * 1024) throw new Error('body too large'); chunks.push(chunk) }
  return chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {}
}
function shellSafeId(value) { return String(value || '').replace(/[^a-zA-Z0-9_.-]/g, '').slice(0, 96) }
function slotInUse(slot) { return Object.values(state.sessions).some(s => s.slot === slot && s.status === 'running') }
function allocateSlot() { for (let n = 10; n <= 240; n++) if (!slotInUse(n)) return n; throw new Error('range capacity exhausted') }
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
function vpnConfig({ clientPrivateKey, clientIp, targetSubnet, serverPublicKey }) {
  return `[Interface]\nPrivateKey = ${clientPrivateKey}\nAddress = ${clientIp}/32${WG_CLIENT_DNS ? `\nDNS = ${WG_CLIENT_DNS}` : ''}\n\n[Peer]\nPublicKey = ${serverPublicKey}\nEndpoint = ${WG_ENDPOINT}\nAllowedIPs = ${targetSubnet}\nPersistentKeepalive = 25\n`
}

async function provisionSession({ userId, labId, ttlMinutes }) {
  const def = labs[labId]
  if (!def || !def.image) throw Object.assign(new Error('unknown lab_id'), { statusCode: 404 })
  const slot = allocateSlot()
  const id = randomUUID()
  const short = id.replace(/-/g, '').slice(0, 10)
  const networkName = `fortify_${short}`
  const bridgeName = `fr${short.slice(0, 8)}`
  const containerName = `target_${short}`
  const targetSubnet = `172.30.${slot}.0/24`
  const gateway = `172.30.${slot}.1`
  const targetIp = `172.30.${slot}.10`
  const clientIp = `10.77.${slot}.2`
  const ttl = Math.min(MAX_TTL, Math.max(15, Number(ttlMinutes || def.ttl_minutes || 60)))
  const expiresAt = new Date(Date.now() + ttl * 60_000).toISOString()
  const token = randomBytes(24).toString('base64url')
  const { priv: clientPrivateKey, pub: clientPublicKey } = await wgKeyPair()
  const serverPublicKey = await getServerPublicKey()

  let networkCreated = false
  let peerAdded = false
  try {
    await run('docker', ['network', 'create', '--driver', 'bridge', '--subnet', targetSubnet, '--gateway', gateway, '--opt', `com.docker.network.bridge.name=${bridgeName}`, networkName])
    networkCreated = true

    const args = ['run', '-d', '--name', containerName, '--network', networkName, '--ip', targetIp,
      '--cap-drop', 'ALL', '--security-opt', 'no-new-privileges:true', '--pids-limit', String(def.pids_limit || 256),
      '--memory', String(def.memory || '768m'), '--cpus', String(def.cpus || '1.0'),
      '--label', `fortify.session=${id}`, '--label', `fortify.user=${shellSafeId(userId)}`, '--label', `fortify.lab=${shellSafeId(labId)}`]
    if (def.read_only !== false) args.push('--read-only', '--tmpfs', '/tmp:rw,noexec,nosuid,size=128m', '--tmpfs', '/run:rw,nosuid,size=32m')
    for (const [k, v] of Object.entries(def.env || {})) args.push('-e', `${k}=${v}`)
    args.push(def.image)
    if (Array.isArray(def.command)) args.push(...def.command.map(String))
    await run('docker', args)

    await run('wg', ['set', WG_INTERFACE, 'peer', clientPublicKey, 'allowed-ips', `${clientIp}/32`])
    peerAdded = true

    // Client can reach only this session subnet. No target ports are published to the Internet.
    await run('iptables', ['-I', 'FORWARD', '1', '-i', WG_INTERFACE, '-o', bridgeName, '-s', `${clientIp}/32`, '-d', targetSubnet, '-j', 'ACCEPT'])
    await run('iptables', ['-I', 'FORWARD', '1', '-i', bridgeName, '-o', WG_INTERFACE, '-s', targetSubnet, '-d', `${clientIp}/32`, '-m', 'conntrack', '--ctstate', 'ESTABLISHED,RELATED', '-j', 'ACCEPT'])

    // Block target-initiated Internet egress while still allowing replies to this WireGuard peer.
    await run('iptables', ['-I', 'DOCKER-USER', '1', '-s', targetSubnet, '-d', `${clientIp}/32`, '-j', 'ACCEPT'])
    await run('iptables', ['-I', 'DOCKER-USER', '2', '-s', targetSubnet, '-j', 'DROP'])
    // Prevent vulnerable targets from reaching services bound on the range host itself.
    await run('iptables', ['-I', 'INPUT', '1', '-i', bridgeName, '-s', targetSubnet, '-j', 'DROP'])

    const config = vpnConfig({ clientPrivateKey, clientIp, targetSubnet, serverPublicKey })
    state.sessions[id] = { id, status: 'running', userId, labId, slot, networkName, bridgeName, containerName, targetSubnet, targetIp, clientIp, clientPublicKey, token, config, expiresAt, createdAt: new Date().toISOString() }
    await saveState()

    const portHint = def.port ? `:${Number(def.port)}` : ''
    return {
      session_id: id,
      connection_url: `${PUBLIC_BASE_URL}/vpn/${token}`,
      vpn_download_url: `${PUBLIC_BASE_URL}/vpn/${token}`,
      target_address: def.scheme ? `${def.scheme}://${targetIp}${portHint}` : `${targetIp}${portHint}`,
      expires_at: expiresAt,
    }
  } catch (error) {
    if (peerAdded) await run('wg', ['set', WG_INTERFACE, 'peer', clientPublicKey, 'remove']).catch(() => {})
    await run('docker', ['rm', '-f', containerName]).catch(() => {})
    if (networkCreated) await run('docker', ['network', 'rm', networkName]).catch(() => {})
    throw error
  }
}

async function removeRule(args) { await run('iptables', ['-D', ...args]).catch(() => {}) }
async function destroySession(id) {
  const s = state.sessions[id]
  if (!s) return false
  if (s.status !== 'running') return true
  await run('wg', ['set', WG_INTERFACE, 'peer', s.clientPublicKey, 'remove']).catch(() => {})
  await removeRule(['FORWARD', '-i', WG_INTERFACE, '-o', s.bridgeName, '-s', `${s.clientIp}/32`, '-d', s.targetSubnet, '-j', 'ACCEPT'])
  await removeRule(['FORWARD', '-i', s.bridgeName, '-o', WG_INTERFACE, '-s', s.targetSubnet, '-d', `${s.clientIp}/32`, '-m', 'conntrack', '--ctstate', 'ESTABLISHED,RELATED', '-j', 'ACCEPT'])
  await removeRule(['DOCKER-USER', '-s', s.targetSubnet, '-d', `${s.clientIp}/32`, '-j', 'ACCEPT'])
  await removeRule(['DOCKER-USER', '-s', s.targetSubnet, '-j', 'DROP'])
  await removeRule(['INPUT', '-i', s.bridgeName, '-s', s.targetSubnet, '-j', 'DROP'])
  await run('docker', ['rm', '-f', s.containerName]).catch(() => {})
  await run('docker', ['network', 'rm', s.networkName]).catch(() => {})
  s.status = 'stopped'; s.stoppedAt = new Date().toISOString(); s.config = null; s.token = null
  await saveState(); return true
}

async function cleanupExpired() {
  for (const s of Object.values(state.sessions)) {
    if (s.status === 'running' && new Date(s.expiresAt).getTime() <= Date.now()) await destroySession(s.id).catch(console.error)
  }
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', PUBLIC_BASE_URL)
    if (req.method === 'GET' && url.pathname === '/health') return json(res, 200, { ok: true, sessions: Object.values(state.sessions).filter(s => s.status === 'running').length })

    const vpnMatch = url.pathname.match(/^\/vpn\/([A-Za-z0-9_-]+)$/)
    if (req.method === 'GET' && vpnMatch) {
      const session = Object.values(state.sessions).find(s => s.status === 'running' && s.token === vpnMatch[1])
      if (!session || new Date(session.expiresAt).getTime() <= Date.now()) return json(res, 404, { error: 'vpn config expired' })
      const data = Buffer.from(session.config)
      res.writeHead(200, { 'content-type': 'text/plain; charset=utf-8', 'content-disposition': `attachment; filename="fortify-${session.id.slice(0, 8)}.conf"`, 'content-length': data.length, 'cache-control': 'no-store, private' })
      return res.end(data)
    }

    if (!authorized(req)) return unauthorized(res)

    if (req.method === 'POST' && url.pathname === '/sessions') {
      const input = await body(req)
      if (!input.user_id || !input.lab_id) return json(res, 400, { error: 'user_id and lab_id are required' })
      const result = await provisionSession({ userId: String(input.user_id), labId: String(input.lab_id), ttlMinutes: Number(input.ttl_minutes || 60) })
      return json(res, 201, result)
    }

    const sessionMatch = url.pathname.match(/^\/sessions\/([0-9a-f-]{36})$/i)
    if (req.method === 'DELETE' && sessionMatch) {
      const removed = await destroySession(sessionMatch[1])
      return json(res, removed ? 200 : 404, { ok: removed })
    }

    return json(res, 404, { error: 'not found' })
  } catch (error) {
    console.error(error)
    return json(res, error?.statusCode || 500, { error: error?.message || 'internal error' })
  }
})

await boot()
setInterval(cleanupExpired, 30_000).unref()
server.listen(PORT, '0.0.0.0', () => console.log(`Fortify Range Provider listening on :${PORT}`))
