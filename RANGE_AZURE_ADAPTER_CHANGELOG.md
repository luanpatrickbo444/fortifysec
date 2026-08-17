# FortifySec Range Azure Adapter

Escopo: somente `range-provider/`. Nenhum arquivo de auth, painel, planos, empresa, Mercado Pago ou Supabase foi alterado.

## Adicionado

- Provider híbrido `docker` + `azure`.
- `providers/azure.mjs` com Azure SDK oficial.
- Managed Identity via `DefaultAzureCredential`.
- Criação de NIC privada sem Public IP.
- Associação obrigatória de NSG dedicado aos Labs.
- Criação/destruição de Azure VM e OS disk.
- WireGuard com rota `/32` somente para o alvo Azure.
- Forward + SNAT restrito `peer -> target` no gateway.
- Tags de sessão/usuário/lab/expiração nos recursos Azure.
- Sweep de VMs Azure expiradas/orfãs.
- Reserva de slots para evitar colisão em provisionamentos concorrentes.
- Endpoint autenticado `GET /health/azure`.
- Exemplo `azure-smoke-ubuntu`.
- Suporte a `image_id` para Azure Compute Gallery.

## Contrato preservado

- `POST /sessions`
- `DELETE /sessions/:id`
- `GET /vpn/:token`
- `GET /health`

A aplicação Next.js continua usando `LAB_PROVIDER_API_URL` e `LAB_PROVIDER_API_KEY` sem alteração.
