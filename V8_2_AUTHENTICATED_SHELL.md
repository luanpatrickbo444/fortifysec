# FortifySec V8.2 — Fluxo autenticado unificado

Esta versão remove os patches de menu por DOM e devolve a navegação ao layout autenticado.

## Fluxo final

- `/painel/*`: shell do aluno renderizado pelo `app/painel/layout.tsx`.
  - Conta `admin`: continua usando o painel do aluno, mas recebe um atalho permanente **Admin Console**.
  - Conta vinculada a empresa: recebe atalho **Painel da empresa**.
- `/admin/*`: as páginas administrativas continuam protegidas por `requireAdmin()` e usam `DashboardShell admin`.
  - O shell admin agora mostra apenas a navegação administrativa, com um atalho **Painel do aluno**.
- `/empresa/*`: mantém o Employer Console V8.1.
- `/dashboard`: alias legado que redireciona para `/painel`.

## O que foi removido

- `StudentPanelSidebarGuard`.
- `MutationObserver` para procurar `.sidebar`.
- `document.querySelector()` para decidir menu.
- padding global no `body` para compensar sidebar injetada.
- layouts pass-through por seção em `/painel/*`.

## Arquivos centrais

- `components/DashboardShell.tsx`
- `components/DashboardNav.tsx`
- `components/SiteHeader.tsx`
- `app/painel/layout.tsx`
- `app/painel/page.tsx`
- `app/dashboard/page.tsx`
- `app/globals.css`
- `lib/auth.ts`
- `app/actions.ts`

Nenhuma nova migration SQL é necessária para o V8.2.
