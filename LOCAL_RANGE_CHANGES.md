# FortifySec 8.4 — Local Cyber Range

## Implementado

- provider `local_docker` para Docker Desktop;
- uma rede Docker dedicada por sessão;
- porta aleatória por sessão vinculada a `127.0.0.1`;
- TTL e limpeza automática de sessões expiradas;
- `POST /sessions`, `DELETE /sessions/:id`, `/health` e `/health/local`;
- suporte a target direto no painel de Labs e Challenges;
- botão `ABRIR TARGET` quando o alvo local é HTTP;
- botão `BAIXAR VPN` somente quando o provider realmente retorna uma VPN;
- exemplo `web-juice-01` com OWASP Juice Shop;
- seed SQL opcional para publicar o Lab de smoke test;
- scripts PowerShell para iniciar e testar o provider no Windows.

## Não alterado

- autenticação e matrícula;
- RLS/Supabase existente;
- scoring de Challenges e CTF;
- admin/empresa/pagamentos;
- contrato de criação/remoção de sessões.

## Próximo provider

A próxima implementação será `gcp_vm` usando Google Compute Engine. O frontend continuará chamando o mesmo contrato do Range Provider.
