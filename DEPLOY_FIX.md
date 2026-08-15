# Correção Vercel — rota dinâmica de curso

Erro corrigido:

`Ambiguous route pattern "/curso/[*]" matches multiple routes: /curso/[id] e /curso/[slug]`

A versão final usa somente:

`app/curso/[slug]/page.tsx`

A pasta antiga `app/curso/[id]` deve ser REMOVIDA do repositório GitHub, não apenas sobrescrita.

Se estiver usando Git:

```bash
git rm -r 'app/curso/[id]'
git add .
git commit -m "fix: remove ambiguous course route"
git push origin main
```

Depois faça um novo deploy no Vercel. Se estiver reaproveitando um deployment antigo, faça Redeploy sem usar o Build Cache.
