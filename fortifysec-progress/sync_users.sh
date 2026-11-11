#!/usr/bin/env bash
set -euo pipefail

cd "$HOME/Documents/fortifysec/fortifysec-progress"
mkdir -p data
umask 077

docker exec fortifysec-ctf-ctfd-1 python3 -c '
import json
import sys
from CTFd import create_app
from CTFd.models import Users

app = create_app()

with app.app_context():
    users = Users.query.filter_by(
        hidden=False,
        banned=False
    ).all()

    result = {
        str(u.id): u.name
        for u in users
        if u.name and u.type != "admin"
    }

    sys.stdout.write(
        "FORTIFYSEC_USERS_JSON=" +
        json.dumps(result, ensure_ascii=False) +
        "\n"
    )
' | python3 -c '
import json
import sys
from pathlib import Path

prefix = "FORTIFYSEC_USERS_JSON="
lines = [
    line[len(prefix):]
    for line in sys.stdin
    if line.startswith(prefix)
]

if len(lines) != 1:
    raise SystemExit("Erro: resposta de usuários inválida")

users = json.loads(lines[0])
target = Path("data/users.json")
temporary = Path("data/users.json.tmp")

temporary.write_text(
    json.dumps(users, ensure_ascii=False, indent=2)
)
temporary.chmod(0o600)
temporary.replace(target)

print("Usuários sincronizados:", len(users))
'
