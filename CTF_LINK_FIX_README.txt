FORTIFYSEC — CTF LINK SAFE FIX

Objetivo
- Corrigir o fluxo de vincular/desvincular Challenge em um CTF sem alterar rotas, CSS, autenticação, layouts ou schema.

Arquivo funcional alterado
- app/actions.ts

O que foi corrigido
- Vincular Challenge agora valida CTF e Challenge antes de gravar.
- O vínculo usa o Admin Client server-side após requireAdmin(), evitando falha silenciosa por RLS/RPC no vínculo.
- Erros passam a aparecer em /admin/ctf?erro=... em vez de somente nos logs.
- Sucesso redireciona para /admin/ctf?vinculado=1.
- Remover vínculo também retorna feedback e revalida a página do CTF do aluno.
- Criar CTF e atualizar status agora exibem feedback coerente com a tela já existente.

Não alterado
- proxy.ts
- next.config.ts
- app/layout.tsx
- app/admin/ctf/page.tsx
- CSS
- rotas
- Supabase migrations/schema
- login/admin login
- Labs/VM provider

Aplicação do PATCH
1. Substitua somente app/actions.ts.
2. npm run build
3. git add app/actions.ts
4. git commit -m "fix ctf challenge linking feedback"
5. git push origin main

Rollback
- Restaure somente a versão anterior de app/actions.ts.

Validação realizada
- TypeScript transpile: app/actions.ts OK.
- TypeScript transpile: app/admin/ctf/page.tsx OK.
- Route guard: 10 required routes OK.
- Comparação com a base SAFE anterior: somente app/actions.ts mudou.
