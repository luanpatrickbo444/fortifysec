-- FortifySec V6 — promover uma conta existente a administrador.
-- 1) Crie a conta normalmente na plataforma.
-- 2) Confirme o e-mail.
-- 3) Troque o e-mail abaixo pelo e-mail real do administrador e execute no SQL Editor do Supabase.

update public.profiles
set role = 'admin', blocked = false, updated_at = now()
where lower(email) = lower('SEU_EMAIL_ADMIN@DOMINIO.COM');

-- Conferência:
select id, name, email, role, blocked
from public.profiles
where lower(email) = lower('SEU_EMAIL_ADMIN@DOMINIO.COM');
