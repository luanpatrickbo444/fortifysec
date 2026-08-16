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

## V8.1 — Employer Console
- `/empresa/login` — login empresarial redesenhado.
- `/empresa/cadastro` — criação de conta empresarial.
- `/empresa` — Command Center da empresa.
- `/empresa/vagas` — gestão e filtros de vagas.
- `/empresa/vagas/nova` — cadastro de vaga/rascunho.
- `/empresa/vagas/[id]/editar` — edição da oportunidade.
- `/empresa/talentos` — Talent Search e shortlist empresarial.
- `/empresa/candidatos` — pipeline e gestão de candidaturas.

## V8.2 — fluxo autenticado
- `/painel` — Command Center oficial do aluno.
- `/dashboard` — alias legado; redireciona para `/painel`.
- `/curso/[slug]` — curso ativo dentro do mesmo shell autenticado do aluno.
- `/painel/curso/[slug]` — alias legado; redireciona para `/curso/[slug]`.
- Usuário com `role=admin` no `/painel/*` mantém a navegação do aluno e recebe `ADMIN ACCESS` + atalho para `/admin`.
- `/admin/*` usa shell administrativo dedicado.
