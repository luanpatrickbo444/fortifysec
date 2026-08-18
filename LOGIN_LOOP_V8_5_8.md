# FortifySec v8.5.8 — Login loop hard fix

## Problem confirmed in production
`GET /login` returned HTTP 307 with `Location: /login`, producing `ERR_TOO_MANY_REDIRECTS`.

## Changes
- Proxy is now scoped only to protected application surfaces.
- `/login` and other public pages no longer initialize Supabase SSR in Proxy.
- `/admin/login` and `/empresa/login` explicitly bypass Proxy session refresh.
- Global `SiteHeader` is presentation-only and performs no Supabase auth calls.
- `requireAdmin()` now redirects anonymous admin traffic to `/admin/login`, not `/login`.
- Login gateways are force-dynamic/no-store.
- Added `verify-login-boundary.mjs` build guard.
