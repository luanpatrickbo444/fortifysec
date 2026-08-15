# FortifySec V7.2 — Auth + Type Fix

- Corrigido TypeScript em `app/dashboard/page.tsx` para relação `lab_sessions -> labs`.
- `LOGIN` da navegação pública sempre abre `/login`; não há redirecionamento automático a partir do layout.
- Login só decide destino após `signInWithPassword`.
- Conta existente + senha correta: student -> `/dashboard`, admin -> `/admin`.
- Conta existente + senha errada: permanece em `/login` com mensagem de senha incorreta.
- E-mail sem conta em `profiles`: segue para `/cadastro` com e-mail pré-preenchido.
- `/` continua renderizando a Academy.
- `/painel` continua alias para `/dashboard`.
