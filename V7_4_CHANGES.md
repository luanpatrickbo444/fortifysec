# FortifySec V7.4 — Home Academy hard-fix

## Correção principal

A rota pública `/` agora possui duas garantias para sempre mostrar a Academy:

1. `app/page.tsx` renderiza diretamente `AcademyPublic`.
2. `next.config.ts` aplica um `beforeFiles` rewrite de `/` para `/academy`, mantendo a URL `/` no navegador.

Também foi aplicado `Cache-Control: no-store, max-age=0` na raiz para evitar conteúdo antigo do deployment/CDN.

A página de Planos continua exclusivamente em `/planos` e nenhum redirect `/ -> /planos` existe no projeto.
