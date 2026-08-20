import net from 'node:net'
import * as compute from '@google-cloud/compute'

const PROJECT_ID = String(process.env.GCP_PROJECT_ID || '')
const ZONE = String(process.env.GCP_ZONE || 'southamerica-east1-b')
const NETWORK = String(process.env.GCP_NETWORK || 'global/networks/fortify-range')
const SUBNETWORK = String(process.env.GCP_SUBNETWORK || 'regions/southamerica-east1/subnetworks/fortify-labs')
const DEFAULT_MACHINE_TYPE = String(process.env.GCP_MACHINE_TYPE_DEFAULT || 'e2-small')
const DEFAULT_DISK_TYPE = String(process.env.GCP_DISK_TYPE_DEFAULT || 'pd-balanced')
const DEFAULT_DISK_SIZE_GB = Math.max(10, Number(process.env.GCP_DISK_SIZE_GB_DEFAULT || 20))
const VM_PREFIX = String(process.env.GCP_VM_NAME_PREFIX || 'fortify-lab').toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/^-+|-+$/g, '').slice(0, 35) || 'fortify-lab'
const TARGET_TAG = String(process.env.GCP_TARGET_TAG || 'fortify-lab').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 63) || 'fortify-lab'
const READY_TIMEOUT_SECONDS = Math.max(0, Number(process.env.GCP_READY_TIMEOUT_SECONDS || 180))

let clients = null

function required(name, value) {
  if (!value) throw Object.assign(new Error(`${name} is required for Google Cloud labs`), { statusCode: 500 })
  return value
}

function getClients() {
  if (clients) return clients
  required('GCP_PROJECT_ID', PROJECT_ID)
  clients = {
    instances: new compute.InstancesClient(),
    operations: new compute.ZoneOperationsClient(),
    images: new compute.ImagesClient(),
  }
  return clients
}

export function gcpConfigurationStatus() {
  return {
    configured: Boolean(PROJECT_ID && ZONE && NETWORK && SUBNETWORK),
    project_id_set: Boolean(PROJECT_ID),
    zone: ZONE,
    network: NETWORK,
    subnetwork: SUBNETWORK,
    default_machine_type: DEFAULT_MACHINE_TYPE,
    target_tag: TARGET_TAG,
  }
}

function labelValue(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 63) || 'na'
}

function vmName(sessionId) {
  const short = String(sessionId).replace(/-/g, '').toLowerCase().slice(0, 20)
  return `${VM_PREFIX}-${short}`.slice(0, 63).replace(/-+$/g, '')
}

async function waitForOperation(response) {
  let operation = response?.latestResponse || response
  if (!operation) throw new Error('Google Cloud returned no zone operation')
  const { operations } = getClients()
  while (operation.status !== 'DONE') {
    const [next] = await operations.wait({
      operation: operation.name,
      project: PROJECT_ID,
      zone: String(operation.zone || ZONE).split('/').pop(),
    })
    operation = next
  }
  if (operation.error?.errors?.length) {
    const message = operation.error.errors.map(item => item.message || item.code).filter(Boolean).join('; ')
    throw new Error(message || 'Google Cloud operation failed')
  }
  return operation
}

async function resolveSourceImage(def) {
  if (def.source_image) return String(def.source_image)
  const project = String(def.image_project || 'debian-cloud')
  const family = String(def.image_family || 'debian-12')
  const { images } = getClients()
  const [image] = await images.getFromFamily({ project, family })
  if (!image?.selfLink) throw new Error(`Could not resolve image family ${project}/${family}`)
  return image.selfLink
}

