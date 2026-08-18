# FortifySec — correção /admin/cursos — base 920713 / v8.5.4

## Causa
O projeto já possui as rotas reais:
- app/admin/cursos/page.tsx
- app/admin/cursos/[id]/page.tsx

Porém `next.config.ts` continha um rewrite `beforeFiles`:

- source: `/admin/cursos`
- destination: `/admin/content-studio`

Como `beforeFiles` roda antes das rotas do filesystem/App Router, o Next não chegava na página real de `/admin/cursos`.

## Correção
Foi removido somente o rewrite `/admin/cursos -> /admin/content-studio`.
O rewrite `/ -> /academy` foi preservado.
`proxy.ts` foi preservado sem redirects.
Nenhuma alteração de autenticação, Supabase, actions ou layout foi feita.
