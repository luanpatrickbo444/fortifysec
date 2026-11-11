#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p data
umask 077
printf '%s\n' 'Sincronizando nomes públicos do CTFd (somente leitura)...'
docker exec fortifysec-ctf-ctfd-1 python3 -c '
import json,sys
from CTFd import create_app
from CTFd.models import Users
app=create_app()
with app.app_context():
    data={str(u.id):u.name for u in Users.query.all() if u.name and u.type!="admin" and not u.hidden and not u.banned}
    print("FORTIFYSEC_USERS_JSON="+json.dumps(data,ensure_ascii=False))
' | python3 -c '
import json,sys,os
from pathlib import Path
lines=[line.split("FORTIFYSEC_USERS_JSON=",1)[1] for line in sys.stdin if line.startswith("FORTIFYSEC_USERS_JSON=")]
if len(lines)!=1: raise SystemExit("Falha na sincronizacao dos usuarios; arquivo anterior preservado")
data=json.loads(lines[0]); assert isinstance(data,dict)
p=Path("data/users.json.tmp"); p.write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding="utf-8"); p.chmod(0o600); os.replace(p,"data/users.json")
print("Usuarios elegiveis:",len(data))
'
printf '%s\n' 'Criando snapshot consistente das conclusões (origem somente leitura)...'
sudo python3 - <<'PY'
import os,sqlite3
from pathlib import Path
src='/var/lib/fortifysec-labs/solves.sqlite3'
dest=Path('data/solves.sqlite3').resolve()
tmp=dest.with_name('solves.sqlite3.tmp')
if not Path(src).is_file():
    raise SystemExit('Banco de origem ausente; snapshot anterior preservado')
try:
    with sqlite3.connect(f'file:{src}?mode=ro',uri=True) as origin:
        with sqlite3.connect(str(tmp)) as target:
            origin.backup(target)
            count=target.execute('SELECT COUNT(*) FROM solves').fetchone()[0]
    os.chmod(tmp,0o600)
    os.chown(tmp,int(os.environ.get('SUDO_UID',os.getuid())),int(os.environ.get('SUDO_GID',os.getgid())))
    os.replace(tmp,dest)
    print('Conclusoes sincronizadas:',count)
finally:
    if tmp.exists(): tmp.unlink()
PY
printf '%s\n' 'Sincronização concluída. Nenhum banco original foi modificado.'
