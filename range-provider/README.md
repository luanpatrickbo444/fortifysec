# FortifySec Range Provider — Google Cloud

Provider de Cyber Range compatível com o contrato atual do FortifySec:

- `GET /health`
- `GET /health/gcp` (Bearer)
- `POST /sessions` (Bearer)
- `DELETE /sessions/:id` (Bearer)
- `GET /vpn/:token` (token temporário)

## Produção

O processo roda no **gateway Compute Engine**, não na Vercel. A Vercel chama o provider por HTTPS. Cada sessão `gcp_vm` cria uma VM privada no Compute Engine, sem IP público, gera um peer WireGuard exclusivo e libera no gateway apenas o caminho `peer -> target /32`.

A VM do lab é criada sem service account anexada e sem `accessConfigs` na interface de rede. O disco de boot usa `autoDelete=true` e a sessão possui TTL. Um sweep adicional remove VMs FortifySec expiradas mesmo se o estado local do provider tiver sido perdido.

## Instalação no gateway

```bash
cp .env.example .env
cp labs.gcp.json labs.json
npm install --omit=dev
npm run check
sudo ./setup-gcp-gateway.sh
sudo systemctl enable --now fortify-range
```

Antes de iniciar, configure `GCP_PROJECT_ID`, `PUBLIC_BASE_URL`, `WG_ENDPOINT` e um `PROVIDER_API_KEY` forte.

## Desenvolvimento local

`local_docker` continua disponível apenas para desenvolvimento. Use `.env.local.example` e `labs.local.json`.

## HTTPS

Use `nginx-range.conf.example` como base para publicar somente HTTPS/443. O Node continua escutando em `127.0.0.1:8787`; a porta 8787 não precisa ficar aberta na VPC.
