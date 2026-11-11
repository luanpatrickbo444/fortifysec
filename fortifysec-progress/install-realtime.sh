#!/usr/bin/env bash
set -euo pipefail
if [[ "${EUID}" -eq 0 ]]; then echo 'Run as normal Kali user, not sudo'; exit 1; fi
ROOT="$(cd "$(dirname "$0")" && pwd)"
OWNER="$(id -un)"
if [[ ! -f "$ROOT/app/main.py" ]]; then exit 1; fi
python3 -m py_compile "$ROOT/app/main.py"
mkdir -p "$ROOT/data"
chmod 700 "$ROOT/data"
SERVICE=/etc/systemd/system/fortifysec-progress-sync.service
TIMER=/etc/systemd/system/fortifysec-progress-sync.timer
sudo tee "$SERVICE" >/dev/null <<EOF2
[Unit]
Description=FortifySec Progress read-only snapshot sync
After=docker.service
[Service]
Type=oneshot
User=root
Environment=FORTIFYSEC_PROGRESS_OWNER=$OWNER
ExecStart=/bin/bash $ROOT/sync-realtime.sh
NoNewPrivileges=true
EOF2
sudo tee "$TIMER" >/dev/null <<'EOF2'
[Unit]
Description=FortifySec Progress sync every 10 seconds
[Timer]
OnBootSec=10s
OnUnitInactiveSec=10s
AccuracySec=1s
Unit=fortifysec-progress-sync.service
[Install]
WantedBy=timers.target
EOF2
sudo systemctl daemon-reload
sudo systemctl enable --now fortifysec-progress-sync.timer
sudo systemctl start fortifysec-progress-sync.service
printf '\nSync installed. Check: sudo systemctl status fortifysec-progress-sync.timer\n'
