# FortifySec Live Attacks — safe integration staging

This is a **staging component**, not a complete deployment. `telemetry.py` is a best-effort event emitter. It sends minimal per-request metadata to a local Unix datagram socket, never to the internet. No user IDs, URLs, IPs, request bodies, cookies or credentials are emitted.

The collector, authenticated CTFd endpoint, visual map, access controls and production deployment are **not included** yet. Do not activate the emitter before setting up and testing a collector and checking the socket permissions.

Suggested insertion into `server.py` only after a collector exists:

- `from telemetry import emit_lab_request` near imports.
- `started = time.monotonic()` immediately before `requests.request(...)`.
- `emit_lab_request(student, upstream.status_code, (time.monotonic()-started)*1000)` after the upstream response has been read successfully, before returning the Flask response.

No change to the CTFd scoreboard, Manager, flags, or original databases is needed.
