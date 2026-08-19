# FortifySec — Aulas + Challenges + CTF Operations Fix

Correção mínima aplicada sobre a base estável.

## Arquivos alterados
- app/actions.ts
- app/admin/aulas/page.tsx
- app/admin/ctf/page.tsx
- app/admin/desafios/page.tsx

## NÃO alterados
- proxy.ts
- next.config.ts
- lib/supabase/*
- autenticação
- rotas do painel
- migrations SQL

## Correções
- Server Actions agora verificam `error` do Supabase em criação de Challenge, CTF, aula e vínculo CTF↔Challenge.
- CTF só mostra sucesso depois que o INSERT retorna um ID real.
- Challenge só mostra sucesso depois que o RPC retorna um ID real.
- Aula aceita posição vazia e calcula automaticamente a próxima posição do curso.
- Aula valida curso e módulo e mostra erro real quando o módulo não pertence ao curso.
- Página de aulas agrupa módulos por curso para evitar seleção errada.
- Página CTF avisa quando não há Challenges publicados.
- Vincular/remover Challenge do CTF agora verifica e exibe erros reais.

## Validação feita
- TypeScript transpile dos 4 arquivos: OK.
- scripts/verify-required-routes.mjs: 10 required routes OK.
- SHA-256 de `proxy.ts` e `next.config.ts` permaneceu idêntico ao baseline.
