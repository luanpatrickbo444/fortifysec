# FortifySec v8.5.7 — Auth / Routing Stability

Changes:
- @supabase/ssr 0.12.4
- @supabase/supabase-js 2.111.0
- Node.js 22 pinned for compatibility with current Supabase JS
- Proxy reduced to Supabase session refresh only
- Proxy uses auth.getClaims()
- New @supabase/ssr cache headers propagated to Vercel response
- Compatibility redirects moved to next.config.ts
- Protected surfaces receive Cache-Control: private, no-store
- /admin and /empresa get force-dynamic layouts
- SiteHeader no longer mounts browser auth observers inside /admin, /painel, /empresa or /curso
- Auth foundation build guard added