function bootstrapScript(def, hasDynamicFlag) {
  const original = String(def.startup_script || '')
  if (!hasDynamicFlag) return original || null
  const path = String(def.dynamic_flag_path || '/opt/fortify/flag.txt').replace(/'/g, "'\''")
  const mode = String(def.dynamic_flag_mode || '0600').replace(/[^0-7]/g, '').slice(0, 4) || '0600'
  const prefix = `#!/bin/bash
set -u
FLAG_PATH='${path}'
FLAG_VALUE="$(curl -fsS -H 'Metadata-Flavor: Google' 'http://metadata.google.internal/computeMetadata/v1/instance/attributes/fortify-flag-bootstrap' 2>/dev/null || true)"
if [ -n "$FLAG_VALUE" ]; then
  install -d -m 0755 "$(dirname "$FLAG_PATH")"
  umask 077
  printf '%s\n' "$FLAG_VALUE" > "$FLAG_PATH"
  chmod ${mode} "$FLAG_PATH"
fi
unset FLAG_VALUE
`
  const cleaned = original.replace(/^#!.*\n?/, '')
  return prefix + (cleaned ? `
${cleaned}
` : '')
}

function metadataItems(def, { sessionId, expiresAt, context = {} }) {
  const items = []
  const startup = bootstrapScript(def, Boolean(context.dynamicFlag))
  if (startup) items.push({ key: 'startup-script', value: startup })
  if (context.dynamicFlag) items.push({ key: 'fortify-flag-bootstrap', value: String(context.dynamicFlag) })
  items.push({ key: 'fortify-session-id', value: String(sessionId) })
  items.push({ key: 'fortify-expires-at', value: String(expiresAt) })
  if (context.challengeId) items.push({ key: 'fortify-challenge-id', value: String(context.challengeId) })
  if (context.eventId) items.push({ key: 'fortify-ctf-event-id', value: String(context.eventId) })
  for (const [key, value] of Object.entries(def.metadata || {})) {
    const safeKey = String(key).trim()
    if (!safeKey || safeKey === 'startup-script' || safeKey === 'fortify-flag-bootstrap') continue
    items.push({ key: safeKey.slice(0, 128), value: String(value) })
  }
  return items
}

async function clearSensitiveMetadata(project, zone, instanceName) {
  const { instances } = getClients()
  const [instance] = await instances.get({ project, zone, instance: instanceName })
  const metadata = instance?.metadata || {}
  const items = (metadata.items || []).filter(item => item?.key !== 'fortify-flag-bootstrap')
  const [operation] = await instances.setMetadata({
    project,
    zone,
    instance: instanceName,
    metadataResource: { fingerprint: metadata.fingerprint, items },
  })
  await waitForOperation(operation)
}

async function waitForTcp(host, port, timeoutMs) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    const ok = await new Promise(resolve => {
      const socket = net.createConnection({ host, port })
      const done = value => {
        socket.removeAllListeners()
        socket.destroy()
        resolve(value)
      }
      socket.setTimeout(1200)
      socket.once('connect', () => done(true))
      socket.once('timeout', () => done(false))
      socket.once('error', () => done(false))
    })
    if (ok) return true
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  return false
}

function scheduling(def) {
  if (def.spot !== true) return undefined
  return {
    provisioningModel: 'SPOT',
    instanceTerminationAction: 'DELETE',
    automaticRestart: false,
    onHostMaintenance: 'TERMINATE',
  }
}

export async function provisionGcpVm({ sessionId, userId, labId, expiresAt, def, context = {} }) {
  const { instances } = getClients()
  const name = vmName(sessionId)
  const zone = String(def.zone || ZONE)
  const machineType = String(def.machine_type || DEFAULT_MACHINE_TYPE)
  const diskType = String(def.disk_type || DEFAULT_DISK_TYPE)
  const diskSizeGb = Math.max(10, Number(def.disk_size_gb || DEFAULT_DISK_SIZE_GB))
  const sourceImage = await resolveSourceImage(def)
  const tags = Array.from(new Set([TARGET_TAG, ...(Array.isArray(def.network_tags) ? def.network_tags.map(String) : [])])).slice(0, 64)
  const expiresUnix = String(Math.floor(new Date(expiresAt).getTime() / 1000))

  const instanceResource = {
    name,
    description: `FortifySec Cyber Range session ${sessionId}`,
    machineType: `zones/${zone}/machineTypes/${machineType}`,
    canIpForward: false,
    deletionProtection: false,
    labels: {
      'fortify-managed': 'true',
      'fortify-session': labelValue(sessionId),
      'fortify-user': labelValue(userId),
      'fortify-lab': labelValue(labId),
      'fortify-expires': expiresUnix,
    },
    tags: { items: tags },
    disks: [{
      boot: true,
      autoDelete: true,
      type: 'PERSISTENT',
      initializeParams: {
        sourceImage,
        diskSizeGb: String(diskSizeGb),
        diskType: `zones/${zone}/diskTypes/${diskType}`,
      },
    }],
    networkInterfaces: [{
      network: String(def.network || NETWORK),
      subnetwork: String(def.subnetwork || SUBNETWORK),
      // Intentionally no accessConfigs: lab VMs receive NO public IPv4 address.
    }],
    // Intentionally attach no service account to intentionally vulnerable lab VMs.
    serviceAccounts: [],
    metadata: { items: metadataItems(def, { sessionId, expiresAt, context }) },
    ...(scheduling(def) ? { scheduling: scheduling(def) } : {}),
  }

  let created = false
  try {
    const [insertOperation] = await instances.insert({ project: PROJECT_ID, zone, instanceResource })
    await waitForOperation(insertOperation)
    created = true

    const [instance] = await instances.get({ project: PROJECT_ID, zone, instance: name })
    const targetIp = instance?.networkInterfaces?.[0]?.networkIP
    if (!targetIp) throw new Error('Google Cloud VM was created without an internal IP')

    const readyPort = Number(def.ready_port || 0)
    if (readyPort > 0) {
      const timeoutMs = Math.max(5_000, Number(def.ready_timeout_seconds || READY_TIMEOUT_SECONDS) * 1000)
      const ready = await waitForTcp(targetIp, readyPort, timeoutMs)
      if (!ready) throw Object.assign(new Error(`GCP target did not become ready on ${targetIp}:${readyPort}`), { statusCode: 504 })
    }

    // The bootstrap flag exists in instance metadata only during boot. It is removed
    // before the VPN config is returned to the student, avoiding a trivial metadata read.
    if (context.dynamicFlag) await clearSensitiveMetadata(PROJECT_ID, zone, name)

    return {
      projectId: PROJECT_ID,
      zone,
      instanceName: name,
      targetIp,
      machineType,
      sourceImage,
    }
  } catch (error) {
    if (created) {
      await destroyGcpVm({ projectId: PROJECT_ID, zone, instanceName: name }).catch(() => {})
    }
    throw error
  }
}

export async function destroyGcpVm(resource) {
  if (!resource?.instanceName) return
  const project = String(resource.projectId || PROJECT_ID)
  const zone = String(resource.zone || ZONE)
  const { instances } = getClients()
  try {
    const [operation] = await instances.delete({ project, zone, instance: resource.instanceName })
    await waitForOperation(operation)
  } catch (error) {
    const message = String(error?.message || '')
    if (/not found|was not found|404/i.test(message)) return
    throw error
  }
}

export async function checkGcpAccess() {
  try {
    const { instances } = getClients()
    await instances.list({ project: PROJECT_ID, zone: ZONE, maxResults: 1 })
    return { ok: true, project_id: PROJECT_ID, zone: ZONE }
  } catch (error) {
    return { ok: false, error: error?.message || String(error) }
  }
}

export async function cleanupExpiredGcpResources() {
  const { instances } = getClients()
  const nowUnix = Math.floor(Date.now() / 1000)
  let deleted = 0

  // Aggregated listing prevents orphaned VMs from surviving if a Lab overrides the default zone.
  for await (const [zonePath, scoped] of instances.aggregatedListAsync({ project: PROJECT_ID })) {
    const zone = String(zonePath || '').split('/').pop()
    for (const instance of scoped?.instances || []) {
      if (instance?.labels?.['fortify-managed'] !== 'true') continue
      const expiresUnix = Number(instance?.labels?.['fortify-expires'] || 0)
      if (!expiresUnix || expiresUnix > nowUnix || !zone) continue
      await destroyGcpVm({ projectId: PROJECT_ID, zone, instanceName: instance.name })
      deleted += 1
    }
  }

  return { ok: true, deleted }
}
