# FortifySec v8.6.2 — Node 22 + Proxy Scope Fix

- Pins Node.js to `22.x` instead of `>=20.9.0` (which Vercel currently resolves to Node 24.x).
- Pins dependency versions for deterministic installs.
- Restricts `proxy.ts` to protected route families only.
- Public routes (`/`, `/academy`, `/login`, `/labs`, `/ctf`, `/planos`, etc.) never enter Proxy.
- Removes the redundant `/ -> /academy` rewrite; `app/page.tsx` already renders AcademyPublic.
- Moves legacy route redirects from Proxy to `next.config.ts`.
