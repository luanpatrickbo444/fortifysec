-- FortifySec local Cyber Range smoke lab.
-- Execute after the existing Labs migrations.
insert into public.labs (
  title,
  slug,
  description,
  instructions,
  difficulty,
  estimated_minutes,
  tags,
  provider_lab_id,
  published
)
values (
  'OWASP Juice Shop — Local Range',
  'owasp-juice-shop-local',
  'Ambiente web isolado para validar o provisionamento local do Cyber Range.',
  'Inicie a sessao, abra o target local e use somente este ambiente autorizado para os testes.',
  'Easy',
  60,
  array['web','owasp','local-range'],
  'web-juice-01',
  true
)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  instructions = excluded.instructions,
  difficulty = excluded.difficulty,
  estimated_minutes = excluded.estimated_minutes,
  tags = excluded.tags,
  provider_lab_id = excluded.provider_lab_id,
  published = true,
  updated_at = now();
