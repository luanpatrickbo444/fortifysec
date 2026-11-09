#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
[[ $EUID -eq 0 ]] || { echo 'Use sudo bash deploy.sh'; exit 1; }
V2=/opt/fortifysec-labs-v2/labctl.py
V3=/opt/fortifysec-labs-v3/server.py
[[ -f "$V2" && -f "$V3" ]] || { echo 'Manager files missing'; exit 1; }
BACKUP="/opt/fortifysec-nightmare-backups/$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP"
cp -a "$V2" "$BACKUP/labctl.py"
cp -a "$V3" "$BACKUP/server.py"
for n in $(seq 16 25); do
  id=$(printf 'fs-%03d' "$n")
  docker build -q -t "fortifysec-nightmare-${id}:latest" . >/dev/null
  echo "Imagem pronta: $id"
done
python3 - "$V2" "$V3" <<'PATCH'
from pathlib import Path
import ast,sys
p,q=map(Path,sys.argv[1:]);a=p.read_text();b=q.read_text()
ids=[f'fs-{i:03d}' for i in range(16,26)]
if 'NIGHTMARE = ' not in a:
 marker='FLAGS_FILE = Path('
 assert a.count(marker)==1
 mapping='NIGHTMARE = {'+', '.join(repr(i)+': '+repr('fortifysec-nightmare-'+i) for i in ids)+'}\n'
 a=a.replace(marker,mapping+marker,1)
 old='image = IMAGES.get(args.lab) or PACK1[args.lab][0]'
 assert a.count(old)==1
 a=a.replace(old,'image = IMAGES.get(args.lab) or NIGHTMARE.get(args.lab) or PACK1[args.lab][0]',1)
 marker="    docker('image', 'inspect', image)"
 assert a.count(marker)==1
 a=a.replace(marker,"    if args.lab in NIGHTMARE:\n        extra_env = ['--env', 'LAB_ID=' + args.lab, '--env', 'LAB_FLAG=FORTIFY{' + secrets.token_hex(16) + '}']\n        internal_port = 8080\n"+marker,1)
 old='choices=tuple(IMAGES) + tuple(PACK1)'
 assert a.count(old)==1
 a=a.replace(old,'choices=tuple(IMAGES) + tuple(PACK1) + tuple(NIGHTMARE)',1)
if "'fs-016'" not in b:
 marker='MAX_ACTIVE = 10'
 assert b.count(marker)==1
 b=b.replace(marker,'LABS = LABS + ('+', '.join(repr(i) for i in ids)+',)\n'+marker,1)
 old="'8080/tcp' if lab in labctl.PACK1 else '8000/tcp'"
 assert b.count(old)==1
 b=b.replace(old,"'8080/tcp' if lab in labctl.PACK1 or lab in labctl.NIGHTMARE else '8000/tcp'",1)
ast.parse(a);ast.parse(b)
p.write_text(a);q.write_text(b)
PATCH
python3 -m py_compile "$V2" "$V3"
if ! systemctl restart fortifysec-labs-manager.service; then
 cp -a "$BACKUP/labctl.py" "$V2"
 cp -a "$BACKUP/server.py" "$V3"
 systemctl restart fortifysec-labs-manager.service || true
 echo 'Rollback executado. Backup:' "$BACKUP"; exit 1
fi
echo 'Manager atualizado. Backup:' "$BACKUP"
echo 'Portal web e submissão centralizada de flags ainda exigem integração.'
