# Validation V7.12

- `app/painel/layout.tsx` é o único arquivo sob `app/painel` que referencia `DashboardShell`.
- `app/painel/labs/layout.tsx` é pass-through (`return children`).
- `app/painel/desafios/layout.tsx` é pass-through (`return children`).
- Nenhuma migration nova é necessária.
- A correção foi feita especificamente para neutralizar layouts antigos que podem permanecer no GitHub quando versões são copiadas por sobreposição.
