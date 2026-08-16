# FortifySec V8.1.2 — Student Shell hard fix

## Problema observado em produção
- `/dashboard` e `/admin/*` exibem o menu corretamente porque montam `DashboardShell` diretamente.
- As seções `/painel/*` dependiam exclusivamente de `app/painel/layout.tsx` e o menu não aparecia no deployment atual.

## Correção
- `app/painel/layout.tsx` agora é visualmente neutro/pass-through.
- Novo `components/PanelSectionShell.tsx` reutiliza o `DashboardShell` canônico sem adicionar classes/CSS.
- Cada seção monta exatamente um `PanelSectionShell`:
  - `/painel/cursos`
  - `/painel/labs`
  - `/painel/desafios`
  - `/painel/ctf`
  - `/painel/ranking`
  - `/painel/pagamentos`
  - `/painel/perfil`
- Rotas de detalhe herdam o shell da seção.

## Preservado
- `app/globals.css`: não alterado.
- `components/DashboardShell.tsx`: não alterado.
- `app/admin/**`: não alterado.
- `/dashboard`: não alterado.
- `/curso/[slug]`: não alterado.
- Nenhuma migration SQL.
