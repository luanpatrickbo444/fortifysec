# V7.4 — rota principal

- `/` — Academy (rewrite interno para `/academy`, URL permanece `/`)
- `/academy` — Academy
- `/planos` — Planos

# FortifySec V7.1 — Rotas

## Público
- `/` — Academy (home principal)
- `/academy` — Academy
- `/labs` — apresentação dos Labs
- `/ctf` — CTF público
- `/planos` — planos
- `/talentos` — Talent Network
- `/login` — login de aluno
- `/cadastro` — cadastro
- `/recuperar-senha` — recuperação de senha
- `/admin/login` — login administrativo

## Aluno
- `/dashboard` — Command Center principal após login
- `/painel` — alias que redireciona para `/dashboard`
- `/painel/cursos`
- `/curso/[slug]`
- `/painel/labs`
- `/painel/labs/[slug]`
- `/painel/desafios`
- `/painel/desafios/[slug]`
- `/painel/ctf`
- `/painel/ranking`
- `/painel/pagamentos`
- `/painel/perfil`

## Admin
- `/admin`
- `/admin/cursos`
- `/admin/cursos/[id]`
- `/admin/aulas`
- `/admin/labs`
- `/admin/desafios`
- `/admin/ctf`
- `/admin/usuarios`
- `/admin/matriculas`
- `/admin/pagamentos`
- `/admin/site`

## V7.8 — Cyber Range
- `/painel/labs` — catálogo interno de Labs; exige matrícula ativa para aluno.
- `/painel/labs/[slug]` — workspace do Lab; exige matrícula ativa para aluno.
- `/painel/desafios` — missões/Challenges; exige acesso ativo da plataforma.
- `/painel/desafios/[slug]` — detalhe e submissão de flag.
