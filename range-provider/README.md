# FortifySec Range Provider — Docker + Azure VM

Esta versão mantém o contrato existente do FortifySec:

- `POST /sessions`
- `DELETE /sessions/:id`
- `GET /vpn/:token`
- `GET /health`

O frontend/Server Actions não precisa saber se o alvo é Docker ou Azure.

## Tipos de Lab

### Docker

```json
{
  "provider": "docker",
  "image": "bkimminich/juice-shop:latest"
}
```

### Azure VM

```json
{
  "provider": "azure",
  "os_type": "linux",
  "image": {
    "publisher": "Canonical",
    "offer": "ubuntu-24_04-lts",
    "sku": "server",
    "version": "latest"
  },
  "vm_size": "Standard_B2s"
}
```

Também aceita `image_id` com o Resource ID de uma imagem própria/Azure Compute Gallery.

## Como funciona um Lab Azure

1. O Range Provider recebe `POST /sessions`.
2. Cria uma NIC privada na subnet de Labs, sem Public IP.
3. Cria a VM Azure usando a imagem configurada.
4. Obtém o IP privado da NIC.
5. Cria um peer WireGuard exclusivo para o aluno.
6. A VPN anuncia somente `IP_DO_ALVO/32`.
7. O gateway permite apenas `peer -> alvo` e aplica SNAT de retorno.
8. A VM recebe tags com sessão, Lab, usuário e expiração.
9. `DELETE /sessions/:id` remove peer, regras, VM, NIC e OS disk.
10. Um sweep periódico remove VMs FortifySec expiradas mesmo se ficarem órfãs após reinício/falha.

## Autenticação Azure

Use **Managed Identity** na VM `fortify-range-01`.

Não grave `AZURE_CLIENT_SECRET` no `.env` se o provider estiver rodando no próprio Azure.
`DefaultAzureCredential` usa a Managed Identity automaticamente.

Para MVP, conceda `Contributor` somente no resource group dedicado ao Range. Depois podemos reduzir para roles mais específicas.

## Requisitos de rede

- Gateway subnet: por exemplo `10.80.0.0/24`.
- Labs subnet: por exemplo `10.80.16.0/20`.
- WireGuard: `10.77.0.0/16`.
- A NIC do gateway Azure precisa de **IP forwarding habilitado**.
- VMs de Lab não recebem Public IP.
- `AZURE_LAB_NSG_ID` é obrigatório no adapter.
- O NSG de Labs deve permitir entrada vinda do gateway e bloquear movimento lateral da VNet.
- Para imagens vulneráveis em produção, bloqueie também egress para Internet. Prepare as imagens antes e use Azure Compute Gallery.

## Instalação

```bash
sudo mkdir -p /opt/fortify-range
sudo cp -a range-provider/. /opt/fortify-range/
cd /opt/fortify-range
sudo cp .env.example .env
sudo cp labs.example.json labs.json
sudo chmod 600 .env
sudo ./setup-ubuntu.sh
sudo cp fortify-range.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now fortify-range
```

Verifique:

```bash
curl http://127.0.0.1:8787/health
curl -H "Authorization: Bearer $PROVIDER_API_KEY" http://127.0.0.1:8787/health/azure
```

## Vercel

Continuam as mesmas variáveis já usadas pelo projeto:

```env
LAB_PROVIDER_API_URL=https://range.fortifysec.com.br
LAB_PROVIDER_API_KEY=mesmo-segredo-do-provider
```

## Admin FortifySec

No campo `Provider Lab ID`, informe uma chave existente em `labs.json`:

- `web-juice-01`
- `azure-smoke-ubuntu`
- ou seu Lab customizado.

## Segurança

- Não exponha Docker API/TCP.
- Não exponha a Azure Management API através do provider.
- Não coloque Public IP nas VMs vulneráveis.
- Use um resource group dedicado para o Range.
- Mantenha o Bearer token do provider em segredo.
- Coloque a API do provider atrás de TLS/reverse proxy.
- Tailscale é apenas para administração; alunos usam WireGuard.
