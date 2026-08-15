# FortifySec V7.15 — Visual Hard Fix

Base: V7.11 (versão com visual aprovado e lógica de preço/perfil/labs corrigida).

## Correções
- `app/globals.css` preservado integralmente.
- Novo `app/painel/panel.css`, cópia integral da baseline visual, importado diretamente pelo layout do painel.
- Um único `DashboardShell`: `app/painel/layout.tsx`.
- Layouts antigos das subseções removidos do artefato.
- `prebuild-ui-guard.mjs` remove automaticamente resíduos de layouts antigos no deploy antes do `next build`.
- Guard falha o build se `globals.css`, `panel.css`, `DashboardShell` ou imports visuais estiverem ausentes/truncados.
- ZIP entregue com `app/`, `components/`, `lib/`, `package.json` etc. diretamente na raiz, sem pasta contêiner extra.

## Sem mudanças
- preço Academy R$ 99,90;
- persistência de perfil;
- Labs/Challenges e gate de matrícula;
- login/sessão;
- migrations existentes.
