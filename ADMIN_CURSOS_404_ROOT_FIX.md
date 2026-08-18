# FortifySec v8.5.5 — Admin Cursos 404 root fix

Production evidence showed `/admin` returning 200 for the authenticated admin session while `/admin/cursos` returned 404, even though `/admin/cursos` existed in the Next.js production route manifest.

Fix:
- `/admin/content-studio` is now the canonical course-management route.
- `/admin/content-studio/[id]` is the canonical course-detail studio route.
- `/admin/cursos` and `/admin/cursos/[id]` are compatibility URLs that issue real HTTP 307 redirects in `proxy.ts` before Supabase/session handling.
- Removed the `next.config.ts` rewrite that hid `/admin/content-studio` behind `/admin/cursos`.
- Admin navigation, dashboard links, lesson library links and server-action return paths now use the canonical route.
- Legacy route pages also redirect as defense in depth.
- Both canonical admin routes are `force-dynamic` with `revalidate = 0`.
