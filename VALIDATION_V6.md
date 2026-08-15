# FortifySec V6 — validação

- 32 páginas (`app/**/page.tsx`).
- 37 cursos na grade pública da Academy, todos únicos.
- 6 trilhas; soma declarada: 633 horas.
- 0 padrões de rota dinâmica ambíguos.
- 0 imports locais ausentes na verificação estática.
- CSS com chaves balanceadas.
- TypeScript: 0 erros de sintaxe no parse estático (`tsc --noResolve`).
- `npm install` não concluiu dentro do limite do ambiente; portanto o `next build` completo ainda deve ser confirmado no Vercel/CI.

## Admin
- `/admin/login` usa `adminLoginAction`.
- O login geral também detecta role e redireciona administradores para `/admin`.
- `supabase/ADMIN_SETUP.sql` promove a primeira conta para role `admin`.
