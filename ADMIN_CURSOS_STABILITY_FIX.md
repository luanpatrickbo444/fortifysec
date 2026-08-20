# FortifySec v8.5.4 — Admin Cursos Stability Fix

- `/admin/cursos` remains the public/admin URL.
- Added internal route `/admin/content-studio` as a stable rewrite target.
- Exact rewrite: `/admin/cursos` -> `/admin/content-studio` (browser URL is preserved).
- Internal alias is `force-dynamic` with `revalidate = 0`.
- `/admin/cursos/[id]` remains unchanged.
- Route guard now verifies `/admin/cursos`, `/admin/cursos/[id]`, and `/admin/content-studio` in addition to the existing protected routes.
- No database schema, Supabase policies, course actions, GCP provider, CTF flow, or visual CSS changed.


