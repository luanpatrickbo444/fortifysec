# FortifySec V7.7 — Dashboard RSC Boundary Fix

## Correção principal
- `components/DashboardShell.tsx` agora é um Client Component.
- Isso mantém os componentes de ícone do `lucide-react` e o `DashboardNav` no mesmo boundary cliente.
- Evita a serialização de funções/componentes (`Gauge`, `Boxes`, `Trophy`, etc.) de Server Component para Client Component, que podia derrubar `/dashboard` durante o render mesmo após as consultas do Supabase terminarem corretamente.

## Sintoma corrigido
Tela genérica:
`Não foi possível carregar um bloco do painel.`

Esse erro podia acontecer depois do `try/catch` de dados, durante a serialização do React Server Components.
