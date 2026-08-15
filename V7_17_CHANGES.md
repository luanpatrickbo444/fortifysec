# FortifySec V7.17 — Clean Layout / CSS Fix

- Removed the automatic prebuild UI guard.
- Removed `app/painel/panel.css`; the panel uses the existing global stylesheet.
- `app/layout.tsx` is the only place importing `./globals.css`.
- `app/painel/layout.tsx` mounts exactly one `DashboardShell`.
- Section layouts are explicit pass-through files so stale layouts from older versions are overwritten.
- No database migration is required.
