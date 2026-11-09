# FortifySec Labs — lote 10–15 (ambiente de desenvolvimento)

Seis laboratórios intencionalmente vulneráveis para uso **somente em ambiente isolado de treinamento**.

## Conteúdo
- FS-010: Broken Access Control / IDOR (`/api/reports/100`)
- FS-011: SQL Injection SQLite (`/api/products?name=teclado`)
- FS-012: JWT-like token com validação de assinatura ausente (`/api/token`, `/api/admin`)
- FS-013: SSRF **simulado**: sem requisições externas ou acesso à rede interna (`/api/preview`)
- FS-014: Upload com confiança indevida em metadados; **não grava nem executa arquivos** (`/api/upload`)
- FS-015: Mass Assignment (`/api/profile`)

## Executar sem tocar no CTFd atual
```bash
cp .env.example .env
# Edite .env e troque todas as flags por valores únicos e secretos.
chmod 600 .env
docker compose -f compose.yaml up -d --build
curl http://127.0.0.1:19110/health
curl http://127.0.0.1:19110/
```
Os serviços são publicados apenas em `127.0.0.1`, portas 19110 a 19115. Não abra essas portas publicamente.

## Integração ao Manager V3
`manifest.json` é um mapa de IDs e portas para integração. **Este pacote não registra automaticamente instâncias no Manager, não adiciona desafios ao CTFd e não oferece isolamento por aluno.** Antes de produção, adaptar cada lab ao provisionamento por sessão e à rede privada da instalação atual, com flags por instância, limites e teardown. Não encaminhe os seis serviços estáticos a todos os alunos.

## Testes rápidos
```bash
for port in 19110 19111 19112 19113 19114 19115; do curl -fsS "http://127.0.0.1:$port/health"; echo; done
```

## Encerrar somente este lote
```bash
docker compose -f compose.yaml down
```
Não use `down -v` ou `--remove-orphans` no stack principal.
