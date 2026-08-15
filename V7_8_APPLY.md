# Aplicação da V7.8

1. Substitua o código do deployment pela V7.8.
2. No Supabase SQL Editor, execute somente a migration nova:
   `supabase/migrations/004_cyberlab_enrollment_gate.sql`
3. Faça logout/login da conta de teste.
4. Teste sem matrícula ativa:
   - `/painel/labs` deve mostrar o gate de acesso.
   - URL direta `/painel/labs/<slug>` deve voltar para `/painel/labs`.
5. Ative uma matrícula no admin.
6. Teste novamente:
   - Labs aparecem.
   - Detalhe abre.
   - `INICIAR LAB` pode provisionar a sessão.
