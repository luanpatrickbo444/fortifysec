# FortifySec V7.9 — Labs, Challenges e sessão

- `/painel/labs` reconstruída como página interna completa do Cyber Range.
- `/painel/desafios` reconstruída como página interna completa de missões.
- Ambas exibem estrutura visual mesmo quando não existem itens publicados.
- Aluno sem matrícula ativa vê gate de acesso; não recebe catálogo nem workspace.
- Páginas de aluno não dependem mais de `createAdminClient()` para carregar catálogo/detalhes.
- Detalhes de Lab e Challenge usam a sessão do próprio usuário e RLS.
- Header público passou a refletir autenticação em tempo real.
- Deslogado: `LOGIN`.
- Logado: `PAINEL` + `SAIR`.
- Durante resolução da sessão: `SESSÃO...` (evita flash incorreto de LOGIN).
- Header público é ocultado em `/dashboard`, `/painel/*` e `/admin/*`.
- Sidebar interna ganhou `ENCERRAR SESSÃO`.
- Mensagens de erro de consulta são mostradas dentro da página em vez de resultar em área aparentemente vazia.
