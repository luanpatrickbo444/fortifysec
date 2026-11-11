# FortifySec Progress v1 (protótipo isolado)

Serviço Flask local em `127.0.0.1:8500`, sem alterações na Arena, Manager ou CTFd. Consulta **somente leitura** do SQLite de conclusões. O ranking público mostra apenas IDs técnicos `ctfd-N`, sem nomes pessoais. Perfil e conquistas são páginas reservadas para integração posterior com autenticação.

## Instalar no Kali

```bash
cd ~/Documents/fortifysec/fortifysec-progress
python3 -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
```

## Preparar snapshot sem alterar a origem

```bash
sudo install -d -m 700 -o "$USER" -g "$(id -gn)" data
sudo sqlite3 /var/lib/fortifysec-labs/solves.sqlite3 ".backup '/tmp/fortifysec-progress-solves.sqlite3'"
sudo chown "$USER:$(id -gn)" /tmp/fortifysec-progress-solves.sqlite3
mv /tmp/fortifysec-progress-solves.sqlite3 data/solves.sqlite3
chmod 600 data/solves.sqlite3
```

Se `sqlite3` CLI não estiver instalado, use o Python com `sudo` para copiar via `sqlite3.Connection.backup` (evite `cp` direto se houver transações concorrentes). Não exponha o SQLite original à web.

## Rodar

```bash
FORTIFYSEC_SOLVES_DB="$PWD/data/solves.sqlite3" python app/main.py
```

Abra `http://127.0.0.1:8500/labs/ranking`. A cópia é um snapshot: para atualizar, execute novamente a etapa de backup. **Não publique a porta na internet** sem autenticação, proxy e revisão de segurança.
