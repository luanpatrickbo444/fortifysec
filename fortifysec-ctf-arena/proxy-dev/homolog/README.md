# FortifySec Homologation Gateway (prototype)

This is a **local-only** prototype. Do not expose it publicly until a dedicated HTTPS origin, upstream cookie handling, browser security testing, and a trusted CTFd ticket issuer are integrated. `mint.py` is a local diagnostic issuer, NOT a production authentication system. It does not authenticate the user; never expose it to users.

## Setup on Kali

```bash
cd ~/Documents/fortifysec/fortifysec-ctf-arena
mkdir -p proxy-dev/homolog
# Copy files from the downloaded package into proxy-dev/homolog/
python3 -m venv proxy-dev/homolog/.venv
proxy-dev/homolog/.venv/bin/pip install -r proxy-dev/homolog/requirements.txt
sudo install -d -m 0700 /var/lib/fortifysec-homolog-proxy
sudo touch /var/lib/fortifysec-homolog-proxy/tickets.sqlite3
sudo chmod 0600 /var/lib/fortifysec-homolog-proxy/tickets.sqlite3
```

Run **locally** with read access to the manager gateway key and manager socket, and write access to the SQLite database:

```bash
sudo env FS_HOMOLOG_SECRET_FILE=/etc/fortifysec-labs/gateway.key FS_GATEWAY_KEY_FILE=/etc/fortifysec-labs/gateway.key FS_HOMOLOG_DB=/var/lib/fortifysec-homolog-proxy/tickets.sqlite3 FS_MANAGER_SOCKET=/run/fortifysec-labs/manager.sock proxy-dev/homolog/.venv/bin/gunicorn --chdir proxy-dev/homolog --bind 127.0.0.1:19091 --workers 1 server:app
```

A local health check is available at `http://127.0.0.1:19091/health`. No browser login is possible until HTTPS reverse proxy and trusted ticket issuance are implemented.

For a **test student with an already running instance**, generate a 60-second one-time redemption path using:

```bash
sudo env FS_HOMOLOG_DB=/var/lib/fortifysec-homolog-proxy/tickets.sqlite3 python3 proxy-dev/homolog/mint.py ctfd-123
```

Do not paste the generated ticket into chats or logs. It is a bearer credential. Cookies are `Secure`, so redemption must occur via a dedicated HTTPS host, not plain HTTP. Session expiry is limited by the active lab expiry.

## Known limitations / release blockers

- Separate registrable domain is strongly preferred for deliberately vulnerable labs; a sibling subdomain alone is not a complete site isolation boundary.
- Upstream `Set-Cookie` is intentionally not forwarded; cookie-dependent challenges will not work until an isolated upstream-cookie jar is designed.
- No WebSocket or streaming support; large files are limited to 10 MiB.
- The local mint tool is for operator-only tests. Replace with a CTFd-authenticated, CSRF-protected, server-to-server ticket issuance flow before public use.
- The manager currently uses shared host Docker. Confirm instance-to-instance network isolation before allowing untrusted student workloads.
- Run an integration test with real active student instances before public deployment.
