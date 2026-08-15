# FortifySec V7.16 — UI Guard Fix

- Corrige o falso negativo do `prebuild-ui-guard.mjs` ao detectar imports de CSS.
- O guard agora aceita aspas simples/duplas e caminhos relativos/alternativos terminando em `globals.css` ou `panel.css`.
- Se o import de CSS estiver ausente, o guard repara o arquivo automaticamente antes do `next build`.
- Remove a execução duplicada do prebuild: `npm` já executa `prebuild` automaticamente antes de `build`.
- Mantém a base visual e funcional da V7.15.
