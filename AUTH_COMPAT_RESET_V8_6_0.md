# FortifySec v8.6.0 — Auth compatibility reset

This release keeps the current routes/features, but rolls only the Supabase SSR
auth foundation back to the last known-good dependency contract used by v8.5.6.

Key changes:
- @supabase/ssr pinned to 0.7.0
- @supabase/supabase-js pinned to 2.57.4
- protected-only Proxy matcher
- 0.7.x `setAll(cookiesToSet)` cookie contract restored
- `auth.getUser()` refresh restored in Proxy
- public RootLayout remains completely auth-free
- no-store headers limited to protected surfaces
- build guard prevents accidental partial migration back to the broken auth mix

The CTF, GCP Range, Content Studio and Employer Job Console code is retained.
