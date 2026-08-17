# FortifySec — Azure Range Setup

## 1. Arquitetura usada pelo adapter

```text
FortifySec / Vercel
        |
        | POST /sessions
        v
fortify-range-01 (Ubuntu / Azure)
        |-- Range Provider
        |-- WireGuard 10.77.0.0/16
        |-- Docker para Labs leves
        |
        +---- Azure VNet 10.80.0.0/16
               |
               +-- snet-range-gateway 10.80.0.0/24
               |
               +-- snet-labs 10.80.16.0/20
                     |-- VM Lab A (sem Public IP)
                     |-- VM Lab B (sem Public IP)
                     +-- VM Lab C (sem Public IP)
```

## 2. Criar RG, VNet e subnets

No Azure Cloud Shell:

```bash
RG=rg-fortifysec-range
LOCATION=brazilsouth
VNET=vnet-fortifysec-range
GW_SUBNET=snet-range-gateway
LAB_SUBNET=snet-labs
LAB_NSG=nsg-fortify-labs
GW_VM=fortify-range-01

az group create \
  --name "$RG" \
  --location "$LOCATION"

az network vnet create \
  --resource-group "$RG" \
  --name "$VNET" \
  --location "$LOCATION" \
  --address-prefixes 10.80.0.0/16 \
  --subnet-name "$GW_SUBNET" \
  --subnet-prefixes 10.80.0.0/24

az network vnet subnet create \
  --resource-group "$RG" \
  --vnet-name "$VNET" \
  --name "$LAB_SUBNET" \
  --address-prefixes 10.80.16.0/20
```

## 3. NSG dedicado aos Labs

O adapter exige um NSG explícito e o associa a cada NIC de Lab.

```bash
az network nsg create \
  --resource-group "$RG" \
  --name "$LAB_NSG" \
  --location "$LOCATION"

# Permite que somente o gateway do Range inicie conexões aos Labs.
az network nsg rule create \
  --resource-group "$RG" \
  --nsg-name "$LAB_NSG" \
  --name allow-range-gateway \
  --priority 100 \
  --direction Inbound \
  --access Allow \
  --protocol '*' \
  --source-address-prefixes 10.80.0.0/24 \
  --source-port-ranges '*' \
  --destination-address-prefixes '*' \
  --destination-port-ranges '*'

# Bloqueia movimento lateral vindo de outras máquinas da VNet.
az network nsg rule create \
  --resource-group "$RG" \
  --nsg-name "$LAB_NSG" \
  --name deny-vnet-lateral \
  --priority 200 \
  --direction Inbound \
  --access Deny \
  --protocol '*' \
  --source-address-prefixes VirtualNetwork \
  --source-port-ranges '*' \
  --destination-address-prefixes '*' \
  --destination-port-ranges '*'
```

Para o primeiro `azure-smoke-ubuntu`, deixe egress de Internet habilitado para o cloud-init instalar nginx.
Antes de publicar imagens propositalmente vulneráveis, crie a imagem pronta no Azure Compute Gallery e bloqueie Internet egress no NSG/firewall.

Exemplo de endurecimento posterior:

```bash
az network nsg rule create \
  --resource-group "$RG" \
  --nsg-name "$LAB_NSG" \
  --name deny-lab-internet-egress \
  --priority 300 \
  --direction Outbound \
  --access Deny \
  --protocol '*' \
  --source-address-prefixes '*' \
  --source-port-ranges '*' \
  --destination-address-prefixes Internet \
  --destination-port-ranges '*'
```

## 4. Criar o gateway Ubuntu

```bash
az vm create \
  --resource-group "$RG" \
  --name "$GW_VM" \
  --location "$LOCATION" \
  --image Canonical:ubuntu-24_04-lts:server:latest \
  --size Standard_B2s \
  --vnet-name "$VNET" \
  --subnet "$GW_SUBNET" \
  --admin-username fortifyadmin \
  --generate-ssh-keys \
  --assign-identity
```

Essa é a única VM que precisa de Public IP no MVP. As VMs criadas pelo adapter não recebem Public IP.

## 5. Dar permissão Azure ao Range Provider

O adapter usa `DefaultAzureCredential`. Dentro da VM Azure ele autentica usando a Managed Identity, sem Client Secret.

```bash
SUBSCRIPTION_ID="$(az account show --query id -o tsv)"
RG_ID="$(az group show --name "$RG" --query id -o tsv)"
PRINCIPAL_ID="$(az vm identity show --resource-group "$RG" --name "$GW_VM" --query principalId -o tsv)"

az role assignment create \
  --assignee-object-id "$PRINCIPAL_ID" \
  --assignee-principal-type ServicePrincipal \
  --role Contributor \
  --scope "$RG_ID"
```

