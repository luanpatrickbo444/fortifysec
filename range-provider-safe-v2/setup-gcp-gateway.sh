#!/usr/bin/env bash
set -euo pipefail

if [[ "${EUID}" -ne 0 ]]; then
  echo "Execute como root: sudo ./setup-gcp-gateway.sh" >&2
  exit 1
fi

apt-get update
apt-get install -y wireguard iptables nginx

sysctl -w net.ipv4.ip_forward=1
cat >/etc/sysctl.d/99-fortify-range.conf <<'SYSCTL'
net.ipv4.ip_forward=1
SYSCTL

install -d -m 700 /etc/wireguard
if [[ ! -f /etc/wireguard/server.key ]]; then
  umask 077
  wg genkey >/etc/wireguard/server.key
  wg pubkey </etc/wireguard/server.key >/etc/wireguard/server.pub
fi

WG_PRIV="$(cat /etc/wireguard/server.key)"
cat >/etc/wireguard/wg0.conf <<WG
[Interface]
Address = 10.77.0.1/16
ListenPort = 51820
PrivateKey = ${WG_PRIV}
WG
chmod 600 /etc/wireguard/wg0.conf
systemctl enable --now wg-quick@wg0

# Provider runs behind nginx; TLS certificate/domain is configured separately.
install -m 0644 fortify-range.service /etc/systemd/system/fortify-range.service
systemctl daemon-reload

echo "WireGuard public key: $(cat /etc/wireguard/server.pub)"
echo "Configure .env, nginx/TLS and then run: systemctl enable --now fortify-range"
