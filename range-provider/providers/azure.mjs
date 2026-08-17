import net from 'node:net'
import { DefaultAzureCredential } from '@azure/identity'
import { ComputeManagementClient } from '@azure/arm-compute'
import { NetworkManagementClient } from '@azure/arm-network'

const SUBSCRIPTION_ID = String(process.env.AZURE_SUBSCRIPTION_ID || '')
const RESOURCE_GROUP = String(process.env.AZURE_RESOURCE_GROUP || '')
const LOCATION = String(process.env.AZURE_LOCATION || 'brazilsouth')
const SUBNET_ID = String(process.env.AZURE_LAB_SUBNET_ID || '')
const LAB_NSG_ID = String(process.env.AZURE_LAB_NSG_ID || '')
const DEFAULT_VM_SIZE = String(process.env.AZURE_VM_SIZE_DEFAULT || 'Standard_B2s')
const DEFAULT_DISK_SKU = String(process.env.AZURE_OS_DISK_SKU || 'StandardSSD_LRS')
const DEFAULT_ADMIN = String(process.env.AZURE_ADMIN_USERNAME || 'fortifyadmin')
const DEFAULT_SSH_PUBLIC_KEY = String(process.env.AZURE_SSH_PUBLIC_KEY || '').trim()
const WINDOWS_ADMIN_PASSWORD = String(process.env.AZURE_WINDOWS_ADMIN_PASSWORD || '')
const VM_PREFIX = String(process.env.AZURE_VM_NAME_PREFIX || 'fortify-lab').replace(/[^a-zA-Z0-9-]/g, '').slice(0, 30) || 'fortify-lab'
const READY_TIMEOUT_SECONDS = Math.max(0, Number(process.env.AZURE_READY_TIMEOUT_SECONDS || 120))

let clients = null

function required(name, value) {
  if (!value) throw Object.assign(new Error(`${name} is required for Azure labs`), { statusCode: 500 })
  return value
}

export function azureConfigurationStatus() {
  return {
    configured: Boolean(SUBSCRIPTION_ID && RESOURCE_GROUP && SUBNET_ID),
    subscription_id_set: Boolean(SUBSCRIPTION_ID),
    resource_group: RESOURCE_GROUP || null,
    location: LOCATION,
    lab_subnet_id_set: Boolean(SUBNET_ID),
    lab_nsg_id_set: Boolean(LAB_NSG_ID),
    default_vm_size: DEFAULT_VM_SIZE,
  }
}

function getClients() {
  if (clients) return clients
  required('AZURE_SUBSCRIPTION_ID', SUBSCRIPTION_ID)
  required('AZURE_RESOURCE_GROUP', RESOURCE_GROUP)
  required('AZURE_LAB_SUBNET_ID', SUBNET_ID)
  required('AZURE_LAB_NSG_ID', LAB_NSG_ID)
  const credential = new DefaultAzureCredential()
  clients = {
    compute: new ComputeManagementClient(credential, SUBSCRIPTION_ID),
    network: new NetworkManagementClient(credential, SUBSCRIPTION_ID),
  }
  return clients
}

function safeTag(value) {
  return String(value || '').replace(/[<>%&\\?/]/g, '').slice(0, 240)
}

function imageReference(def) {
  if (def.image_id) return { id: String(def.image_id) }
  const image = def.image
  if (!image || typeof image !== 'object') {
    throw Object.assign(new Error('Azure lab requires image_id or image object'), { statusCode: 500 })
  }
  const publisher = String(image.publisher || '')
  const offer = String(image.offer || '')
  const sku = String(image.sku || '')
  const version = String(image.version || 'latest')
  if (!publisher || !offer || !sku) {
    throw Object.assign(new Error('Azure marketplace image requires publisher, offer and sku'), { statusCode: 500 })
  }
  return { publisher, offer, sku, version }
}

function customData(def) {
  if (def.custom_data_base64) return String(def.custom_data_base64)
  if (def.cloud_init) return Buffer.from(String(def.cloud_init), 'utf8').toString('base64')
  return undefined
}

function osProfile(def, vmName) {
  if (def.specialized === true) return undefined
  const osType = String(def.os_type || 'linux').toLowerCase()
  const adminUsername = String(def.admin_username || DEFAULT_ADMIN)
  const data = customData(def)

  if (osType === 'windows') {
    const adminPassword = String(def.admin_password || WINDOWS_ADMIN_PASSWORD)
    required('AZURE_WINDOWS_ADMIN_PASSWORD', adminPassword)
    return {
      computerName: vmName.slice(0, 15),
      adminUsername,
      adminPassword,
      customData: data,
      windowsConfiguration: {
        provisionVMAgent: true,
        enableAutomaticUpdates: false,
      },
    }
  }

  const sshPublicKey = String(def.ssh_public_key || DEFAULT_SSH_PUBLIC_KEY).trim()
  required('AZURE_SSH_PUBLIC_KEY', sshPublicKey)
  return {
    computerName: vmName.slice(0, 64),
    adminUsername,
    customData: data,
    linuxConfiguration: {
      disablePasswordAuthentication: true,
      provisionVMAgent: true,
      ssh: {
        publicKeys: [{
          path: `/home/${adminUsername}/.ssh/authorized_keys`,
          keyData: sshPublicKey,
        }],
      },
    },
  }
}

