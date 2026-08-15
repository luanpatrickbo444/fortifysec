# FortifySec V4 — mapa de páginas

## Públicas
- `/` — home
- `/academy` — visão pública da Academy
- `/labs` — visão pública do Cyber Range
- `/ctf` — visão pública do CTF
- `/talentos` — Talent Network
- `/login` — login
- `/cadastro` — cadastro
- `/recuperar-senha` — recuperação
- `/atualizar-senha` — definição da nova senha após callback
- `/bloqueado` — conta bloqueada

## Aluno / operador
- `/painel` — dashboard
- `/painel/cursos` — catálogo, matrícula e checkout
- `/curso/[slug]` — aulas, vídeo, progresso e XP
- `/painel/labs` — catálogo de Labs
- `/painel/labs/[slug]` — sessão do Lab
- `/painel/desafios` — catálogo de Challenges
- `/painel/desafios/[slug]` — submissão de flag
- `/painel/ctf` — eventos CTF
- `/painel/ranking` — ranking
- `/painel/pagamentos` — histórico de pagamento
- `/painel/perfil` — perfil técnico e Talent Network

## Admin
- `/admin` — dashboard administrativo
- `/admin/cursos` — cursos
- `/admin/aulas` — aulas
- `/admin/matriculas` — matrículas
- `/admin/usuarios` — usuários, bloqueio e role
- `/admin/labs` — Labs
- `/admin/desafios` — Challenges
- `/admin/ctf` — eventos CTF
- `/admin/pagamentos` — pagamentos

## Backend
- `POST /api/checkout` — cria preferência Mercado Pago + matrícula pending
- `POST /api/webhooks/mercadopago` — valida assinatura, consulta pagamento e ativa matrícula
- `GET /auth/callback` — troca PKCE code por sessão e respeita `next`
- `GET /auth/confirm` — confirmação OTP/token hash
