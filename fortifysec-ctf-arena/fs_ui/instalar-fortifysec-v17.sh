#!/usr/bin/env bash
set -euo pipefail
cd /home/kali/Documents/fortifysec/fortifysec-ctf-arena
ROOT="$PWD"
SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
THEME="$ROOT/branding/tema-consolidado"
STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP="$ROOT/backups/ui-v17-$STAMP"
mkdir -p "$BACKUP" "$THEME/static/css" "$THEME/static/js"
test -f "$THEME/templates/base.html" || { echo 'ERRO: tema consolidado ausente'; exit 1; }
sudo docker compose ps --status running --services | grep -qx ctfd || { echo 'ERRO: CTFd nao esta rodando'; exit 1; }
cp "$THEME/templates/base.html" "$BACKUP/base.html"
sudo docker compose cp ctfd:/opt/CTFd/CTFd/themes/fortifysec/templates/base.html "$BACKUP/base-live-original.html"
cp "$BACKUP/base-live-original.html" "$BACKUP/base-live.html"
cp "$SRC/challenges-premium-v17.css" "$THEME/static/css/challenges-premium-v17.css"
cp "$SRC/challenges-premium-v17.js" "$THEME/static/js/challenges-premium-v17.js"
python3 - "$THEME/templates/base.html" "$BACKUP/base-live.html" <<'PY'
from pathlib import Path
import sys
css = '<link rel="stylesheet" href="/themes/fortifysec/static/css/challenges-premium-v17.css?v=17">'
js = '<script defer src="/themes/fortifysec/static/js/challenges-premium-v17.js?v=17"></script>'
for filename in sys.argv[1:]:
    p=Path(filename)
    t=p.read_text(encoding='utf-8')
    if '</head>' not in t or '</body>' not in t:
        raise SystemExit('ERRO: base.html sem head/body: '+str(p))
    if 'challenges-premium-v17.css' not in t: t=t.replace('</head>',css+'\n</head>',1)
    if 'challenges-premium-v17.js' not in t: t=t.replace('</body>',js+'\n</body>',1)
    p.write_text(t,encoding='utf-8')
PY
sudo docker compose cp "$THEME/static/css/challenges-premium-v17.css" ctfd:/opt/CTFd/CTFd/themes/fortifysec/static/css/challenges-premium-v17.css
sudo docker compose cp "$THEME/static/js/challenges-premium-v17.js" ctfd:/opt/CTFd/CTFd/themes/fortifysec/static/js/challenges-premium-v17.js
sudo docker compose cp "$BACKUP/base-live.html" ctfd:/opt/CTFd/CTFd/themes/fortifysec/templates/base.html
printf 'Backup: %s\n' "$BACKUP"
printf 'Instalado. Atualize http://localhost:8000/challenges com Ctrl+Shift+R\n'
