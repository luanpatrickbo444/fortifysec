# Segurança e checklist de lançamento

## Controles implementados

- Autenticação de alunos e administradores pelo Supabase Auth.
- Autorização administrativa verificada no servidor pela função `profiles.role`.
- Conteúdo liberado somente para matrícula `active` ou administrador.
- Progresso aceito apenas para aulas pertencentes a um curso liberado.
- Webhook Mercado Pago com assinatura HMAC, janela antirreplay, consulta direta do pagamento, validação de produto, moeda, valor, usuário e status.
- Chave `service_role` restrita ao servidor.
- Validação e limites para todas as entradas administrativas.
- RLS habilitado em todas as tabelas.
- CSP, HSTS, proteção contra iframe, MIME sniffing e permissões desnecessárias.
- Dependências de produção sem vulnerabilidades conhecidas no `npm audit` da entrega.

## Antes de abrir ao público

1. Use somente credenciais de produção do Mercado Pago e rotacione qualquer chave usada em testes públicos.
2. Configure todas as variáveis de `.env.example` na Vercel; nunca envie `.env.local` ao GitHub.
3. Execute `supabase/schema.sql` no projeto definitivo.
4. Ative confirmação de e-mail, proteção contra senhas vazadas e CAPTCHA no Supabase Auth.
5. Use senha exclusiva e MFA na conta administradora do Supabase e da Vercel.
6. Configure o webhook exatamente como `https://seu-dominio/api/mercadopago/webhook`.
7. Faça uma compra real de baixo risco no ambiente de teste do Mercado Pago e valide aprovação, estorno e chargeback.
8. Ative proteção contra abuso e limites de requisição na Vercel para `/api/checkout`, `/api/mercadopago/webhook` e rotas de autenticação.
9. Configure domínio, DNS, e-mail transacional e política de privacidade/LGPD.
10. Mantenha backups do Supabase e alertas de erro/indisponibilidade.

## Relato responsável

Defina um e-mail de segurança no domínio da FortifySec antes do lançamento e publique-o na política de segurança do repositório.
