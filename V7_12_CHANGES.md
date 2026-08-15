# FortifySec V7.12 — Single Sidebar Fix

- Mantém `app/painel/layout.tsx` como o único layout responsável pelo `DashboardShell`.
- `app/painel/labs/layout.tsx` agora é pass-through e não cria sidebar própria.
- `app/painel/desafios/layout.tsx` agora é pass-through e não cria sidebar própria.
- Isso neutraliza arquivos de layout herdados da V7.10 mesmo quando o repositório é atualizado por sobreposição.
- Nenhuma migration nova é necessária.
