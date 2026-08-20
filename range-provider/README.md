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

## V9 — capacidade, multi-provider e flags dinâmicas

O provider agora expõe no `GET /health` também `max_sessions`, `available_slots` e `max_sessions_per_user`. Configure:

```env
MAX_ACTIVE_SESSIONS=100
MAX_SESSIONS_PER_USER=2
```

Na Vercel, é possível usar mais de um gateway:

```env
LAB_PROVIDER_API_URLS=https://range-a.fortifysec.com.br,https://range-b.fortifysec.com.br
LAB_PROVIDER_API_KEY=...
```

O backend consulta a saúde dos gateways e escolhe o menos carregado. O endereço do gateway usado é salvo na sessão para que o encerramento aconteça no mesmo provider.

Para Challenges de CTF com Lab, a V9 pode gerar uma flag única por participante/sessão. Em `local_docker` ela é injetada como `FORTIFY_FLAG`. Em `gcp_vm`, o bootstrap grava a flag no arquivo configurado por `dynamic_flag_path` (padrão `/opt/fortify/flag.txt`) e o provider remove o valor sensível do metadata antes de entregar a VPN ao aluno.

Exemplo de definição:

```json
{
  "linux-privesc-01": {
    "provider": "gcp_vm",
    "source_image": "projects/PROJETO/global/images/fortify-linux-privesc-v1",
    "machine_type": "e2-small",
    "dynamic_flag_path": "/root/flag.txt",
    "dynamic_flag_mode": "0600",
    "estimated_cost_cents_per_hour": 8,
    "ttl_minutes": 90
  }
}
```
