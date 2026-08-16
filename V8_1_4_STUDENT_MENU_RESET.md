# FortifySec V8.1.4 — Student menu state reset

- `app/painel/layout.tsx` volta a ser o único responsável pelo `DashboardShell`.
- Todos os layouts internos do painel são pass-through.
- Corrige o estado acumulado V8.1.2 + V8.1.3 (pai neutro + filhos neutros).
- Nenhuma alteração visual, administrativa, empresarial ou SQL.
