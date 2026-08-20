# FortifySec V9 — Cyber Range Production Core

Esta atualização é propositalmente **backend/additive**. Não altera `app/globals.css`, `components/DashboardShell.tsx`, `app/layout.tsx` nem as telas existentes de Academy/Labs/CTF.

## O que entra

- flag dinâmica por participante/sessão em CTF com Lab;
- rate limit de tentativas de flag;
- freeze opcional do leaderboard;
- quotas de sessões e TTL por plano;
- custo estimado por sessão;
- catálogo de templates de Lab;
- audit log do Range;
- skills verificadas + badges por solves reais;
- suporte a múltiplos Range Providers com seleção por capacidade;
- limite global e por usuário no provider;
- painel novo `/admin/range` para operação;
- botão administrativo para encerrar sessão ativa.

## Ordem de publicação

1. Faça backup do banco.
2. Execute **somente** `supabase/migrations/008_cyber_range_production_core.sql` no Supabase.
3. Configure `LAB_PROVIDER_API_URL` ou `LAB_PROVIDER_API_URLS` e `LAB_PROVIDER_API_KEY` na Vercel.
4. Atualize o Range Provider no gateway e configure `MAX_ACTIVE_SESSIONS` / `MAX_SESSIONS_PER_USER`.
5. Rode `npm run check` dentro de `range-provider/`.
6. Rode `npm run build` na aplicação principal.
7. Publique a aplicação.
8. Abra `/admin/range` e valide provider, templates, quotas e sessões.

## Compatibilidade

A função `submit_ctf_flag(uuid,uuid,text)` mantém a mesma assinatura. Challenges sem `dynamic_flag_enabled` continuam usando a flag estática. Challenges já vinculados a Lab são migrados para flag dinâmica automaticamente.

O provider continua aceitando o contrato antigo de `POST /sessions`; os campos de CTF são opcionais.

## Teste mínimo

1. Crie/tenha um Lab com `provider_lab_id` válido.
2. Crie Challenge ligado ao Lab.
3. Vincule ao CTF.
4. Coloque o CTF como `live` dentro da janela.
5. Entre com aluno e inicie o alvo.
6. Confirme uma linha em `lab_sessions` com `challenge_id`, `ctf_event_id` e `provider_session_id`.
7. Capture a flag no alvo e envie.
8. Confirme `ctf_solves`, `challenge_solves`, `ctf_flag_attempts` e atualização do ranking.
9. Encerre a sessão e confirme destruição no provider.
