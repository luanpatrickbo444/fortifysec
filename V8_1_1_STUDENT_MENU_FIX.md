# FortifySec V8.1.1 — Student Panel Menu Fix

## Correção
- `app/painel/layout.tsx` continua sendo o único responsável por montar `DashboardShell`.
- Todas as seções do painel do aluno agora possuem `layout.tsx` pass-through explícito:
  - `/painel/cursos`
  - `/painel/labs`
  - `/painel/desafios`
  - `/painel/ctf`
  - `/painel/ranking`
  - `/painel/pagamentos`
  - `/painel/perfil`
- Isso sobrescreve layouts residuais/antigos que possam existir no repositório durante deploy incremental.
- Nenhum arquivo da área `/admin` foi alterado.
- Nenhum SQL novo é necessário.

## Resultado esperado
- Exatamente um menu lateral da plataforma em todas as rotas `/painel/*`.
- Menu administrativo preservado sem alterações.
