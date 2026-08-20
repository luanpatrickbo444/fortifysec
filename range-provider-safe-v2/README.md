# FortifySec Range Provider SAFE V2

Este provider usa o mesmo contrato que o FortifySec estável já chama (`POST /sessions` e `DELETE /sessions/:id`), então o frontend não precisa ser alterado.

## Proteções

- `MAX_ACTIVE_SESSIONS=100` por padrão.
- `MAX_SESSIONS_PER_USER=1` por padrão.
- TTL máximo e limpeza automática.
- Docker com rede interna, limites de memória/CPU/PIDs e `no-new-privileges`.
- GCP sem IPv4 público e acesso via WireGuard.
- Flag dinâmica `FORTIFY{...}` calculada por HMAC com user + session + lab.
- `/stats` autenticado para o painel `/admin/range` e para o gateway multi-node.

## Instalação

```bash
cp .env.example .env
cp labs.safe.example.json labs.json
npm install
npm run check
npm run start:env
```

Use em `.env` o MESMO segredo gerado pela migration 009:

```env
CTF_DYNAMIC_FLAG_SECRET=<segredo do Supabase>
MAX_ACTIVE_SESSIONS=100
MAX_SESSIONS_PER_USER=1
MAX_TTL_MINUTES=240
```

Para obter o segredo no Supabase SQL Editor:

```sql
select value from public.range_private_config where key='dynamic_flag_secret';
```

### Entrega da flag

- `local_docker`: variável de ambiente `FORTIFY_FLAG` dentro do container.
- `gcp_vm`: arquivo `/opt/fortify/flag` criado no boot da VM.

O template do laboratório pode usar esse valor como a flag esperada pelo serviço vulnerável.
