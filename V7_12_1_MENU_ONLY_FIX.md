# FortifySec V7.12.1 — Menu-only fix

Base: V7.12 unchanged.

Only correction:
- `app/painel/layout.tsx` remains the single owner of `DashboardShell`.
- Every student sub-area gets an explicit pass-through `layout.tsx` to overwrite stale nested layouts from prior deployments.
- No CSS, visual components, page content, auth, pricing, profile, labs, challenges, database, or admin code was changed.

Expected result:
- `/dashboard`: 1 sidebar (page-owned, as in V7.12).
- `/painel/cursos`: 1 sidebar.
- `/painel/labs`: 1 sidebar.
- `/painel/desafios`: 1 sidebar.
- `/painel/ctf`: 1 sidebar.
- `/painel/ranking`: 1 sidebar.
- `/painel/perfil`: 1 sidebar.
- `/painel/pagamentos`: 1 sidebar.
