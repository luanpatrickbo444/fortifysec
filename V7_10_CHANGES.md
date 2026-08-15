# FortifySec V7.10 — Painel Labs/Challenges Layout Fix

## Correções principais

- Criado `app/painel/labs/layout.tsx`.
- Criado `app/painel/desafios/layout.tsx`.
- O `DashboardShell` agora pertence ao segmento de rota e não ao `page.tsx` de Labs/Challenges.
- `/painel/labs/[slug]` e `/painel/desafios/[slug]` herdam o mesmo shell automaticamente.
- Removido o `DashboardShell` duplicado das páginas de catálogo e detalhes.
- Adicionados `loading.tsx` visíveis para Labs e Challenges.
- Corrigido offset interno antigo de 72px: sidebar usa `top:0`, `height:100vh` e shell usa `min-height:100vh`.
- Adicionado wrapper `.internal-route-page` para garantir área de conteúdo visível.

## Navegação autenticada

Quando existe sessão:
- Labs -> `/painel/labs`
- Challenges -> `/painel/desafios`
- CTF -> `/painel/ctf`
- Painel -> `/dashboard` ou `/admin`, conforme role
- Sair -> encerra sessão

Quando não existe sessão:
- Labs -> `/labs`
- CTF -> `/ctf`
- Login -> `/login`

## Acesso Cyber Range

A regra anterior permanece:
- conta autenticada + matrícula `active` -> catálogo e detalhes liberados;
- sem matrícula `active` -> página interna continua visível, mas mostra o gate `LOCKED` e não lista/provisiona alvos;
- `startLabAction` continua validando acesso no servidor;
- RLS da migration `004_cyberlab_enrollment_gate.sql` continua sendo a última barreira no banco.

Nenhuma migration nova é necessária nesta versão.
