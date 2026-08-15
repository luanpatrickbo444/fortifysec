# FortifySec V5 COMPLETE

Plataforma Next.js + Supabase + Mercado Pago com identidade visual FortifySec Labs / cyber range.

## V5

A V5 restaura e padroniza as páginas internas que faltavam:

- Academy/cursos com progresso real e checkout com loading;
- Lab catalog + workspace individual;
- Challenges + missão individual e envio de flag;
- ranking com pódio Top 3;
- perfil técnico com XP, nível, rank e métricas;
- Admin Content Studio para postagem de aulas;
- página de planos Grátis e Pro R$ 99,90;
- feedback de carregamento em ações reais.

Leia `V5_CHANGES.md`, `ROUTES.md` e `VERCEL_CHECKLIST.md` antes do deploy.

## Banco

Execute as migrations existentes na ordem:

1. `supabase/migrations/001_final_schema.sql`
2. `supabase/migrations/002_labs_challenges_ctf.sql`

## Vercel

Configure as variáveis de ambiente conforme `.env.example` e `VERCEL_CHECKLIST.md`.

## Segurança

- estudante não cria/ativa matrícula pelo navegador;
- conteúdo exige matrícula ativa;
- flags são verificadas server-side;
- endpoint de Lab só é obtido depois de autorização;
- Service Role/Secret Key é somente server-side.

## V6 — Login admin e Academy completa

- Login geral redireciona por `profiles.role`: `admin` → `/admin`, estudante → `/painel`.
- Gateway administrativo dedicado: `/admin/login`.
- Para a primeira conta admin, execute `supabase/ADMIN_SETUP.sql` após criar e confirmar o usuário.
- A página `/academy` contém 6 trilhas, 37 cursos e 633 horas.
- Textos públicos foram revisados para comunicar benefícios e jornada, sem expor regras internas de RLS/webhook/liberação.
