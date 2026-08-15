# Clean deploy — V7.17

This version intentionally has no prebuild script that edits files.

Critical files:
- `app/layout.tsx` — root HTML layout and `import './globals.css'`
- `app/painel/layout.tsx` — one `DashboardShell`, no CSS import
- `app/globals.css` — complete visual stylesheet

When updating an existing repository, replace these files exactly and use `git add -A` so old layouts are overwritten/removed.
