# FortifySec — Auth Redirect Loop Fix

Pacote completo baseado na base FortifySec completa com Azure, com o patch de autenticação aplicado.

Arquivos alterados pelo patch:
- `components/SiteHeader.tsx`
- `lib/auth.ts`
- `app/actions.ts`

Arquivos visuais preservados:
- `app/globals.css`
- `app/layout.tsx`
- `components/DashboardShell.tsx`

Objetivo:
- evitar crash do SiteHeader quando a configuração pública do Supabase estiver ausente;
- remover loop de redirecionamento entre login comum e login de empresa;
- exigir vínculo com empresa ativa antes de entrar em `/empresa`.
