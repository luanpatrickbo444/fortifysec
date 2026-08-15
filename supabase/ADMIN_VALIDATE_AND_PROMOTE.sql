-- 1) Troque o e-mail abaixo pelo e-mail que deve administrar a FortifySec.
-- 2) Execute no Supabase SQL Editor.

-- Diagnóstico antes da promoção
select
  u.id,
  u.email as auth_email,
  u.email_confirmed_at,
  p.name,
  p.email as profile_email,
  p.role,
  p.blocked
from auth.users u
left join public.profiles p on p.id=u.id
where lower(u.email)=lower('SEU_EMAIL_ADMIN@DOMINIO.COM');

-- Promove a conta existente. Não cria senha; a senha continua sendo a do Supabase Auth.
update public.profiles p
set role='admin', blocked=false, updated_at=now()
from auth.users u
where p.id=u.id
  and lower(u.email)=lower('SEU_EMAIL_ADMIN@DOMINIO.COM');

-- Resultado esperado: role=admin e blocked=false
select
  u.id,
  u.email,
  u.email_confirmed_at,
  p.name,
  p.role,
  p.blocked
from auth.users u
join public.profiles p on p.id=u.id
where lower(u.email)=lower('SEU_EMAIL_ADMIN@DOMINIO.COM');
