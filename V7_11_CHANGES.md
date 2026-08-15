# FortifySec V7.11 — Product / Panel / Profile Fix

## Corrigido

### Academy — R$ 99,90
- O curso `formacao-fortifysec` passa a usar **R$ 99,90** no card do aluno.
- O checkout também força `9990` centavos para o curso principal, evitando cobrança de R$ 0,00 mesmo se o banco ainda estiver com dado legado.
- A migration `005_pricing_profile_persistence.sql` corrige o registro existente no banco para `price_cents = 9990`.

### Painel interno unificado
- Criado `app/painel/layout.tsx` como layout único para todas as páginas internas.
- Perfil, Cursos, Labs, Challenges, CTF, Ranking e Pagamentos agora compartilham exatamente o mesmo `DashboardShell`.
- Removidos os layouts especiais de `painel/labs` e `painel/desafios`.
- Loading e conteúdo final ficam no mesmo shell, evitando a sensação de troca para outra página.
- Labs e Challenges possuem `error.tsx` próprio com `digest` visível caso haja falha de renderização.
- Sem conteúdo publicado, exibem estado vazio explícito.

### Perfil técnico
- `updateProfileAction` agora valida a sessão e grava server-side somente no `user.id` autenticado.
- Nome, headline, GitHub, LinkedIn, perfil público e Open to Work persistem no banco.
- O nome também é sincronizado para `auth.user.user_metadata`.
- Perfil é renderizado com `force-dynamic` e revalidação desabilitada.
- A migration 005 recria `profiles_update_self` para compatibilidade/RLS.

## Migration nova
Execute apenas depois das migrations anteriores já aplicadas:

`supabase/migrations/005_pricing_profile_persistence.sql`
