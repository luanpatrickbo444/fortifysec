# FortifySec V7 — checklist de produção

1. Root Directory deve apontar para a pasta que contém `package.json`.
2. Node.js >= 20.9.
3. Configure no Vercel:
   - `NEXT_PUBLIC_SITE_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` ou `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SECRET_KEY` ou `SUPABASE_SERVICE_ROLE_KEY`
   - `MERCADO_PAGO_ACCESS_TOKEN`
   - `MERCADO_PAGO_WEBHOOK_SECRET`
   - opcionais: `LAB_PROVIDER_API_URL`, `LAB_PROVIDER_API_KEY`
4. No Supabase execute, nesta ordem:
   - `001_final_schema.sql`
   - `002_labs_challenges_ctf.sql`
   - `003_operations_console.sql`
5. Configure Site URL e Redirect URLs no Supabase Auth.
6. Execute `ADMIN_SETUP.sql` para promover sua conta administrativa.
7. Configure o webhook do Mercado Pago.
8. Faça um Redeploy sem reutilizar o Build Cache após atualizar migrations/variáveis.
9. Smoke test do aluno: login → Command Center → curso → módulo/aula → Lab → Challenge → CTF → ranking → perfil.
10. Smoke test do admin: `/admin/login` → curso → módulo → aula → publicação → Lab → Challenge → CTF → usuário → matrícula → pagamento → configurações.
11. Só depois associe o domínio principal ao deployment aprovado.
