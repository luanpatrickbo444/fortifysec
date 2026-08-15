# FortifySec V7.14 — Visual Restore + Single Sidebar

Esta versão volta a usar a V7.11 como base visual integral e mantém apenas a correção de uma única sidebar.

## Correção
- `app/painel/layout.tsx` volta a ser o único responsável por montar `DashboardShell`.
- `cursos`, `labs`, `desafios`, `ctf`, `ranking`, `perfil` e `pagamentos` possuem `layout.tsx` pass-through para sobrescrever layouts antigos que possam ter ficado no GitHub.
- Nenhum layout de seção monta `DashboardShell`.
- CSS e `DashboardShell.tsx` permanecem idênticos à V7.11 que estava visualmente correta.

## Preservado da V7.11
- preço Academy R$ 99,90;
- persistência do Perfil;
- páginas Labs e Challenges com estado bloqueado/vazio/erro;
- sessão LOGIN / PAINEL / SAIR;
- gate de matrícula do CyberLab;
- Academy e painel administrativo existentes.
