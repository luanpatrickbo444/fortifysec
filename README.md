# FortifySec

Plataforma da formação FortifySec pronta para a Vercel. Inclui landing page,
login por e-mail e senha, área do aluno, player do YouTube, progresso, painel
administrativo e liberação automática após pagamento aprovado no Mercado Pago.

## Requisitos

- Node.js 22 ou superior
- Projeto no Supabase
- Aplicação no Mercado Pago

## Executar localmente

```bash
npm install
cp .env.example .env.local
npm run dev
```

Abra `http://localhost:3000`.

## 1. Configurar o Supabase

1. Crie um projeto no Supabase.
2. Abra **SQL Editor**, cole o conteúdo de `supabase/schema.sql` e execute.
3. Em **Authentication > URL Configuration**, defina a URL pública do site e
   adicione `https://seu-dominio.vercel.app/**` às URLs permitidas.
4. Em **Authentication > Providers > Email**, mantenha e-mail e senha ativos.
5. Copie a URL, a chave pública e a service role em **Project Settings > API**.

Depois de criar sua conta pelo site, torne seu usuário administrador no SQL
Editor:

```sql
update public.profiles
set role = 'admin'
where email = 'seu@email.com';
```

Nunca exponha a `SUPABASE_SERVICE_ROLE_KEY` no navegador ou no GitHub.

## 2. Configurar o Mercado Pago

Preencha a variável abaixo no arquivo `.env.local`:

```env
MERCADO_PAGO_ACCESS_TOKEN=SEU_ACCESS_TOKEN
MERCADO_PAGO_WEBHOOK_SECRET=SEGREDO_DA_ASSINATURA_WEBHOOK
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_CHAVE_PUBLICA
SUPABASE_SERVICE_ROLE_KEY=SUA_SERVICE_ROLE
NEXT_PUBLIC_SITE_URL=https://seu-dominio.vercel.app
```

No painel do Mercado Pago, cadastre o Webhook de pagamentos:

```text
https://seu-dominio.vercel.app/api/mercadopago/webhook
```

Ative eventos de **Pagamentos** e copie a assinatura secreta para
`MERCADO_PAGO_WEBHOOK_SECRET`. A aplicação valida a assinatura, consulta o
pagamento diretamente no Mercado Pago, confere o valor de R$ 2.997 e libera o
curso para o usuário vinculado à compra.

Não envie `.env.local` ao GitHub. Ele já está protegido pelo `.gitignore`.

## 3. Publicar na Vercel

1. Envie esta pasta para um repositório no GitHub.
2. Na Vercel, escolha **Add New > Project** e importe o repositório.
3. Confirme o preset **Next.js**.
4. Em **Environment Variables**, cadastre todas as variáveis de `.env.example`.
5. Clique em **Deploy**.

## Comandos

```bash
npm run dev
npm run build
npm start
npm run lint
```

## Arquivos principais

- `app/page.tsx`: página da FortifySec
- `app/globals.css`: layout, animações e responsividade
- `app/portal.css`: design completo do login, dashboard, player e painel admin
- `app/api/checkout/route.ts`: criação do checkout Mercado Pago
- `app/api/mercadopago/webhook/route.ts`: confirmação e liberação automática
- `app/login/`: login, cadastro e recuperação de senha
- `app/area/`: catálogo particular do aluno
- `app/curso/[id]/`: player, aulas e progresso
- `app/admin/`: cadastro de cursos, módulos, vídeos e acessos
- `supabase/schema.sql`: banco de dados completo
- `app/layout.tsx`: metadados, idioma e fontes locais
- `SECURITY.md`: controles aplicados e checklist obrigatório de lançamento

## Cadastrar vídeos

Entre com o usuário administrador, acesse `/admin`, crie o módulo e cole o
link do YouTube no formulário **Nova aula**. São aceitos links públicos, não
listados, `youtu.be`, Shorts e URLs de incorporação. O aluno assiste dentro da
plataforma pelo player com privacidade aprimorada do YouTube.
