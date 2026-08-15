#!/usr/bin/env bash
set -euo pipefail
rm -f app/painel/cursos/layout.tsx \
      app/painel/ctf/layout.tsx \
      app/painel/pagamentos/layout.tsx \
      app/painel/perfil/layout.tsx \
      app/painel/ranking/layout.tsx \
      components/PanelSectionShell.tsx \
      app/painel/panel.css \
      scripts/prebuild-ui-guard.mjs
rm -rf .next
printf '[FortifySec] Residuos V13-V17 removidos.\n'
