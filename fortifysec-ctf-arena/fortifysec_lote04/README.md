# FortifySec Elite Labs — Lote 04: 30 desafios (FS-033 a FS-062)

30 laboratórios offline com artefatos reais, soluções executáveis e flags únicas.

**Aviso:** estes desafios são tecnicamente funcionais e verificados por scripts, mas **não** foram submetidos a uma auditoria independente de dificuldade ou homologação de nível internacional. Algumas técnicas são introdutórias/intermediárias, especialmente OSINT e Web.

## Conteúdo
- 6 Cryptography (33–38)
- 6 Forensics (39–44)
- 6 Networking, PCAP UDP (45–50)
- 6 Reverse Engineering, ELF x86-64 (51–56)
- 4 Web, JavaScript offline (57–60)
- 2 OSINT, cenários fictícios (61–62)

Cada pasta FS-NNN/public contém arquivos dos competidores. Cada pasta private contém flag.txt e solve.py. **NUNCA publique private, manifest.private.json ou este ZIP administrativo no site público.**

Os arquivos FS-NNN.zip na raiz são os anexos públicos adequados para o CTFd.

## Teste local
`python3 verificar.py`

## Importação
`python3 importar_ctfd.py` faz validação sem alterar o servidor.
`export CTFD_ADMIN_TOKEN="$(cat ~/.config/fortifysec/ctfd-token)"`
`python3 importar_ctfd.py --url http://127.0.0.1:8000 --aplicar`
`unset CTFD_ADMIN_TOKEN`

Instala como ocultos, para revisão antes da publicação.