`Contributor` aqui fica limitado somente ao RG `rg-fortifysec-range`. Depois do MVP podemos substituir por funções RBAC mais restritas.

## 6. Habilitar Azure IP forwarding na NIC do gateway

Além de `net.ipv4.ip_forward=1` no Ubuntu, o Azure também precisa permitir que essa NIC trabalhe como encaminhador.

```bash
NIC_ID="$(az vm show --resource-group "$RG" --name "$GW_VM" --query 'networkProfile.networkInterfaces[0].id' -o tsv)"
NIC_NAME="${NIC_ID##*/}"

az network nic update \
  --resource-group "$RG" \
  --name "$NIC_NAME" \
  --ip-forwarding true
```

## 7. Obter os IDs usados no `.env`

```bash
SUBSCRIPTION_ID="$(az account show --query id -o tsv)"
LAB_SUBNET_ID="$(az network vnet subnet show --resource-group "$RG" --vnet-name "$VNET" --name "$LAB_SUBNET" --query id -o tsv)"
LAB_NSG_ID="$(az network nsg show --resource-group "$RG" --name "$LAB_NSG" --query id -o tsv)"

echo "AZURE_SUBSCRIPTION_ID=$SUBSCRIPTION_ID"
echo "AZURE_LAB_SUBNET_ID=$LAB_SUBNET_ID"
echo "AZURE_LAB_NSG_ID=$LAB_NSG_ID"
```

Copie esses valores para `/opt/fortify-range/.env`.

## 8. Instalar o adapter na VM

Copie `range-provider/` para a VM e execute:

```bash
sudo mkdir -p /opt/fortify-range
sudo cp -a range-provider/. /opt/fortify-range/
cd /opt/fortify-range

sudo cp .env.example .env
sudo cp labs.example.json labs.json
sudo chmod 600 .env
sudo ./setup-ubuntu.sh
sudo npm install --omit=dev

sudo cp fortify-range.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now fortify-range
sudo systemctl status fortify-range --no-pager
```

## 9. `.env` mínimo para Azure

```env
PORT=8787
PROVIDER_API_KEY=GERE_UM_SEGREDO_FORTE
PUBLIC_BASE_URL=https://range.fortifysec.com.br

WG_INTERFACE=wg0
WG_ENDPOINT=range.fortifysec.com.br:51820

AZURE_SUBSCRIPTION_ID=<valor>
AZURE_RESOURCE_GROUP=rg-fortifysec-range
AZURE_LOCATION=brazilsouth
AZURE_LAB_SUBNET_ID=<resource-id>
AZURE_LAB_NSG_ID=<resource-id>
AZURE_EGRESS_INTERFACE=eth0
AZURE_VM_SIZE_DEFAULT=Standard_B2s
AZURE_OS_DISK_SKU=StandardSSD_LRS
AZURE_ADMIN_USERNAME=fortifyadmin
AZURE_SSH_PUBLIC_KEY="ssh-ed25519 SUA_CHAVE_PUBLICA"
```

Nunca coloque a chave SSH privada nesse arquivo.

## 10. Testar acesso à Azure API

Na VM:

```bash
set -a
source /opt/fortify-range/.env
set +a

curl \
  -H "Authorization: Bearer $PROVIDER_API_KEY" \
  http://127.0.0.1:8787/health/azure
```

Esperado:

```json
{
  "ok": true,
  "resource_group": "rg-fortifysec-range"
}
```

## 11. Testar primeira VM pelo contrato real da FortifySec

```bash
curl -X POST \
  -H "Authorization: Bearer $PROVIDER_API_KEY" \
  -H "Content-Type: application/json" \
  http://127.0.0.1:8787/sessions \
  -d '{
    "user_id":"00000000-0000-0000-0000-000000000001",
    "lab_id":"azure-smoke-ubuntu",
    "ttl_minutes":30
  }'
```

O provider deve devolver:

```json
{
  "session_id": "...",
  "connection_url": "https://range.fortifysec.com.br/vpn/...",
  "vpn_download_url": "https://range.fortifysec.com.br/vpn/...",
  "target_address": "http://10.80.16.x:80",
  "expires_at": "..."
}
```

Depois destrua:

```bash
curl -X DELETE \
  -H "Authorization: Bearer $PROVIDER_API_KEY" \
  http://127.0.0.1:8787/sessions/SEU_SESSION_ID
```

Confirme no Azure que VM, NIC e OS disk foram removidos.

## 12. Vercel

Não muda o frontend. Mantenha:

```env
LAB_PROVIDER_API_URL=https://range.fortifysec.com.br
LAB_PROVIDER_API_KEY=O_MESMO_PROVIDER_API_KEY
```

No Admin > Cyber Labs, use `Provider Lab ID = azure-smoke-ubuntu` para o primeiro teste.
