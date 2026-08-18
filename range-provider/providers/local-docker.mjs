import net from 'node:net'
import { execFile as execFileCb } from 'node:child_process'
import { promisify } from 'node:util'

const execFile = promisify(execFileCb)
const LOCAL_BIND_HOST = String(process.env.LOCAL_BIND_HOST || '127.0.0.1')
const LOCAL_PUBLIC_HOST = String(process.env.LOCAL_PUBLIC_HOST || '127.0.0.1')

async function run(cmd, args, opts = {}) {
  const { stdout = '', stderr = '' } = await execFile(cmd, args, {
    timeout: 120_000,
    maxBuffer: 4 * 1024 * 1024,
    ...opts,
  })
  return { stdout: String(stdout).trim(), stderr: String(stderr).trim() }
}

function safeLabel(value) {
  return String(value || '').replace(/[^a-zA-Z0-9_.-]/g, '').slice(0, 96)
}

async function freePort(host = LOCAL_BIND_HOST) {
  return await new Promise((resolve, reject) => {
    const server = net.createServer()
    server.unref()
    server.on('error', reject)
    server.listen({ host, port: 0, exclusive: true }, () => {
      const address = server.address()
      const port = typeof address === 'object' && address ? address.port : 0
      server.close(error => error ? reject(error) : resolve(port))
    })
  })
}

async function waitForTcp(host, port, timeoutMs = 45_000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    const ok = await new Promise(resolve => {
      const socket = net.createConnection({ host, port })
      const done = value => {
        socket.removeAllListeners()
        socket.destroy()
        resolve(value)
      }
      socket.setTimeout(1000)
      socket.once('connect', () => done(true))
      socket.once('timeout', () => done(false))
      socket.once('error', () => done(false))
    })
    if (ok) return true
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  return false
}

function targetUrl(def, hostPort) {
  const scheme = String(def.scheme || 'http').replace(/:$/, '')
  return `${scheme}://${LOCAL_PUBLIC_HOST}:${hostPort}`
}

export async function checkLocalDockerAccess() {
  try {
    const result = await run('docker', ['version', '--format', '{{.Server.Version}}'])
    return { ok: true, docker_server_version: result.stdout || null }
  } catch (error) {
    return { ok: false, error: error?.message || String(error) }
  }
}

export function localDockerConfigurationStatus() {
  return {
    configured: true,
    bind_host: LOCAL_BIND_HOST,
    public_host: LOCAL_PUBLIC_HOST,
  }
}

export async function provisionLocalDocker({ sessionId, userId, labId, expiresAt, def }) {
  if (!def?.image || typeof def.image !== 'string') {
    throw Object.assign(new Error('local_docker lab requires string image'), { statusCode: 500 })
  }

  const containerPort = Number(def.port || def.container_port || 0)
  if (!Number.isInteger(containerPort) || containerPort < 1 || containerPort > 65535) {
    throw Object.assign(new Error('local_docker lab requires a valid port/container_port'), { statusCode: 500 })
  }

  const hostPort = Number(def.host_port || 0) || await freePort()
  const short = sessionId.replace(/-/g, '').slice(0, 10)
  const networkName = `fortify_local_${short}`
  const containerName = `fortify_local_target_${short}`
  let networkCreated = false
  let containerCreated = false

  try {
    // Internal bridge: the target can receive traffic from the published localhost port,
    // but does not get general outbound access to the Internet.
    await run('docker', ['network', 'create', '--driver', 'bridge', '--internal', networkName])
    networkCreated = true

    const args = [
      'run', '-d', '--name', containerName,
      '--network', networkName,
      '-p', `${LOCAL_BIND_HOST}:${hostPort}:${containerPort}`,
      '--cap-drop', 'ALL',
      '--security-opt', 'no-new-privileges:true',
      '--pids-limit', String(def.pids_limit || 256),
      '--memory', String(def.memory || '768m'),
      '--cpus', String(def.cpus || '1.0'),
      '--label', `fortify.session=${safeLabel(sessionId)}`,
      '--label', `fortify.user=${safeLabel(userId)}`,
      '--label', `fortify.lab=${safeLabel(labId)}`,
      '--label', `fortify.expires_at=${safeLabel(expiresAt)}`,
    ]

    if (def.read_only !== false) {
      args.push('--read-only', '--tmpfs', '/tmp:rw,noexec,nosuid,size=128m', '--tmpfs', '/run:rw,nosuid,size=32m')
    }

    for (const [key, value] of Object.entries(def.env || {})) {
      args.push('-e', `${key}=${String(value)}`)
    }

    args.push(def.image)
    if (Array.isArray(def.command)) args.push(...def.command.map(String))

    await run('docker', args)
    containerCreated = true

    if (def.wait_ready !== false) {
      const ready = await waitForTcp(LOCAL_BIND_HOST, hostPort, Math.max(5_000, Number(def.ready_timeout_seconds || 45) * 1000))
      if (!ready) {
        throw Object.assign(new Error(`local target did not become ready on ${LOCAL_BIND_HOST}:${hostPort}`), { statusCode: 504 })
      }
    }

    return {
      containerName,
      networkName,
      hostPort,
      containerPort,
      targetUrl: targetUrl(def, hostPort),
    }
  } catch (error) {
    if (containerCreated) await run('docker', ['rm', '-f', containerName]).catch(() => {})
    if (networkCreated) await run('docker', ['network', 'rm', networkName]).catch(() => {})
    throw error
  }
}

export async function destroyLocalDocker(resource) {
  if (!resource) return
  if (resource.containerName) await run('docker', ['rm', '-f', resource.containerName]).catch(() => {})
  if (resource.networkName) await run('docker', ['network', 'rm', resource.networkName]).catch(() => {})
}
