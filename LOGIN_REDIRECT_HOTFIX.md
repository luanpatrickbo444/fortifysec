# FortifySec - Login Redirect Hotfix

Production symptom confirmed on Vercel:

- GET /login returned HTTP 307
- Location header was /login
- Next redirect digest was NEXT_REDIRECT;replace;/login;307;

This is a self-redirect loop.

Fix:
- app/layout.tsx is explicitly public and catches public settings failures.
- lib/site-settings.ts reads public settings with an anonymous Supabase client and does not touch authenticated cookies/session.
- proxy.ts has no redirects and skips auth refresh entirely on login/cadastro/recovery gateways.

Protected areas remain protected by their existing route-level guards (requireUser, requireAdmin, requireCompany).
