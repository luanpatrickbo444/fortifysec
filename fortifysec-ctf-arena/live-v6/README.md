# FortifySec Labs V6 — candidate, NOT deployed

This is a corrected candidate derived from V5, not a verified production release.

## Implemented
- Authenticated `/labs/desafios` and `/labs/ranking` using CTFd `/api/v1/challenges` and `/api/v1/scoreboard`.
- `/labs/live-attacks` SVG animated abstract traffic visualization and authenticated event feed, no fabricated attack locations.
- `/labs/perfil` redirect and `/labs/` responsive navigation patch.
- Local Unix datagram collector + SQLite retention and per-student filtering; systemd RuntimeDirectory and StateDirectory for persistence.
- Corrected plugin registration order: routes are registered before `load(app)` calls `app.register_blueprint`.

## IMPORTANT integration gaps before production
1. Verify CTFd API response format and authenticated user-mode/team-mode with real accounts.
2. Ensure collector DB is accessible to CTFd process, without world-readable permissions. Prefer dedicated group or narrowly scoped read-only mount; the collector currently creates mode 0640, owned by root. Docker image runs as `ctfd`, and no cross-host group mapping has been established. Do NOT chmod 666/777.
3. Confirm proxy-v2 is the actual traffic path, then instrument after_request safely and verify that events are delivered; do not append hooks blindly.
4. Add a read-only bind mount for `/var/lib/fortifysec-live/events.sqlite3` to the CTFd container, with parent directory traversal and UID/GID permissions tested. SQLite DB mode and WAL/journal behavior must be considered.
5. Existing ranking/desafios are dashboards; challenge-solving UI still lives at `/challenges`. The Live Attacks visual is an abstract animated network, not the requested full geographical globe.
6. Back up MariaDB, uploads, and Compose; validate image in isolated environment. Do not replace running CTFd without passing tests.

## Candidate build (Kali, inside project directory)
Extract zip, then:

```bash
docker build -f live-v6/Dockerfile.live-v5 -t fortifysec-ctf-ctfd:live-v6 live-v6
docker run --rm --entrypoint python fortifysec-ctf-ctfd:live-v6 -m py_compile /opt/CTFd/CTFd/plugins/fortifysec_labs_v5/__init__.py /opt/CTFd/CTFd/plugins/fortifysec_labs/__init__.py
```

Do not deploy until the above integration gaps are addressed. The `docker-compose.live-v5.yml` is a reference candidate only.
