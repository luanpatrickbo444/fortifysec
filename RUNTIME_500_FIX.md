# Correção do Internal Server Error no Vercel

## Causa provável
A aplicação usava `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` obrigatoriamente no `proxy.ts` e no Root Layout. Se o projeto Vercel ainda tivesse somente a variável antiga `NEXT_PUBLIC_SUPABASE_ANON_KEY`, o Supabase era criado com uma chave vazia/undefined e a aplicação podia retornar HTTP 500 antes mesmo de renderizar a home.

## Correções aplicadas
- Suporte a `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` **ou** `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Suporte a `SUPABASE_SECRET_KEY` **ou** `SUPABASE_SERVICE_ROLE_KEY` no backend.
- `proxy.ts` não derruba mais páginas públicas quando a configuração pública do Supabase está ausente.
- Root Layout trata falha de autenticação sem transformar a home inteira em HTTP 500.
- Rotas protegidas continuam exigindo configuração Supabase válida.

## Variáveis mínimas no Vercel

Preferidas (Supabase atual):

```env
NEXT_PUBLIC_SITE_URL=https://www.fortifysec.com.br
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SECRET_KEY=sb_secret_...
```

Ou, temporariamente, chaves legacy:

```env
NEXT_PUBLIC_SITE_URL=https://www.fortifysec.com.br
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

Nunca exponha `SUPABASE_SECRET_KEY` nem `SUPABASE_SERVICE_ROLE_KEY` como variável `NEXT_PUBLIC_*`.

Depois de alterar variáveis no Vercel, faça um novo deployment. Deployments já existentes não recebem mudanças de Environment Variables retroativamente.
