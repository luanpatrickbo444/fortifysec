# GABARITO ADMINISTRATIVO — NÃO PUBLICAR

## FS-013 — XOR Beacon

Flag: `FSCTF{ELITE_013_24E67F0BAA93}`

Decodifique o hexadecimal e aplique XOR repetido usando a chave informada.

## FS-014 — Vigenere Field Report

Flag: `FSCTF{ELITE_014_7503E739B034}`

Desfaça Vigenère sobre as letras A-Z preservando pontuação.

## FS-015 — RSA Byte Blocks

Flag: `FSCTF{ELITE_015_BCAE52067225}`

Fatore n, calcule phi e d, decifre cada bloco com pow(c,d,n).

## FS-016 — Endian Trap

Flag: `FSCTF{ELITE_016_BE133F747D48}`

Inverta cada bloco de quatro bytes e concatene os resultados.

## FS-017 — Compressed Signal

Flag: `FSCTF{ELITE_017_8A49FA79FF6C}`

Aplique base64.b64decode e zlib.decompress.

## FS-018 — SQLite Incident

Flag: `FSCTF{ELITE_018_0D05ED7BD8D6}`

Abra audit.db com sqlite3; selecione payload de events onde kind=AUDIT; decodifique base64.

## FS-019 — Gateway Fragments

Flag: `FSCTF{ELITE_019_D56AB5EA19F0}`

Ordene os registros por seq e decodifique os fragmentos.

## FS-020 — PNG Trailer

Flag: `FSCTF{ELITE_020_30F30D5EF603}`

Inspecione os bytes após o chunk IEND; recupere FS_FORENSIC_TRAILER e decodifique base64.

## FS-021 — Hidden Archive

Flag: `FSCTF{ELITE_021_EC640367CC4E}`

tar -tzf incident.tar.gz; extraia case/.audit/secret.b64 e decodifique base64.

## FS-022 — Journal Rotation

Flag: `FSCTF{ELITE_022_B59EF7A70EB9}`

Filtre event=token_rotation no JSONL e inverta a string value.

## FS-023 — UDP Beacon

Flag: `FSCTF{ELITE_023_7428718CEE18}`

Abra no Wireshark, siga o fluxo UDP e decodifique o conteúdo após LOG:.

## FS-024 — Out-of-Order Datagram

Flag: `FSCTF{ELITE_024_C4919113FFC4}`

Extraia os datagramas UDP, ordene por SEQ e concatene DATA.

## FS-025 — Hex Payload

Flag: `FSCTF{ELITE_025_2441EB50878A}`

Localize ALERT-HEX nos pacotes e converta o hexadecimal para bytes.

## FS-026 — Rotated Traffic

Flag: `FSCTF{ELITE_026_83FB57CFAEEE}`

Extraia ROT13 do PCAP e aplique ROT13 para recuperar a flag.

## FS-027 — XOR Keycheck

Flag: `FSCTF{ELITE_027_57D279869C87}`

Use strings/objdump/Ghidra ou gdb e identifique a tabela e a transformação XOR.

## FS-028 — Additive Validator

Flag: `FSCTF{ELITE_028_CD01375AB46E}`

Encontre a tabela e subtraia a constante dos bytes.

## FS-029 — Reverse Lookup

Flag: `FSCTF{ELITE_029_2FDCC53CE885}`

Inverta a ordem da tabela e aplique XOR com a constante.

## FS-030 — Bit Rotation

Flag: `FSCTF{ELITE_030_86507C6DC3BD}`

Identifique a rotação circular de 3 bits e aplique ROR3.

## FS-031 — Operation Glasshouse

Flag: `FSCTF{ELITE_031_DA4E93262EA2}`

Associe todos os documentos pelo CASE, ordene por etapa e decodifique os fragmentos base64.

## FS-033 — Client-Side Trust

Flag: `FSCTF{ELITE_033_255CBB576BE5}`

Inspecione a variável payload e a operação XOR no JavaScript; decodifique os bytes para obter a flag.
