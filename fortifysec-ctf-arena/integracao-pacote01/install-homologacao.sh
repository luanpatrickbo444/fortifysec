#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
BASE="/home/kali/Documents/fortifysec/fortifysec-ctf-arena"
BACKUP="$HOME/fortifysec-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP"
for f in opt/fortifysec-labs-v2/labctl.py opt/fortifysec-labs-v3/server.py; do
  sudo test -f "/$f" || { echo "Arquivo ausente: /$f"; exit 1; }
  sudo cp -a "/$f" "$BACKUP/$(basename "$f").$(echo "$f" | tr / _)" 
  sudo install -m 644 "$ROOT/$f" "/$f"
done
cp -a "$BASE/plugins/fortifysec_labs/__init__.py" "$BACKUP/ctfd-plugin-init.py"
cp "$ROOT/plugins/fortifysec_labs/__init__.py" "$BASE/plugins/fortifysec_labs/__init__.py"
echo "Backup: $BACKUP"
echo 'Arquivos copiados. Nenhum serviço foi reiniciado.'
