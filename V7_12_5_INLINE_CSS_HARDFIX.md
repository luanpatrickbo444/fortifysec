# FortifySec V7.12.5 — Inline CSS Hardfix

- Base: V7.12 original.
- O CSS visual é exatamente o conteúdo de `app/globals.css`.
- O layout raiz não depende mais de um asset `.css` externo.
- O CSS é renderizado em `<style data-fortifysec-css="v7.12.5-inline">` diretamente no HTML.
- `app/painel/layout.tsx` permanece o layout único que monta `DashboardShell`.
- Build voltou para `next build` (Turbopack), pois o CSS não depende mais do bundler.
