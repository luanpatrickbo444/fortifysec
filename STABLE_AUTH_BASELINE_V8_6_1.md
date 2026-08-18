# FortifySec v8.6.1 — Stable Auth Baseline

This release restores the shared authentication/routing shell from v8.5.6, the last deployment verified to return HTTP 200 for `/login`.

Restored baseline files:
- `app/layout.tsx`
- `app/login/page.tsx`
- `app/admin/login/page.tsx`
- `app/empresa/login/page.tsx`
- `components/SiteHeader.tsx`
- `proxy.ts`
- `next.config.ts`
- `lib/supabase/server.ts`
- `lib/auth.ts`
- dependency/runtime behavior in `package.json`

Later product features remain in place: Content Studio, Employer Job Console, CTF fixes, GCP Range provider and related database/application work.
