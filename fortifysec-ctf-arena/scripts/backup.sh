#!/usr/bin/env bash
set -euo pipefail
mkdir -p backups
stamp=$(date -u +%Y%m%dT%H%M%SZ)
# Consistent SQL export; store backups securely off-host.
docker compose exec -T db sh -c 'exec mariadb-dump -u root -p"$MARIADB_ROOT_PASSWORD" --single-transaction --routines --triggers "$MARIADB_DATABASE"' | gzip > "backups/ctfd-${stamp}.sql.gz"
echo "Backup criado: backups/ctfd-${stamp}.sql.gz"
echo 'ATENCAO: tambem salve o volume uploads; o SQL nao inclui arquivos enviados.'
