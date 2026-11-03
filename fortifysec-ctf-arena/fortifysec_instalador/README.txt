INSTALADOR FORTIFYSEC ELITE LABS (6 DESAFIOS)

1) Coloque o arquivo ZIP original e instalar_elite_labs.py na pasta do projeto CTFd.
2) python3 -m venv .venv-importador
3) .venv-importador/bin/pip install requests
4) .venv-importador/bin/python instalar_elite_labs.py --pacote FortifySec_Elite_Labs_01_6_Laboratorios.zip
5) Crie um token ADMIN no CTFd: Settings > Access Tokens. Nunca cole token no chat.
6) read -rs 'CTFD_ADMIN_TOKEN?Token CTFd: '; echo; export CTFD_ADMIN_TOKEN
7) .venv-importador/bin/python instalar_elite_labs.py --pacote FortifySec_Elite_Labs_01_6_Laboratorios.zip --aplicar
8) unset CTFD_ADMIN_TOKEN

Requisitos: API do CTFd habilitada, administrador, requests, Python 3.
Todos os desafios são criados OCULTOS. Os ZIPs são anexados como arquivos de desafio.
Não envie ADMIN_PRIVADO para competidores. O importador não instala ferramentas no Kali dos participantes.
O upload de arquivos depende da versão/API CTFd; se falhar, verifique o desafio parcial no painel Admin.
