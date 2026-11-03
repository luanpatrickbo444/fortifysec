# FortifySec Elite Labs — Lote 02 (FS-007 a FS-012)

Seis laboratorios offline independentes. Os ZIPs em PARTICIPANTES podem ser distribuidos. Nunca publique ADMIN_PRIVADO.

## Importacao

Instale `requests` em um venv, configure `CTFD_ADMIN_TOKEN` e execute `python3 importar_ctfd.py --url http://127.0.0.1:8000 --aplicar`. Sem `--aplicar`, o programa apenas valida os arquivos.

Os desafios sao criados ocultos. O importador nao altera desafios existentes e pode deixar criacoes parciais se ocorrer erro de API.

## Nota

Sao laboratorios offline de nivel intermediario. Web offline revela a flag no codigo distribuido; para competicao premiada, hospede o backend em contêiner isolado e entregue apenas um cliente. Teste com competidores independentes antes de publicar.
