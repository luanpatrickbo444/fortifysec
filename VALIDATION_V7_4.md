# FortifySec V7.4 — Validation

- `/` possui fallback direto para `AcademyPublic` em `app/page.tsx`.
- `next.config.ts` aplica rewrite `beforeFiles` de `/` para `/academy`, mantendo a URL `/`.
- `/planos` permanece rota separada; nenhum redirect automático da raiz para planos foi encontrado.
- 59 arquivos `.ts`/`.tsx` verificados por transpile de sintaxe: 0 erros.
- 0 imports locais ausentes.
- 35 páginas `page.tsx`.
- 0 conflitos de segmentos dinâmicos irmãos.
- Academy target confirmado com 37 cursos / 633h / grade curricular.

Observação: esta checagem não substitui `next build` executado pelo Vercel.
