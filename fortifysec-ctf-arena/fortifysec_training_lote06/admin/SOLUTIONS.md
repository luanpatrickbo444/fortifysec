## FS-093 — Telemetry Recovery 1
Flag: `FS{d4fe5086ac644f1ea5c8e71e}`

Localize o evento backup com codec zlib+base64; decodifique Base64 e descomprima zlib.

## FS-094 — Cipher Relay 1
Flag: `FS{619a4f086cc05b73db87b3ae}`

Aplique XOR com a chave periódica em hexadecimal indicada nas notas.

## FS-095 — SQLite Incident 1
Flag: `FS{b79d7e800f833945721bf1ef}`

Consulte a tabela audit e filtre event=recovery e status=quarantined.

## FS-096 — Packet Reconstruction 1
Flag: `FS{f58a4e50bcc47e18694c5be8}`

Abra capture.pcap no Wireshark, extraia payloads UDP, ordene FS-SEQ e concatene DATA.

## FS-097 — Firmware Carving 1
Flag: `FS{38dd72f98eb66641ef7be17f}`

Procure o marcador FSRECOVERY\x00; leia 2 bytes little-endian de tamanho e depois a flag.

## FS-098 — Source Audit 1
Flag: `FS{d3efad02c9c6c941db7e26d2}`

Inspecione app.js, identifique diagnostic e decodifique Base64 (atob).

## FS-099 — Log Timeline 1
Flag: `FS{ac88d83cbee6cb7ac670f196}`

Filtre source=collector, confira integrity SHA-256 prefixo de 8 caracteres, ordene seq e concatene part.

## FS-100 — Archive Forensics 1
Flag: `FS{651915d6af430044e4007180}`

Liste os arquivos ocultos do TAR e extraia archive/.recovery/session.token.

## FS-101 — Binary Endianness 1
Flag: `FS{105534bd98af70e83caa0a60}`

Converta cada palavra hexadecimal em quatro bytes little-endian; remova NUL finais.

## FS-102 — Multi-Stage Encoding 1
Flag: `FS{98dc2fd0a0536ff15843aa0a}`

Base64 decode, zlib decompress, reverse bytes.

## FS-103 — Telemetry Recovery 2
Flag: `FS{0b264583bfd6707fadde30b3}`

Localize o evento backup com codec zlib+base64; decodifique Base64 e descomprima zlib.

## FS-104 — Cipher Relay 2
Flag: `FS{1d055969b4dd81da1b6b3419}`

Aplique XOR com a chave periódica em hexadecimal indicada nas notas.

## FS-105 — SQLite Incident 2
Flag: `FS{f06ea40ea4cedcf6dce81634}`

Consulte a tabela audit e filtre event=recovery e status=quarantined.

## FS-106 — Packet Reconstruction 2
Flag: `FS{32eb63245f30da30bb52438d}`

Abra capture.pcap no Wireshark, extraia payloads UDP, ordene FS-SEQ e concatene DATA.

## FS-107 — Firmware Carving 2
Flag: `FS{60ce864f5a82ae0f9cd6f3a6}`

Procure o marcador FSRECOVERY\x00; leia 2 bytes little-endian de tamanho e depois a flag.

## FS-108 — Source Audit 2
Flag: `FS{2367e7764637f36d72f45695}`

Inspecione app.js, identifique diagnostic e decodifique Base64 (atob).

## FS-109 — Log Timeline 2
Flag: `FS{fefc11bc443c30bc12d39e55}`

Filtre source=collector, confira integrity SHA-256 prefixo de 8 caracteres, ordene seq e concatene part.

## FS-110 — Archive Forensics 2
Flag: `FS{16121774ba1b3616edf92647}`

Liste os arquivos ocultos do TAR e extraia archive/.recovery/session.token.

## FS-111 — Binary Endianness 2
Flag: `FS{8efc8fb8de0f9df81db9a4d4}`

Converta cada palavra hexadecimal em quatro bytes little-endian; remova NUL finais.

## FS-112 — Multi-Stage Encoding 2
Flag: `FS{dca6cbaf5639ebcadfd3c31e}`

Base64 decode, zlib decompress, reverse bytes.

## FS-113 — Telemetry Recovery 3
Flag: `FS{67a81f1f3474682441c7f325}`

Localize o evento backup com codec zlib+base64; decodifique Base64 e descomprima zlib.

## FS-114 — Cipher Relay 3
Flag: `FS{21d147c352c44087350ca529}`

Aplique XOR com a chave periódica em hexadecimal indicada nas notas.

## FS-115 — SQLite Incident 3
Flag: `FS{ff00a0979e34dde9f2473cee}`

Consulte a tabela audit e filtre event=recovery e status=quarantined.

## FS-116 — Packet Reconstruction 3
Flag: `FS{65ed0d0697923e5b152f130e}`

Abra capture.pcap no Wireshark, extraia payloads UDP, ordene FS-SEQ e concatene DATA.

## FS-117 — Firmware Carving 3
Flag: `FS{96d9cdf971a828d04170b63e}`

Procure o marcador FSRECOVERY\x00; leia 2 bytes little-endian de tamanho e depois a flag.

## FS-118 — Source Audit 3
Flag: `FS{3219c802ce0be2aa78737fae}`

Inspecione app.js, identifique diagnostic e decodifique Base64 (atob).

## FS-119 — Log Timeline 3
Flag: `FS{ecddf1a3e36a30e5adae4d95}`

Filtre source=collector, confira integrity SHA-256 prefixo de 8 caracteres, ordene seq e concatene part.

## FS-120 — Archive Forensics 3
Flag: `FS{f27d6034f17c9b860a7b2430}`

Liste os arquivos ocultos do TAR e extraia archive/.recovery/session.token.

## FS-121 — Binary Endianness 3
Flag: `FS{026052fdb85f1beaeb4c9939}`

Converta cada palavra hexadecimal em quatro bytes little-endian; remova NUL finais.

## FS-122 — Multi-Stage Encoding 3
Flag: `FS{ad0df7e9b7dfa811d10d1e20}`

Base64 decode, zlib decompress, reverse bytes.