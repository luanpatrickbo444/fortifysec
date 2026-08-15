# FortifySec V7 — Operations Console

Projeto Next.js + Supabase + Mercado Pago com Academy, Cyber Labs, Challenges, CTF, ranking, área do aluno e administração operacional.

## O que mudou na V7

A área do aluno agora funciona como Command Center: formação, progresso, Labs, Challenges, CTF, ranking e atividade em uma única home interna.

O administrador ganhou uma Operations Console completa com:
- cursos e trilhas;
- Course Studio individual por curso;
- módulos e aulas dentro da grade;
- vídeo, conteúdo, XP, posição e status de publicação;
- Labs e Challenges;
- CTF com estado e Challenges vinculados;
- usuários, roles, matrículas e pagamentos;
- configurações públicas da plataforma.

## Banco

Execute as migrations em ordem:

```text
001_final_schema.sql
002_labs_challenges_ctf.sql
003_operations_console.sql
```

A migration 003 cria `course_modules`, adiciona metadados/publicação às aulas, cria `site_settings` e vinculação `ctf_event_challenges`.

## Admin

Acesse `/admin/login`. Sua conta precisa ter `profiles.role = 'admin'`. Use `supabase/ADMIN_SETUP.sql` para promover a conta inicial.

## Deploy

Consulte `VERCEL_CHECKLIST.md`.
