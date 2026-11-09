#!/usr/bin/env bash
set -Eeuo pipefail
umask 077

PROJECT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUPS="$PROJECT/backups"
PASSPHRASE="/etc/fortifysec/backup-gpg.pass"
REMOTE="fortifysec-drive:FortifySec-Arena/Backups"
RCLONE_CONFIG="/home/kali/.config/rclone/rclone.conf"

export PATH="/usr/local/bin:/usr/bin:/bin"

exec 9>/run/lock/fortifysec-backup.lock
flock -n 9 || {
  echo "Outro backup já está em execução."
  exit 1
}

echo "=== FORTIFYSEC BACKUP DIÁRIO ==="
date -Is

test -s "$PASSPHRASE"
test -r "$RCLONE_CONFIG"

cd "$PROJECT"

# Executar script original
bash scripts/backup-fortifysec.sh

# Localizar o backup mais recente
ARCHIVE="$(find "$BACKUPS" -maxdepth 1 \
  -type f -name 'fortifysec-*.tar.gz' \
  -printf '%T@ %p\n' |
  sort -nr | head -1 | cut -d' ' -f2-)"

test -n "$ARCHIVE"
test -s "$ARCHIVE"

echo "=== VALIDANDO ARQUIVO ==="
gzip -t "$ARCHIVE"

ENCRYPTED="$ARCHIVE.gpg"

echo "=== CRIPTOGRAFANDO ==="

gpg --batch --yes \
  --pinentry-mode loopback \
  --passphrase-file "$PASSPHRASE" \
  --symmetric \
  --cipher-algo AES256 \
  --output "$ENCRYPTED" \
  "$ARCHIVE"

test -s "$ENCRYPTED"

echo "=== ENVIANDO AO GOOGLE DRIVE ==="

rclone --config "$RCLONE_CONFIG" \
  copyto "$ENCRYPTED" \
  "$REMOTE/$(basename "$ENCRYPTED")" \
  --retries 3 \
  --low-level-retries 5

echo "=== VERIFICANDO BACKUP REMOTO ==="

LOCAL_SIZE="$(stat -c %s "$ENCRYPTED")"

REMOTE_SIZE="$(rclone --config "$RCLONE_CONFIG" \
  size "$REMOTE/$(basename "$ENCRYPTED")" \
  --json | python3 -c 'import json,sys; print(json.load(sys.stdin)["bytes"])')"

if [ "$LOCAL_SIZE" != "$REMOTE_SIZE" ]; then
  echo "ERRO: tamanho remoto diferente do local."
  exit 1
fi

echo "=== RETENÇÃO LOCAL: 7 DIAS ==="

find "$BACKUPS" -maxdepth 1 -type f \
  \( -name 'fortifysec-*.tar.gz' \
     -o -name 'fortifysec-*.tar.gz.gpg' \
     -o -name 'fortifysec-*.tar.gz.sha256' \) \
  -mtime +6 -delete

echo "=== RETENÇÃO GOOGLE DRIVE: 30 DIAS ==="

rclone --config "$RCLONE_CONFIG" \
  delete "$REMOTE" \
  --min-age 30d \
  --include 'fortifysec-*.tar.gz.gpg'

echo "=== BACKUP DIÁRIO CONCLUÍDO ==="
date -Is
