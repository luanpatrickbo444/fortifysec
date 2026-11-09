# FortifySec — Pacote 01 (laboratórios 01–06)

**Pacote executável de homologação**, NÃO integrado automaticamente ao CTFd/manager/gateway atual. Os serviços não publicam portas e ficam em rede Docker `internal`. Não use `docker compose down -v` nem `docker system prune` na infraestrutura existente.

## Conteúdo
1. SQL Injection — SQLite em memória, busca vulnerável intencional.
2. Stored XSS — quadro de mensagens em memória, prova em `/audit?proof=1`.
3. API Broken Access Control — `/api/profile`, `/api/reports/<id>`.
4. JWT Authentication Flaws — `/token`, `/vault`.
5. Linux Privilege Audit — simulação segura de permissões `/files`, `/cron`, `/audit-path?path=...`; não é uma shell com escalonamento real.
6. Network Packet Investigation — PCAP sintético `/capture.pcap`.

## Instalação isolada
```bash
cd fortifysec-labs-01-06
cp .env.example .env
# EDITE .env: troque cada flag por um valor forte, diferente e secreto.
chmod 600 .env
docker compose -f compose.yaml config --quiet
docker compose -f compose.yaml up -d --build
```

## Testar sem publicar portas
```bash
docker compose -f compose.yaml ps
docker compose -f compose.yaml exec -T lab01 python -c 'import urllib.request;print(urllib.request.urlopen("http://127.0.0.1:8080/health").read().decode())'
docker compose -f compose.yaml exec -T lab06 python -c 'import urllib.request;print(len(urllib.request.urlopen("http://127.0.0.1:8080/capture.pcap").read()))'
```

## Integração
Os containers não são expostos ao host e **não são acessíveis aos alunos ainda**. Para integrar ao seu CTFd, precisamos adaptar o manager existente para provisionamento por usuário e o gateway para rotear `/labs/access/<lab_id>/...` autenticado; nunca conectar a rede interna de CTFd/MariaDB à rede vulnerável. `ctfd-import.csv` é apenas uma planilha de metadados para cadastramento, não um importador CTFd pronto. As flags do `.env` devem ser cadastradas individualmente no CTFd com armazenamento restrito; para múltiplos participantes, gerar flags por instância/usuário.

## Segurança e limitações
Não publicar as portas com `ports:`; não montar `/var/run/docker.sock`; não usar `privileged`; evitar permitir acesso direto ao banco CTFd, Redis, host ou internet. Este é um pacote demonstrativo com instâncias compartilhadas: a aplicação XSS mantém mensagens em memória, portanto não oferece isolamento por participante. A simulação Linux não executa tarefas privilegiadas reais. Antes de produção, implantar uma instância por usuário, impor TTL, limites, proteção de sessão, gateway com autenticação em cada requisição e testes de escape/isolamento. O `read_only`, `cap_drop`, `no-new-privileges` e rede interna são camadas adicionais, não garantias absolutas.
