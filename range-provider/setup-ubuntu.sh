#!/usr/bin/env bash
# Compatibilidade com os pacotes anteriores. O setup oficial agora é o gateway Google Cloud.
set -euo pipefail
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
exec "$SCRIPT_DIR/setup-gcp-gateway.sh" "$@"
