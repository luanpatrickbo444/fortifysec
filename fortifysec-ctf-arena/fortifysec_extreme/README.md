# FortifySec Elite Labs — Lote 05 — FS-063 a FS-092

30 desafios **offline**, com artefatos sintéticos e verificáveis, importador CTFd, flags e solucionador administrativo.

## IMPORTANTE: classificação honesta

Estes 30 desafios são **variações de um mesmo núcleo de reconstrução de evidências**, com cinco transformações reversíveis, registros embaralhados, eventos falsos, validação SHA-256 e compressão. Os títulos e categorias representam cenários de treinamento, **não** implementações completas de RSA, JWT, GraphQL, Kubernetes, exploração de binários ou serviços vulneráveis. Portanto **não** são 30 laboratórios independentes de complexidade extrema ou equivalentes a DEF CON CTF finals. O pacote é um protótipo funcional para treinamento e precisa de desenvolvimento específico por categoria antes de uso como competição internacional de elite.

## Verificar

`python3 admin/solve_all.py`

## Importar (oculto)

`python3 -m pip install requests` (preferencialmente em venv)

`python3 admin/import_ctfd.py`

`export CTFD_ADMIN_TOKEN="$(cat ~/.config/fortifysec/ctfd-token)"`

`python3 admin/import_ctfd.py --url http://127.0.0.1:8000 --apply`

`unset CTFD_ADMIN_TOKEN`

Os arquivos `admin/manifest.json` e `admin/solve_all.py` contêm as respostas; nunca disponibilize o pacote inteiro para participantes. Distribua somente `challenges/FS-NNN.zip`.

**Atenção:** o importador não foi testado na sua instância. Pode ser necessário adaptar o endpoint de upload de arquivos à sua versão do CTFd. Revise o resultado no painel administrativo. Use um token novo, não o que foi compartilhado em chat.
