# FortifySec — pacote completo resolvido

Base: V7.12 original.

Estrutura crítica validada:
- `app/layout.tsx` importa `./globals.css`.
- `app/painel/layout.tsx` monta exatamente um `DashboardShell`.
- `app/painel/labs/layout.tsx` e `app/painel/desafios/layout.tsx` são pass-through.
- Não existe `panel.css`.
- Não existe `prebuild-ui-guard.mjs`.
- Formação principal usa R$ 99,90 no painel e checkout.
- Perfil é persistido server-side no próprio `user.id`.
- CyberLab/Challenges exigem acesso por matrícula ativa para aluno.
