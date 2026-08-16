#!/usr/bin/env bash
set -euo pipefail

if [[ $EUID -ne 0 ]]; then echo "Execute como root."; exit 1; fi
apt-get update
apt-get install -y wireguard wireguard-tools docker.io iptables nodejs npm
systemctl enable --now docker
install -d -m 700 /etc/wireguard

if [[ ! -f /etc/wireguard/server.key ]]; then
  umask 077
  wg genkey | tee /etc/wireguard/server.key | wg pubkey > /etc/wireguard/server.pub
fi

SERVER_PRIV="$(cat /etc/wireguard/server.key)"
cat > /etc/wireguard/wg0.conf <<EOF
[Interface]
Address = 10.77.0.1/16
ListenPort = 51820
PrivateKey = ${SERVER_PRIV}
EOF

cat >/etc/sysctl.d/99-fortify-range.conf <<'EOF'
net.ipv4.ip_forward=1
EOF
sysctl --system
systemctl enable --now wg-quick@wg0

# Provider HTTP API should not be public. Prefer reverse proxy + TLS and firewall
# allowing only Vercel egress through an authenticated proxy, or a private tunnel.
# WireGuard itself must accept UDP/51820 from students.

echo "WireGuard public key: $(cat /etc/wireguard/server.pub)"
echo "Agora copie range-provider para /opt/fortify-range, crie .env/labs.json e habilite fortify-range.service."
