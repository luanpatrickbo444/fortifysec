#!/usr/bin/env bash
set -euo pipefail
umask 077

PROJECT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEST="$PROJECT/backups"
STAMP="$(date +%Y%m%d-%H%M%S)"
WORK="$(mktemp -d "$DEST/.backup-${STAMP}-XXXXXX")"
ARCHIVE="$DEST/fortifysec-$STAMP.tar.gz"

trap 'rm -rf -- "$WORK"' EXIT

cd "$PROJECT"

echo "[1/5] Exportando banco de dados..."

sudo docker compose exec -T db sh -ec '
  exec mariadb-dump \
    --user="${MARIADB_USER:-$MYSQL_USER}" \
    --password="${MARIADB_PASSWORD:-$MYSQL_PASSWORD}" \
    --databases "${MARIADB_DATABASE:-$MYSQL_DATABASE}" \
    --single-transaction --quick --routines --events
' > "$WORK/database.sql"

test -s "$WORK/database.sql"

echo "[2/5] Copiando arquivos enviados..."

sudo docker run --rm \
  -v fortifysec-ctf_uploads:/source:ro \
  -v "$WORK:/backup" \
  alpine:3.20 \
  tar -czf /backup/uploads.tar.gz -C /source .

echo "[3/5] Copiando projeto..."

tar -czf "$WORK/project.tar.gz" \
  --exclude='./backups' \
  --exclude='./.git' \
  --exclude='./.venv-*' \
  -C "$PROJECT" .

echo "[4/5] Registrando configuração..."

sudo docker compose ps > "$WORK/containers.txt"

sudo docker image ls \
  --format '{{.Repository}}:{{.Tag}} {{.ID}}' \
  > "$WORK/images.txt"

echo "[5/5] Gerando backup..."

tar -czf "$ARCHIVE" -C "$WORK" .

sha256sum "$ARCHIVE" > "$ARCHIVE.sha256"

echo
echo "Backup criado:"
ls -lh "$ARCHIVE"
