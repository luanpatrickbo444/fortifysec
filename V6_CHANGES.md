# FortifySec V6 — Academy + Admin Access

## Corrigido
- Login comum detecta `profiles.role` e redireciona administradores diretamente para `/admin`.
- Nova rota `/admin/login` com autenticação exclusiva para contas `role = admin`.
- Conta estudante não entra pelo gateway administrativo.
- `app/layout.tsx` direciona o CTA autenticado para `/admin` quando a conta logada é administradora.
- Academy pública reconstruída com 6 trilhas, 37 cursos e 633 horas.
- Textos públicos não explicam RLS, webhook ou regras internas de ativação de matrícula.
- Cadastro, Home, Labs, CTF, Planos e telas internas receberam copy mais orientada ao usuário.
- Adicionado `supabase/ADMIN_SETUP.sql` para promover a primeira conta admin.

## Login administrativo
1. Garanta que a conta existe e está confirmada no Supabase Auth.
2. Execute `supabase/ADMIN_SETUP.sql` trocando o e-mail placeholder.
3. Acesse `/admin/login`.
4. Use o e-mail e senha dessa conta.

## Rotas
- `/login` — login geral, com redirect por role.
- `/admin/login` — gateway exclusivo administrativo.
- `/admin` — Control Center protegido por `requireAdmin()`.
