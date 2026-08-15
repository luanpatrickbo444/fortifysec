# FortifySec V7.1 — Login e Home

- Login de estudante redireciona para `/dashboard`.
- Login de administrador continua redirecionando para `/admin`.
- `/dashboard` contém o Command Center completo do aluno.
- `/painel` continua existindo como alias e redireciona para `/dashboard`.
- Rotas internas permanecem em `/painel/cursos`, `/painel/labs`, `/painel/desafios`, `/painel/ctf`, `/painel/ranking`, `/painel/pagamentos` e `/painel/perfil`.
- `/` agora renderiza a página completa da Academy.
- `/academy` continua disponível normalmente.
- Callback de confirmação e recuperação de sessão usa `/dashboard` como destino padrão.
