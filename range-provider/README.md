# FortifySec Range Provider — MVP

Serviço separado da Vercel responsável por criar o alvo temporário e o peer WireGuard da sessão.

## Fluxo

1. FortifySec chama `POST /sessions` usando `LAB_PROVIDER_API_KEY`.
2. O provider cria uma bridge Docker exclusiva, inicia o alvo sem portas publicadas e limita CPU/RAM/PIDs.
3. O provider cria um peer WireGuard exclusivo e uma rota somente para o subnet do alvo.
4. Retorna `session_id`, `vpn_download_url`, `target_address` e `expires_at`.
5. `DELETE /sessions/:id` remove peer, regras, container e network.
6. Um timer interno remove sessões expiradas.

## VPS

Recomendado: VPS/servidor **dedicado ao range**, separado do site, Supabase e qualquer rede corporativa.

Execute `setup-ubuntu.sh` em Ubuntu limpo. Depois:

```bash
sudo mkdir -p /opt/fortify-range
sudo cp -a . /opt/fortify-range/
cd /opt/fortify-range
sudo cp .env.example .env
sudo cp labs.example.json labs.json
sudo chmod 600 .env
sudo cp fortify-range.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now fortify-range
```

No Vercel:

```env
LAB_PROVIDER_API_URL=https://range.fortifysec.com.br
LAB_PROVIDER_API_KEY=mesmo-segredo-do-provider
```

No Admin > Cyber Labs, `Provider Lab ID` precisa ser uma chave existente em `labs.json`, por exemplo `web-juice-01`.

## Segurança

- Não exponha Docker API/TCP para a Internet.
- O provider precisa de acesso local ao Docker e WireGuard; por isso ele deve rodar em host dedicado ao cyber range.
- Nenhum container é iniciado com `--privileged`.
- Não publique portas dos alvos no host; o acesso é pela VPN.
- Para desafios que dependem de kernel exploit, Windows/AD ou malware, prefira VMs/microVMs separadas em vez de containers compartilhando kernel.
- Restrinja a porta HTTP do provider com TLS/firewall/reverse proxy. O Bearer token é uma segunda camada, não substitui controle de rede.
