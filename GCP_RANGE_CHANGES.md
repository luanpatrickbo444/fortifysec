# FortifySec v8.5 — Google Cloud Range Provider

- provider `gcp_vm` para Compute Engine;
- VM privada por sessão, sem public IP;
- sem service account anexada às VMs de laboratório;
- WireGuard por aluno com `AllowedIPs` somente do target `/32`;
- iptables por sessão no gateway;
- TTL e orphan sweep no Compute Engine;
- `GET /health/gcp`;
- Terraform da VPC, subnets, gateway, rota WireGuard, firewall e IAM;
- `local_docker` preservado somente para desenvolvimento;
- provider Azure removido desta distribuição para evitar configuração ambígua.
