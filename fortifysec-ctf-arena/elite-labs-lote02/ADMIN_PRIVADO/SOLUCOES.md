# Gabarito privado — FortifySec Lote 02

## FS-007 — Tenant Boundary II

Iniciar servidor e solicitar `http://127.0.0.1:8765/api/invoices?tenant=alpha&id=102`. O registro beta fica acessivel sem verificacao de propriedade. O arquivo fonte contem a flag por necessidade de distribuicao offline; para competicao final, hospedar o backend isoladamente.

**Flag:** `FSCTF{TENANT_BOUNDARY_14C8FE49DF}`

## FS-008 — Keystream Collision

XOR entre `known_plaintext` e `ciphertext_1_hex` revela o fluxo de chave; XOR com `ciphertext_2_hex` recupera a mensagem.

**Flag:** `FSCTF{STREAM_COLLISION_B97E892105}`

## FS-009 — Audit Trail Recovery

Consultar `SELECT ts, actor, action, detail FROM audit ORDER BY ts;` e correlacionar DELETE e RECOVERY.

**Flag:** `FSCTF{AUDIT_TRAIL_7A74DC1A49}`

## FS-010 — DNS Exfil Fragments

Extrair nomes DNS, ordenar pelo primeiro label numerico, concatenar segundo label e decodificar hex para ASCII.

**Flag:** `FSCTF{DNS_EXFIL_BEB0AE6DBA}`

## FS-011 — ELF Checkpoint

A rotina XOR usa a constante 0x5a; recuperar cada byte da tabela com XOR 0x5a. Confirmar executando o binario com o token.

**Flag:** `FSCTF{ELF_CHECKPOINT_B165226730}`

## FS-012 — Operacao Aurora

Ler notas e registro, montar BRAVO+ALFA+CHARLIE segundo a ordem A2,A1,A3. Todos os dominios e identidades sao ficticios.

**Flag:** `FSCTF{CORRELATION_CASE_B39A17E410}`