function waitForTcp(host, port, timeoutMs) {
  if (!host || !port || timeoutMs <= 0) return Promise.resolve(false)
  const deadline = Date.now() + timeoutMs
  return new Promise((resolve) => {
    const attempt = () => {
      const socket = net.createConnection({ host, port: Number(port), timeout: 2500 })
      let done = false
      const finish = (ok) => {
        if (done) return
        done = true
        socket.destroy()
        if (ok) return resolve(true)
        if (Date.now() >= deadline) return resolve(false)
        setTimeout(attempt, 2000)
      }
      socket.once('connect', () => finish(true))
      socket.once('timeout', () => finish(false))
      socket.once('error', () => finish(false))
    }
    attempt()
  })
}

export async function provisionAzureVm({ sessionId, userId, labId, expiresAt, def }) {
  const { compute, network } = getClients()
  const resourceGroup = String(def.resource_group || RESOURCE_GROUP)
  const location = String(def.location || LOCATION)
  const subnetId = String(def.subnet_id || SUBNET_ID)
  const nsgId = String(def.network_security_group_id || LAB_NSG_ID)
  required('AZURE_LAB_NSG_ID', nsgId)
  const suffix = sessionId.replace(/-/g, '').slice(0, 12)
  const vmName = `${VM_PREFIX}-${suffix}`.slice(0, 64)
  const nicName = `${vmName}-nic`.slice(0, 80)
  const osDiskName = `${vmName}-os`.slice(0, 80)
  const vmSize = String(def.vm_size || DEFAULT_VM_SIZE)
  const diskSku = String(def.disk_sku || DEFAULT_DISK_SKU)

  const tags = {
    fortify_managed: 'true',
    fortify_session: safeTag(sessionId),
    fortify_lab: safeTag(labId),
    fortify_user: safeTag(userId),
    fortify_expires_at: safeTag(expiresAt),
  }

  let nic = null
  try {
    nic = await network.networkInterfaces.beginCreateOrUpdateAndWait(resourceGroup, nicName, {
      location,
      tags,
      enableIPForwarding: false,
      networkSecurityGroup: { id: nsgId },
      ipConfigurations: [{
        name: 'ipconfig1',
        privateIPAllocationMethod: 'Dynamic',
        subnet: { id: subnetId },
      }],
    })

    const nicId = required('Azure NIC id', nic.id)
    const targetIp = required('Azure NIC private IP', nic.ipConfigurations?.[0]?.privateIPAddress)

    const vm = {
      location,
      tags,
      hardwareProfile: { vmSize },
      storageProfile: {
        imageReference: imageReference(def),
        osDisk: {
          name: osDiskName,
          createOption: 'FromImage',
          caching: 'ReadWrite',
          managedDisk: { storageAccountType: diskSku },
        },
      },
      networkProfile: {
        networkInterfaces: [{ id: nicId, primary: true }],
      },
    }
    const profile = osProfile(def, vmName)
    if (profile) vm.osProfile = profile

    await compute.virtualMachines.beginCreateOrUpdateAndWait(resourceGroup, vmName, vm)

    const readyPort = Number(def.ready_port || def.port || 0)
    if (readyPort > 0 && def.wait_for_port !== false) {
      await waitForTcp(targetIp, readyPort, Math.max(15, Number(def.ready_timeout_seconds || READY_TIMEOUT_SECONDS)) * 1000)
    }

    return {
      provider: 'azure',
      resourceGroup,
      location,
      vmName,
      nicName,
      osDiskName,
      targetIp,
      vmSize,
    }
  } catch (error) {
    await compute.virtualMachines.beginDeleteAndWait(resourceGroup, vmName).catch(() => {})
    await network.networkInterfaces.beginDeleteAndWait(resourceGroup, nicName).catch(() => {})
    await compute.disks.beginDeleteAndWait(resourceGroup, osDiskName).catch(() => {})
    throw error
  }
}

export async function destroyAzureVm(azure) {
  if (!azure?.vmName) return false
  const { compute, network } = getClients()
  const resourceGroup = String(azure.resourceGroup || RESOURCE_GROUP)

  // Delete VM first so NIC and managed OS disk are no longer attached.
  await compute.virtualMachines.beginDeleteAndWait(resourceGroup, String(azure.vmName)).catch(() => {})
  if (azure.nicName) await network.networkInterfaces.beginDeleteAndWait(resourceGroup, String(azure.nicName)).catch(() => {})
  if (azure.osDiskName) await compute.disks.beginDeleteAndWait(resourceGroup, String(azure.osDiskName)).catch(() => {})
  return true
}

export async function checkAzureAccess() {
  const { compute } = getClients()
  let seen = 0
  for await (const _vm of compute.virtualMachines.list(RESOURCE_GROUP)) {
    seen += 1
    if (seen >= 3) break
  }
  return { ok: true, resource_group: RESOURCE_GROUP, visible_vms_sampled: seen }
}

export async function cleanupExpiredAzureResources(now = Date.now()) {
  if (!azureConfigurationStatus().configured) return { scanned: 0, removed: 0 }
  const { compute } = getClients()
  let scanned = 0
  let removed = 0

  for await (const vm of compute.virtualMachines.list(RESOURCE_GROUP)) {
    if (vm.tags?.fortify_managed !== 'true') continue
    scanned += 1
    const expiry = Date.parse(String(vm.tags?.fortify_expires_at || ''))
    if (!Number.isFinite(expiry) || expiry > now) continue

    const nicId = vm.networkProfile?.networkInterfaces?.[0]?.id || ''
    const nicName = String(nicId).split('/').filter(Boolean).pop() || null
    const osDiskName = vm.storageProfile?.osDisk?.name || null
    await destroyAzureVm({
      vmName: vm.name,
      nicName,
      osDiskName,
      resourceGroup: RESOURCE_GROUP,
    }).catch(() => {})
    removed += 1
  }

  return { scanned, removed }
}
