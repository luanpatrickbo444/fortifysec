#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"
mkdir -p data
umask 077
OWNER="${FORTIFYSEC_PROGRESS_OWNER:?missing owner}"
GROUP="$(id -gn "$OWNER")"
# SQLite backup API safely snapshots WAL-enabled source without locking writers.
python3 - <<'PY2'
import os, sqlite3
from pathlib import Path
source=Path('/var/lib/fortifysec-labs/solves.sqlite3')
dest=Path('data/solves.sqlite3').resolve()
if not source.is_file():
    raise SystemExit('Missing manager database; old snapshot retained')
tmp=dest.with_name(dest.name+'.tmp')
try:
    with sqlite3.connect(f'file:{source}?mode=ro',uri=True,timeout=5) as db:
        with sqlite3.connect(str(tmp),timeout=5) as out:
            db.backup(out)
            out.execute('SELECT student,lab,solved_at FROM solves LIMIT 1').fetchall()
    os.chmod(tmp,0o600)
    os.replace(tmp,dest)
finally:
    if tmp.exists(): tmp.unlink()
PY2
chown "$OWNER:$GROUP" data/solves.sqlite3
# CTFd user snapshot at most once a minute; refresh is atomic.
NOW="$(date +%s)"
LAST=0
if [[ -f data/users-sync.timestamp ]]; then read -r LAST < data/users-sync.timestamp || true; fi
if (( NOW - LAST >= 60 )); then
  if docker exec fortifysec-ctf-ctfd-1 python3 -c '
import json
from CTFd import create_app
from CTFd.models import Users
app=create_app()
with app.app_context():
    data={str(u.id):u.name for u in Users.query.all() if u.name and u.type!="admin" and not u.hidden and not u.banned}
    print("FORTIFYSEC_USERS_JSON="+json.dumps(data,ensure_ascii=False))
' | python3 -c '
import json,os,sys
from pathlib import Path
prefix="FORTIFYSEC_USERS_JSON="
rows=[x[len(prefix):] for x in sys.stdin if x.startswith(prefix)]
if len(rows)!=1: raise SystemExit("Invalid user export")
data=json.loads(rows[0])
if not isinstance(data,dict): raise SystemExit("Invalid user data")
p=Path("data/users.json.tmp")
p.write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding="utf-8")
p.chmod(0o600)
os.replace(p,"data/users.json")
'; then
    chown "$OWNER:$GROUP" data/users.json
    printf '%s\n' "$NOW" > data/users-sync.timestamp
    chown "$OWNER:$GROUP" data/users-sync.timestamp
  else
    echo 'CTFd sync failed, keeping previous names' >&2
  fi
fi
