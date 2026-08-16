# FortifySec V8.2.1 — Admin Cursos Navigation Fix

- `/admin/cursos` already exists and is present in the Vercel route build.
- Admin sidebar navigation now uses native server navigation (`<a href>`), avoiding stale Next.js App Router state after deployments.
- Direct references to `/admin/cursos` from the admin dashboard, lesson library and course studio backlink also use native navigation.
- No CSS, database, auth role rules, employer flows, or student panel structure changed.
