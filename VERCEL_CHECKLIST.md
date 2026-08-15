# FortifySec V4 — checklist Vercel

1. Root Directory deve apontar para a pasta que contém `package.json`.
2. Node.js >= 20.9.
3. Cadastre Environment Variables para Production e Preview:
   - `NEXT_PUBLIC_SITE_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` ou `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SECRET_KEY` ou `SUPABASE_SERVICE_ROLE_KEY`
   - `MERCADO_PAGO_ACCESS_TOKEN`
   - `MERCADO_PAGO_WEBHOOK_SECRET`
   - opcionais: `LAB_PROVIDER_API_URL`, `LAB_PROVIDER_API_KEY`
4. No Supabase execute `001_final_schema.sql` e depois `002_labs_challenges_ctf.sql`.
5. No Supabase Auth configure Site URL e Redirect URLs do domínio Vercel/domínio final.
6. No Mercado Pago configure webhook: `https://SEU_DOMINIO/api/webhooks/mercadopago` e evento Payments.
7. Primeiro deploy: Redeploy sem reutilizar Build Cache.
8. Smoke test: cadastro → confirmação → login → checkout → webhook → matrícula active → curso → progresso → Lab → Challenge → ranking → perfil → admin.
9. Só depois associe `www.fortifysec.com.br` ao Production Deployment.
