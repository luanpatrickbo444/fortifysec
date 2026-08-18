# FortifySec v8.5.9 — Public Root Stable

## Problema corrigido
A v8.5.7/v8.5.8 passou a responder páginas públicas com `307 -> /login`.
Os logs da Vercel mostravam `/login`, `/academy` e `/` terminando em `/login`, e o payload RSC apontava `NEXT_REDIRECT` no componente raiz.

## Correção
`app/layout.tsx` não acessa mais Supabase, cookies, sessão, `site_settings` ou `redirect()`.
O Root Layout público é síncrono e puramente estrutural.

Autenticação continua isolada nas superfícies protegidas:
- `/painel/*`
- `/admin/*`
- `/empresa/*`
- `/curso/*`

## Guard
`scripts/verify-public-root.mjs` falha o build se alguém reintroduzir auth/Supabase/redirect no Root Layout.
