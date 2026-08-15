# FortifySec V4 COMPLETE

Plataforma unificada com visual Cyber Range/HTB e módulos Academy, Labs, Challenges, CTF, Ranking, Talent Network, pagamentos e administração.

## Requisitos
- Node.js >= 20.9
- Next.js 16.2.11
- React 19.2.7
- Supabase
- Mercado Pago para checkout real
- Vercel ou runtime Node compatível

## Instalação
```bash
npm install
cp .env.example .env.local
npm run dev
```

## Banco
Execute no Supabase SQL Editor, nesta ordem:
1. `supabase/migrations/001_final_schema.sql`
2. `supabase/migrations/002_labs_challenges_ctf.sql`

Depois crie sua conta e promova apenas seu usuário administrador:
```sql
update public.profiles
set role = 'admin'
where email = 'SEU_EMAIL';
```

## Regras importantes
- Cadastro cria conta, não matrícula.
- Estudante não possui policy para INSERT/UPDATE/DELETE em `enrollments`.
- Checkout cria `pending`; somente webhook Mercado Pago aprovado ou admin muda para `active`.
- Aula exige matrícula ativa.
- Progresso e XP são gravados no servidor.
- Challenge não expõe flag; validação é RPC server-side com hash.
- Lab não expõe connection_url no catálogo; sessão é criada por server action.
- Conta bloqueada perde acesso protegido.
- Service/secret key nunca vai para o browser.

## Páginas
Veja `ROUTES.md` para o mapa completo.

## Recuperação de senha
A V4 corrige o fluxo PKCE: o link de recuperação volta para `/auth/callback?next=/atualizar-senha`, troca o code por sessão e só então abre a tela de nova senha.

## Deploy Vercel
Cadastre as variáveis de `.env.example`, faça deploy sem cache na primeira publicação e teste os fluxos de autenticação, pagamento, matrícula, curso, Lab, Challenge e admin antes de apontar o domínio principal.
