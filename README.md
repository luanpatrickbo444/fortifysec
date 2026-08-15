# FortifySec Unified — Academy + Labs + Challenges + CTF

Versão unificada da plataforma FortifySec em Next.js + Supabase + Mercado Pago, com a identidade visual do novo **FortifySec Labs / cyber range** aplicada também à Academy e à administração.

## O que está incluído

### Conta e acesso
- Cadastro por e-mail e senha.
- Confirmação de e-mail.
- Login/logout.
- Recuperação e troca de senha.
- Perfil `student` e `admin`.
- Bloqueio administrativo validado nas páginas **e nas RLS policies**.
- Service Role somente em código server-side.

### Academy
- Catálogo de cursos.
- Aulas com texto e URL de vídeo/YouTube/streaming.
- Matrícula `pending`, `active`, `blocked` ou `expired`.
- Aluno **não possui permissão de banco para criar/ativar matrícula**.
- Checkout Mercado Pago cria apenas estado pendente.
- Webhook assinado consulta o pagamento no Mercado Pago e confere valor/moeda antes da liberação.
- Progresso por aula.
- XP por conclusão sem possibilidade de marcar/desmarcar repetidamente para farmar XP.

### Cyber Range
- Catálogo de Labs.
- Acesso aos Labs exige matrícula ativa.
- Endpoint do Lab não é liberado no catálogo.
- Sessão iniciada por Server Action após nova validação de acesso.
- Suporte a endpoint fixo/VPN por Lab.
- Suporte opcional a provedor real de VM/cyber range via `LAB_PROVIDER_API_URL`.
- Encerramento, expiração e revogação de sessão.

### Challenges
- Categorias e dificuldade.
- XP por resolução.
- Flag armazenada como SHA-256 no banco.
- Flag correta é validada em função `security definer`; o hash não é enviado ao frontend.
- Uma resolução só premia XP uma vez.

### CTF, Ranking e Talentos
- Eventos CTF com início, fim, status e premiação.
- Ranking global por XP real.
- Perfil técnico com headline, GitHub e LinkedIn.
- `profile_public` e `open_to_work` são opt-in.
- Talent Network mostra apenas perfis que o próprio aluno tornou públicos.

### Administração
- Cursos: criar, publicar e retirar do catálogo.
- Aulas: criar e associar a cursos.
- Matrículas: conceder/alterar status.
- Usuários: bloquear/desbloquear e mudar role.
- Labs: cadastrar endpoint/fallback e Provider Lab ID.
- Challenges: cadastrar flag sem expô-la ao frontend.
- CTF: cadastrar eventos.

## Instalação local

```bash
npm install
cp .env.example .env.local
npm run dev
```

Abra `http://localhost:3000`.

## Banco Supabase

Em um projeto novo, execute no SQL Editor, nessa ordem:

```text
supabase/migrations/001_final_schema.sql
supabase/migrations/002_labs_challenges_ctf.sql
```

Depois crie sua conta pelo próprio site e promova **somente o primeiro administrador** manualmente:

```sql
update public.profiles
set role = 'admin'
where email = 'seu-email@dominio.com';
```

A partir daí, roles dos demais usuários podem ser administradas pelo painel.

## Variáveis Supabase

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

Nunca crie variável `NEXT_PUBLIC_...` para a Service Role.

## Mercado Pago

```env
MERCADO_PAGO_ACCESS_TOKEN=...
MERCADO_PAGO_WEBHOOK_SECRET=...
```

Webhook:

```text
https://SEU_DOMINIO/api/webhooks/mercadopago
```

A integração espera notificações de `payment`. Sem `MERCADO_PAGO_WEBHOOK_SECRET`, o endpoint de webhook recusa a liberação.

## Provedor real de Labs — opcional

Sem provedor, o administrador pode cadastrar um endpoint/VPN fixo em cada Lab.

Com provedor, configure:

```env
LAB_PROVIDER_API_URL=https://seu-range-provider.exemplo/api
LAB_PROVIDER_API_KEY=...
```

Contrato esperado para iniciar uma sessão:

```http
POST /sessions
Authorization: Bearer <LAB_PROVIDER_API_KEY>
Content-Type: application/json
```

Body:

```json
{
  "user_id": "uuid-do-aluno",
  "lab_id": "provider-lab-id",
  "ttl_minutes": 60
}
```

Resposta:

```json
{
  "session_id": "provider-session-id",
  "connection_url": "https://... ou vpn://...",
  "expires_at": "2026-08-15T18:00:00Z"
}
```

Para encerrar:

```http
DELETE /sessions/{session_id}
```

## Regras de matrícula

O bloqueio existe em duas camadas:

1. **Aplicação:** Server Components e Server Actions validam o usuário e a matrícula.
2. **Banco:** RLS impede o token de estudante de inserir ou atualizar `enrollments` e impede acesso a aulas/progresso quando a conta estiver bloqueada ou sem matrícula ativa.

Alterar HTML, remover `disabled`, forjar uma requisição no DevTools ou chamar a API do Supabase diretamente não cria uma matrícula ativa.

## Design

A identidade está centralizada em `app/globals.css` e usa o novo conceito FortifySec Labs:
- fundo preto/grafite;
- verde ácido;
- grid técnico;
- terminal/cyber range;
- cards retos e densos;
- sidebar operacional;
- Academy, Labs, Challenges e Admin com a mesma linguagem visual.

## Estrutura principal

```text
app/
  admin/
    aulas/
    ctf/
    cursos/
    desafios/
    labs/
    matriculas/
    usuarios/
  api/
    checkout/
    webhooks/mercadopago/
  curso/[slug]/
  painel/
    cursos/
    ctf/
    desafios/
    labs/
    perfil/
    ranking/
  talentos/
components/
lib/
supabase/migrations/
```

## Antes de produção

Use `VERCEL_CHECKLIST.md` e teste o fluxo completo com uma conta estudante separada da conta administradora.
