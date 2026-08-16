# FortifySec V7.12.7

Base: V7.12 original.

Mudanças únicas:
- preserva `app/layout.tsx` original com `import './globals.css'`;
- preserva `app/globals.css` original;
- executa limpeza de resíduos antes do build;
- falha o build se CSS/import/menu saírem do estado esperado.
