# FortifySec V9.1 SAFE — Cyber Range Production Core

Esta versão parte da base visual estável e adiciona somente backend/Range e rotas novas.

## Arquivos visuais preservados

NÃO foram alterados:
- `app/globals.css`
- `app/layout.tsx`
- `components/DashboardShell.tsx`
- `app/admin/ctf/page.tsx`
- `app/admin/desafios/page.tsx`

Também não foi alterado `package.json`.

## O que entra nesta versão

- Flags dinâmicas por usuário/sessão em CTFs com Lab.
- Anti-replay: flag dinâmica válida é marcada como usada após o solve.
- Rate limit de tentativas por Challenge/CTF.
- Freeze opcional do leaderboard.
- Quotas de Cyber Range por plano.
- Limite lógico do provider: até 100 sessões ativas e 1 sessão por usuário por padrão.
- TTL e franquia mensal.
- Auditoria de provisionamento/parada/falha.
- Estimativa de custo por sessão.
- Multi-provider com escolha do provider menos carregado.
- Provider GCP com VM privada, sem IPv4 público e sem service account anexada.
- WireGuard por sessão para GCP.
- Provider Docker local isolado para desenvolvimento/teste.
- Skills verificadas por Challenge e badges automáticas.
- `/admin/range` — novo painel operacional.
- `/painel/conquistas` — Skills & Badges do aluno.

## Ordem de aplicação

### 1. Supabase primeiro

Execute no SQL Editor:

`supabase/migrations/008_cyber_range_production_core_safe.sql`

A migration é aditiva/idempotente. Se a migration da V9 anterior chegou a ser aplicada antes do revert visual, esta versão pode ser executada novamente para alinhar as funções e defaults.

### 2. Aplicar o patch no projeto

Na raiz do FortifySec:

```powershell
Expand-Archive .\FortifySec_V9_1_SAFE_RANGE_PATCH.zip -DestinationPath . -Force
```

### 3. Vercel

As variáveis da aplicação web são:

```env
LAB_PROVIDER_API_URL=https://range.fortifysec.com.br
LAB_PROVIDER_API_KEY=USE_O_MESMO_SEGREDO_DO_PROVIDER
```

Opcionalmente, para vários providers:

```env
LAB_PROVIDER_API_URLS=https://range-01.fortifysec.com.br,https://range-02.fortifysec.com.br
LAB_PROVIDER_API_KEY=USE_O_MESMO_SEGREDO_DO_PROVIDER
```

`MAX_ACTIVE_SESSIONS` NÃO fica na Vercel. Ele pertence ao servidor Range.

### 4. Servidor Range

Exemplo:

```env
PROVIDER_API_KEY=USE_O_MESMO_SEGREDO_DA_VERCEL
MAX_ACTIVE_SESSIONS=100
MAX_SESSIONS_PER_USER=1
MAX_TTL_MINUTES=240
```

O provider disponibiliza:
- `GET /healthz` — health mínimo público.
- `GET /health` — capacidade detalhada, exige Bearer token.
- `POST /sessions` — cria sessão, exige Bearer token.
- `DELETE /sessions/:id` — destrói sessão, exige Bearer token.

### 5. Build e deploy

```powershell
npm install
npm run build
git status
git add .
git commit -m "feat: FortifySec V9.1 safe cyber range"
git push origin main
```

## Fluxo final

`Aluno -> CTF -> Challenge -> Iniciar alvo -> FortifySec gera flag dinâmica -> Range Provider cria VM/container -> VPN/alvo -> aluno resolve -> submit_ctf_flag -> pontos/skill/badge -> sessão encerrada/destruída`

## Observação sobre Templates

`lab_templates` é o catálogo operacional/financeiro dentro do Supabase. O `provider_lab_id` deve corresponder ao ID do Lab configurado no arquivo de catálogo do Range Provider (`labs.gcp.json` / arquivo definido em `LABS_FILE`). Isso mantém o provider independente do painel web e evita que uma escrita no banco altere diretamente o host de execução.
