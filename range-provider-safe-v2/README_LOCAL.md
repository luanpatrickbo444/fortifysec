# FortifySec Range Provider — Local Docker

Provider de desenvolvimento local para o Cyber Range. Cada sessão cria um container Docker dedicado, uma rede bridge interna e uma porta aleatória publicada somente em `127.0.0.1`.

Endpoints preservados:

- `GET /health`
- `GET /health/local` (Bearer token)
- `POST /sessions` (Bearer token)
- `DELETE /sessions/:id` (Bearer token)

Este provider não usa WireGuard. O acesso local é direto pelo target retornado. Na migração para Google Cloud, o backend `gcp_vm` substituirá `local_docker` mantendo o mesmo contrato HTTP com o FortifySec.
