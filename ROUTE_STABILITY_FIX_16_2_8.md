# Route stability fix

- Next.js pinned to 16.2.8.
- Turbopack remains enabled (`next dev` / `next build`).
- Student dashboard navigation already uses native anchors.
- CTF, Labs and Challenges catalogue/detail transitions use native `<a href>` requests to avoid stale App Router state.
- `/painel/ctf`, `/painel/labs` and `/painel/desafios` remain `force-dynamic` with `revalidate = 0`.
- No CSS/layout files changed.
