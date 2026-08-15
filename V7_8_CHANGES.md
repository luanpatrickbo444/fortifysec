# FortifySec V7.8 — Labs + Challenges

- Recriada a página interna `/painel/labs` como Cyber Range operacional.
- Recriada a página interna `/painel/desafios` como catálogo de missões.
- Aluno sem matrícula ativa vê um gate de acesso e não recebe a lista interna de Labs/Challenges.
- Detalhe `/painel/labs/[slug]` valida matrícula/role server-side antes de buscar o Lab.
- `startLabAction` revalida matrícula ativa no servidor antes de provisionar sessão.
- Admin pode acessar o Cyber Range para operação/teste mesmo sem matrícula.
- Adicionada migration `004_cyberlab_enrollment_gate.sql` para exigir matrícula ativa também no RLS de `labs` e `lab_sessions`.
- Página de Challenges usa a mesma validação de acesso da plataforma e mantém submissão de flag protegida pelo RPC.
