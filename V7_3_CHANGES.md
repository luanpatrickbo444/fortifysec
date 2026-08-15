# FortifySec V7.3 — Home Academy + Dashboard resilience

## Corrigido

- `/` agora renderiza explicitamente o mesmo componente visual usado por `/academy`.
- A Academy foi extraída para `components/AcademyPublic.tsx`; não há mais importação de uma `page.tsx` por outra rota.
- `/dashboard` continua protegido por autenticação e recebe `force-dynamic`.
- Consultas de Academy, Labs, Challenges, CTF, ranking, sessões e atividade possuem fallback independente.
- Relações Supabase (`courses`, `labs`, `challenges`) são normalizadas antes de acessar propriedades.
- Uma área opcional indisponível não derruba mais o Command Center inteiro.
- Adicionado `app/dashboard/error.tsx` com recuperação amigável.
- Adicionado `app/dashboard/loading.tsx`.
- Login permanece: credenciais válidas de aluno → `/dashboard`; admin → `/admin`; email sem conta → cadastro.
- `/painel` continua como alias de compatibilidade para `/dashboard`.
