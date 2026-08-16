# FortifySec V7.12.4 — CSS Asset Fix

Correção baseada na V7.12 original.

Mudanças deliberadas apenas para resolver o CSS 404 em produção:
- `app/globals.css` -> `app/fortifysec.css`
- `app/layout.tsx` importa `./fortifysec.css`
- comentário de revisão no CSS para forçar novo hash de asset
- `npm run build` usa `next build --webpack`

Nenhum componente visual, regra CSS, página, autenticação, lógica de Labs/Challenges ou banco foi redesenhado.
