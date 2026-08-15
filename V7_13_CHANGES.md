# FortifySec V7.13 — Sidebar definitiva

## Correção
- `app/painel/layout.tsx` virou pass-through e não cria sidebar.
- Novo `components/PanelSectionShell.tsx` centraliza a única sidebar das seções internas.
- Cada seção possui um único `layout.tsx`:
  - `/painel/cursos`
  - `/painel/labs`
  - `/painel/desafios`
  - `/painel/ctf`
  - `/painel/ranking`
  - `/painel/perfil`
  - `/painel/pagamentos`
- Rotas de detalhe de Labs e Challenges herdam o shell da seção e não criam outro menu.

## Resultado esperado
- Exatamente 1 menu lateral em qualquer rota `/painel/*`.
- Nenhum SQL novo.
