# FortifySec — Cyber Range local (Docker Desktop)

Esta versão adiciona um provider `local_docker` para desenvolver e validar o Cyber Range na própria máquina antes da migração para Google Cloud.

## Arquitetura local

```text
Browser -> Next.js localhost:3000
              |
              | POST /sessions (Server Action)
              v
      Range Provider localhost:8787
              |
              v
         Docker Desktop
              |
       container por sessão
              |
       127.0.0.1:porta_aleatoria
```

O contrato do FortifySec continua o mesmo: `POST /sessions` cria o alvo e `DELETE /sessions/:id` encerra os recursos. O backend `local_docker` pode ser trocado futuramente por `gcp_vm` sem mudar as telas, matrículas, CTF ou a tabela `lab_sessions`.

## 1. Requisitos no Windows

- Node.js 20.9+
- Docker Desktop em execução
- FortifySec rodando localmente
- Supabase configurado no `.env.local` da aplicação

Teste o Docker:

```powershell
docker version
docker run --rm hello-world
```

## 2. Configurar o Range Provider

No PowerShell:

```powershell
cd range-provider
Copy-Item .env.local.example .env
npm run check
npm run start:local
```

O provider ficará em `http://127.0.0.1:8787`.

Teste:

```powershell
curl.exe http://127.0.0.1:8787/health
curl.exe -H "Authorization: Bearer fortify-local-dev-change-me" http://127.0.0.1:8787/health/local
```

## 3. Configurar a aplicação FortifySec

No `.env.local` da raiz:

```env
LAB_PROVIDER_API_URL=http://127.0.0.1:8787
LAB_PROVIDER_API_KEY=fortify-local-dev-change-me
```

Depois:

```powershell
npm install
npm run dev
```

## 4. Cadastrar o Lab no Admin

No painel `/admin/labs`, crie/edite um Lab e use:

```text
Provider Lab ID: web-juice-01
```

O ID precisa existir em `range-provider/labs.local.json`.

## 5. Fluxo de teste

1. Entre como aluno com matrícula ativa.
2. Abra `/painel/labs`.
3. Abra o Lab com `provider_lab_id = web-juice-01`.
4. Clique em `INICIAR LAB`.
5. O Range Provider cria um container isolado e retorna uma URL como `http://127.0.0.1:49172`.
6. Clique em `ABRIR TARGET`.
7. Clique em `ENCERRAR SESSÃO` para remover container e rede.

Também funciona quando o Lab está vinculado a um Challenge/CTF: o botão `INICIAR ALVO + VPN` continua provisionando a sessão, mas no modo local a interface mostra `ABRIR TARGET` e não exibe um download WireGuard inexistente.

## 6. Comandos úteis

```powershell
# containers ativos do Range
docker ps --filter "label=fortify.session"

# redes locais do Range
docker network ls --filter "name=fortify_local_"

# parar/remover manualmente um alvo, se necessário
docker rm -f NOME_DO_CONTAINER
```

## Próxima etapa: Google Cloud

O próximo provider será `gcp_vm`. Ele preservará o mesmo formato de resposta:

```json
{
  "session_id": "uuid",
  "connection_url": "...",
  "vpn_download_url": "...",
  "target_address": "10.x.x.x",
  "expires_at": "..."
}
```

No Google Cloud, o Range Provider criará Compute Engine VMs privadas, aplicará firewall/labels/TTL e entregará acesso restrito por VPN. A aplicação Next.js não precisará ser reescrita.
