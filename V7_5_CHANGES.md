# FortifySec V7.5 — Auth + Dashboard Hard Fix

## Corrigido
- Dashboard deixou de depender de nested relations do PostgREST (`courses(...)`, `labs(...)`, `challenges(...)`).
- Relações do dashboard agora são carregadas por IDs e montadas no servidor, compatível com bancos legados sem todas as FKs descobertas pelo schema cache.
- Dashboard tenta sincronizar `auth.users -> public.profiles` ao abrir.
- Dashboard possui fallback fatal interno e não derruba mais a rota inteira por falha de um módulo.
- Login comum sincroniza o perfil antes de decidir entre `/dashboard` e `/admin`.
- Login administrativo valida a role pelo client server-side administrativo.
- `requireAdmin()` usa o client administrativo depois de validar a sessão, evitando dependência de RLS legado para descobrir a role.
- Cadastro tenta criar/sincronizar o perfil imediatamente.

## SQL novo
- `supabase/migrations/001c_auth_profiles_sync.sql`: recria `handle_new_user`, trigger `on_auth_user_created`, sincroniza usuários existentes e mantém roles já atribuídas.
- `supabase/ADMIN_VALIDATE_AND_PROMOTE.sql`: diagnóstico e promoção explícita da conta administrativa.

## Ordem para banco legado já migrado
Se `000`, `001b`, `002` e `003` já foram executados, execute apenas:
1. `001c_auth_profiles_sync.sql`
2. `NOTIFY pgrst, 'reload schema';`
3. Promova a conta usando `ADMIN_VALIDATE_AND_PROMOTE.sql`.
