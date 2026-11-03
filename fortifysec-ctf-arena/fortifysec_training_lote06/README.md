# FortifySec Training Labs — Lote 06

30 desafios FS-093 a FS-122, em 10 mecanismos distintos com tres variantes cada.
Dificuldade rotulada Medium/Hard/Expert e apenas uma proposta; nao equivale a finais internacionais.

## Estrutura
- FS-NNN.zip: anexo publico do competidor
- admin/manifest.json: inclui FLAGS, nao publicar
- admin/SOLUTIONS.md: gabarito privado
- importar_ctfd.py: importador CTFd via API
- verificar.py: valida integridade de anexos e unicidade das flags

## Uso
python3 fortifysec_training_lote06/verificar.py
python3 fortifysec_training_lote06/importar_ctfd.py --url http://127.0.0.1:8000
export CTFD_ADMIN_TOKEN="$(cat ~/.config/fortifysec/ctfd-token)"
python3 fortifysec_training_lote06/importar_ctfd.py --url http://127.0.0.1:8000 --apply
unset CTFD_ADMIN_TOKEN

O importador cria desafios ocultos. Verifique antes de publicar.
