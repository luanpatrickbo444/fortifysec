# Validation — FortifySec V7.12.1

Base visual and functional code: V7.12.

## Menu-only correction
- `app/painel/layout.tsx` remains unchanged and is the only shared owner of `DashboardShell` for `/painel/*`.
- Explicit pass-through layouts exist for: cursos, labs, desafios, ctf, ranking, perfil, pagamentos.
- These child layouts do not render `DashboardShell`.

## Confirmed unchanged from V7.12
- `app/globals.css`
- `components/DashboardShell.tsx`
- `components/SiteHeader.tsx`
- `app/layout.tsx`
- `app/painel/layout.tsx`

No database migration required.
