# FortifySec V7.13 — Assinatura recorrente Mercado Pago

## O que mudou
- `courses.billing_type` ('one_time' | 'subscription') — a Formação FortifySec virou `subscription`.
- Nova tabela `subscriptions` espelhando o preapproval do Mercado Pago (status, próxima cobrança, etc).
- `app/api/checkout/route.ts`: cursos com `billing_type='subscription'` agora criam um **Preapproval** (assinatura recorrente) em vez de uma Preference (cobrança única). Cursos avulsos continuam no fluxo antigo.
- `app/api/webhooks/mercadopago/route.ts`: agora trata 3 tipos de notificação:
  - `payment` → fluxo antigo de pagamento único.
  - `subscription_preapproval` → assinatura criada/pausada/cancelada/reativada → ativa ou expira a matrícula automaticamente.
  - `subscription_authorized_payment` → cada cobrança mensal processada → mantém a matrícula sincronizada.
- Nova action `adminCancelSubscriptionAction` + botão "CANCELAR" em `/admin/matriculas` pra cancelamento manual, além do automático via webhook.

## Antes de subir para produção
1. Rode a migration `supabase/migrations/006_recurring_subscriptions.sql` no Supabase (SQL Editor), na ordem, depois das anteriores.
2. No painel do Mercado Pago, confirme que o Webhook está escutando os tópicos: **Pagamentos** e **Assinaturas** (preapproval). Sem isso a ativação/cancelamento automático não chega.
3. `MERCADO_PAGO_ACCESS_TOKEN` e `MERCADO_PAGO_WEBHOOK_SECRET` continuam sendo as mesmas variáveis já configuradas na Vercel — nada novo a cadastrar.
4. Teste com uma assinatura de teste (ambiente sandbox do Mercado Pago) antes de liberar em produção: assinar → checar `subscriptions.status='authorized'` e `enrollments.status='active'` → cancelar na própria conta MP de teste → checar que vira `expired`.
