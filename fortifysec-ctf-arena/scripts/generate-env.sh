#!/usr/bin/env bash
set -euo pipefail
if [[ -e .env ]]; then echo 'Arquivo .env ja existe; nao foi sobrescrito.'; exit 1; fi
cp .env.example .env
python3 - <<'PY2'
from pathlib import Path
import secrets
p=Path('.env')
s=p.read_text()
for name in ('DB_PASSWORD','DB_ROOT_PASSWORD','SECRET_KEY'):
    s=s.replace(f'{name}=CHANGE_ME_'+ ('LONG_RANDOM_SECRET_KEY' if name=='SECRET_KEY' else ('ROOT_PASSWORD' if name=='DB_ROOT_PASSWORD' else 'DB_PASSWORD')), f'{name}='+secrets.token_hex(32))
p.write_text(s)
PY2
chmod 600 .env
echo 'Arquivo .env gerado. Confira CTF_DOMAIN antes de producao.'
