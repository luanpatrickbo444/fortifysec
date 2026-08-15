# Aplicação V7.11

1. Substitua o código anterior pela V7.11 limpa e faça deploy.
2. No Supabase SQL Editor execute:
   `supabase/migrations/005_pricing_profile_persistence.sql`
3. Confirme o resultado:
   - `academy_price_cents = 9990`
   - `profile_update_policy_ok = true`
4. Verifique conteúdo do Cyber Range:

```sql
select
  (select count(*) from public.labs) as labs_total,
  (select count(*) from public.labs where published=true) as labs_publicados,
  (select count(*) from public.challenges) as challenges_total,
  (select count(*) from public.challenges where published=true) as challenges_publicados;
```

Se os publicados forem 0, a V7.11 mostrará o estado vazio dentro do painel até o admin cadastrar/publicar conteúdo.

5. Teste perfil:
   - altere nome/headline/GitHub/LinkedIn;
   - mude perfil para público;
   - mude Open to Work para Sim;
   - salve e recarregue `/painel/perfil`.
