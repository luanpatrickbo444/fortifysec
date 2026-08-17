#!/usr/bin/env bash
set -euo pipefail

if [[ $EUID -ne 0 ]]; then echo "Execute como root."; exit 1; fi

apt-get update
apt-get install -y wireguard wireguard-tools docker.io iptables curl ca-certificates npm nodejs

# Azure SDK atual exige Node moderno. Se a distro entregar Node <20, use NodeSource 22 LTS.
NODE_MAJOR="$(node -p "process.versions.node.split('.')[0]" 2>/dev/null || echo 0)"
if [[ "$NODE_MAJOR" -lt 20 ]]; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi

systemctl enable --now docker
install -d -m 700 /etc/wireguard

if [[ ! -f /etc/wireguard/server.key ]]; then
  umask 077
  wg genkey | tee /etc/wireguard/server.key | wg pubkey > /etc/wireguard/server.pub
fi

SERVER_PRIV="$(cat /etc/wireguard/server.key)"
cat > /etc/wireguard/wg0.conf <<EOF_WG
[Interface]
Address = 10.77.0.1/16
ListenPort = 51820
PrivateKey = ${SERVER_PRIV}
EOF_WG

cat >/etc/sysctl.d/99-fortify-range.conf <<'EOF_SYSCTL'
net.ipv4.ip_forward=1
EOF_SYSCTL
sysctl --system
systemctl enable --now wg-quick@wg0

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
if [[ -f "$SCRIPT_DIR/package.json" ]]; then
  cd "$SCRIPT_DIR"
  npm install --omit=dev
fi

echo "WireGuard public key: $(cat /etc/wireguard/server.pub)"
echo "Node: $(node --version)"
echo "Docker: $(docker --version)"
echo
cat <<'EOF_NEXT'
Próximos passos:
1. Copie esta pasta para /opt/fortify-range.
2. Crie /opt/fortify-range/.env e labs.json.
3. No Azure, habilite Managed Identity no fortify-range-01 e dê Contributor SOMENTE no RG do Range.
4. Habilite IP forwarding na NIC Azure do gateway.
5. Abra UDP/51820 para os alunos e mantenha 8787 atrás de HTTPS/reverse proxy.
6. Habilite fortify-range.service.
EOF_NEXT
