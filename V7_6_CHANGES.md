# FortifySec V7.6 — TypeScript login fix

- Corrige o erro de build em `app/actions.ts`:
  `Type '{ role; blocked } | null' is not assignable to type 'ApplicationProfile | null'`.
- O fluxo de login passa a usar um tipo mínimo explícito `{ role, blocked }` para decidir o destino.
- O fallback do perfil normaliza `role` e `blocked` antes da atribuição.
- O login administrativo usa `return redirect(...)` nos ramos de erro, tornando a análise de nulabilidade explícita.
- Nenhuma migration adicional é necessária para esta correção de código.
