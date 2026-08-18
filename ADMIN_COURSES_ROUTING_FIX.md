# FortifySec — Admin Courses Routing Fix

Base: commit b3180be7861bc5fefe521b1bb6676730add563d3 (v8.5.6)

No auth, Supabase SSR, Node runtime, CTF, GCP Range or company logic was changed.

Canonical routes:
- /admin?view=courses
- /admin?view=course&course=<UUID>

Legacy compatibility:
- /admin/cursos -> /admin?view=courses
- /admin/content-studio -> /admin?view=courses
- /admin/cursos/:id -> /admin?view=course&course=:id
- /admin/content-studio/:id -> /admin?view=course&course=:id

Reason: use the already-stable /admin filesystem route for the complete Course Studio and avoid the nested segment that was returning production 404.
