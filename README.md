# FortifySec V7.1

> **Plataforma de formação prática em cibersegurança, Cyber Range, Labs, Challenges, CTF e desenvolvimento de carreira.**

![Next.js](https://img.shields.io/badge/Next.js-Platform-black?logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ECF8E?logo=supabase\&logoColor=white)
![Mercado Pago](https://img.shields.io/badge/Mercado%20Pago-Payments-009EE3)
![Vercel](https://img.shields.io/badge/Vercel-Deploy-black?logo=vercel)

---

## Sobre o projeto

A **FortifySec** é uma plataforma desenvolvida em **Next.js + Supabase + Mercado Pago**, com identidade visual inspirada em ambientes de **Cyber Range**, laboratórios práticos e formação profissional em cibersegurança.

O projeto reúne em uma única plataforma:

* Academy;
* trilhas de aprendizado;
* cursos;
* laboratórios;
* desafios;
* ranking;
* perfil técnico;
* painel administrativo;
* Content Studio;
* planos;
* checkout;
* controle de acesso;
* progresso do aluno.

A proposta da plataforma é oferecer uma jornada completa:

```text
APRENDER
   ↓
PRATICAR
   ↓
RESOLVER DESAFIOS
   ↓
EVOLUIR O PERFIL
   ↓
SUBIR NO RANKING
```

---

# V7.1 — Fluxo de entrada

A versão atual consolida o novo fluxo principal da plataforma.

## Home

A rota:

```text
/
```

renderiza diretamente a **Academy**.

---

## Redirecionamento por perfil

Após a autenticação:

```text
LOGIN
  ↓
profiles.role
  ↓
┌─────────────────────┐
│ admin      → /admin │
│ estudante  → /dashboard
└─────────────────────┘
```

O sistema utiliza `profiles.role` para determinar automaticamente o destino do usuário.

---

## Dashboard do aluno

O aluno autenticado entra em:

```text
/dashboard
```

A antiga rota:

```text
/painel
```

continua funcionando como alias de `/dashboard` para preservar compatibilidade.

---

## Administrador

Administradores autenticados entram em:

```text
/admin
```

Existe também um gateway administrativo dedicado:

```text
/admin/login
```

---

# V6 — Login Admin e Academy completa

A V6 introduziu uma separação mais clara entre o ambiente do estudante e o ambiente administrativo.

## Login por perfil

O login geral identifica o papel do usuário:

```text
profiles.role
```

e redireciona automaticamente:

```text
admin
   ↓
/admin
```

```text
estudante
   ↓
/dashboard
```

---

## Login administrativo dedicado

Administradores também podem utilizar:

```text
/admin/login
```

Para configurar a primeira conta administrativa:

1. crie o usuário;
2. confirme o usuário;
3. execute:

```text
supabase/ADMIN_SETUP.sql
```

---

# Academy

A página:

```text
/academy
```

possui:

* **6 trilhas**
* **37 cursos**
* **633 horas de conteúdo**

A Academy apresenta publicamente a jornada de aprendizado da FortifySec.

Os textos públicos foram revisados para comunicar:

* benefícios;
* aprendizado;
* prática;
* evolução;
* jornada do estudante.

Detalhes internos como regras de RLS, webhooks e mecanismos internos de liberação não são apresentados nas páginas públicas.

---

# V5 — Plataforma completa

A V5 consolidou as principais áreas internas da FortifySec.

---

## Academy e cursos

A área de cursos possui:

* catálogo;
* progresso real;
* navegação pelas aulas;
* integração com matrícula;
* checkout;
* feedback visual durante carregamentos e ações.

---

## Labs

A plataforma possui:

```text
Lab Catalog
     ↓
Lab individual
     ↓
Workspace
```

O endpoint de Lab somente é disponibilizado depois da validação de autorização.

---

## Challenges

A área de desafios permite:

* visualizar desafios;
* acessar uma missão individual;
* enviar flags;
* validar respostas;
* registrar conclusão.

A verificação das flags acontece **server-side**.

---

## Ranking

A plataforma possui ranking dos participantes.

O destaque principal apresenta:

```text
🥇 1º lugar
🥈 2º lugar
🥉 3º lugar
```

seguido do restante da classificação.

---

# Perfil técnico

Cada aluno possui um perfil técnico contendo métricas como:

```text
XP
Nível
Rank
Progresso
Métricas
```

O objetivo é representar a evolução do estudante dentro da plataforma.

---

# Admin Content Studio

O painel administrativo possui um **Content Studio** para gerenciamento e publicação de conteúdo.

Permite trabalhar com a publicação de aulas dentro da plataforma.

---

# Planos

A V5 inclui a página de planos:

```text
GRÁTIS
```

e:

```text
PRO
R$ 99,90
```

O checkout utiliza integração com **Mercado Pago**.

---

# Stack

A plataforma utiliza:

| Camada             | Tecnologia                        |
| ------------------ | --------------------------------- |
| Framework          | Next.js                           |
| Backend / Database | Supabase                          |
| Authentication     | Supabase Auth                     |
| Database           | PostgreSQL / Supabase             |
| Pagamentos         | Mercado Pago                      |
| Deploy             | Vercel                            |
| Autorização        | Supabase RLS                      |
| Aplicação          | Server-side + Client-side Next.js |

---

# Banco de dados

Execute as migrations existentes na seguinte ordem:

```text
1. supabase/migrations/001_final_schema.sql

2. supabase/migrations/002_labs_challenges_ctf.sql
```

É importante respeitar a sequência das migrations.

---

# Configuração administrativa

Para preparar a primeira conta administrativa:

```text
supabase/ADMIN_SETUP.sql
```

Execute esse script após:

```text
Criar usuário
      ↓
Confirmar usuário
      ↓
ADMIN_SETUP.sql
```

---

# Segurança

A FortifySec possui regras importantes de segurança.

## Matrículas

O estudante não pode criar ou ativar a própria matrícula diretamente pelo navegador.

---

## Conteúdo protegido

Conteúdo restrito exige:

```text
matrícula ativa
```

antes da liberação.

---

## Challenges

Flags são verificadas no servidor.

```text
CLIENT
   ↓
ENVIA FLAG
   ↓
SERVER
   ↓
VALIDAÇÃO
```

A resposta correta não deve depender de validação exclusiva no navegador.

---

## Labs

O endpoint de Lab somente é obtido depois da autorização.

```text
Usuário
   ↓
Autenticação
   ↓
Autorização
   ↓
Lab endpoint
```

---

## Secrets

A `Service Role` / `Secret Key` do Supabase deve permanecer exclusivamente no servidor.

Nunca exponha:

```text
SUPABASE_SERVICE_ROLE_KEY
```

ou outras credenciais privadas no frontend.

---

# Variáveis de ambiente

Utilize:

```text
.env.example
```

como referência para configurar o ambiente.

Na Vercel:

```text
Project
   ↓
Settings
   ↓
Environment Variables
```

Configure as variáveis necessárias para:

* Supabase;
* autenticação;
* Mercado Pago;
* aplicação;
* integrações utilizadas pelo projeto.

Nunca envie:

```text
.env
.env.local
```

para um repositório público.

---

# Deploy

Antes de subir para produção, leia:

```text
VERCEL_CHECKLIST.md
```

Também consulte:

```text
V5_CHANGES.md
ROUTES.md
VERCEL_CHECKLIST.md
```

Esses arquivos documentam alterações, rotas e preparação do ambiente.

---

# Fluxo principal

O fluxo atual da FortifySec é:

```text
              /
              │
          ACADEMY
              │
             LOGIN
              │
        profiles.role
         ┌────┴────┐
         │         │
      STUDENT     ADMIN
         │         │
         ▼         ▼
   /dashboard    /admin
```

Compatibilidade:

```text
/painel
   ↓
/dashboard
```

---

# Principais áreas

```text
FORTIFYSEC
│
├── Academy
│
├── Dashboard
│
├── Cursos
│
├── Labs
│
├── Challenges
│
├── Ranking
│
├── Perfil técnico
│
├── Planos
│
├── Checkout
│
└── Admin
    └── Content Studio
```

---

# Jornada do aluno

```text
ACADEMY
   ↓
CADASTRO / LOGIN
   ↓
MATRÍCULA
   ↓
DASHBOARD
   ↓
CURSOS
   ↓
LABS
   ↓
CHALLENGES
   ↓
XP + RANK
   ↓
EVOLUÇÃO TÉCNICA
```

---

# Documentação do projeto

Antes de modificar ou realizar deploy, consulte:

### Alterações da V5

```text
V5_CHANGES.md
```

### Rotas

```text
ROUTES.md
```

### Deploy

```text
VERCEL_CHECKLIST.md
```

---

# Roadmap

A arquitetura atual permite continuar evoluindo áreas como:

```text
Academy
Labs
Challenges
CTF
Ranking
Perfil
Admin
Content Studio
Pagamentos
```

mantendo a separação entre áreas públicas, área do estudante e administração.

---

# Objetivo

A FortifySec foi criada para combinar:

**Educação em Cibersegurança · Aprendizado Prático · Cyber Range · Labs · Challenges · Ranking · Formação Técnica**

em uma experiência única.

---

# Aviso de segurança

Antes de tornar este repositório público:

* confirme que `.env` está no `.gitignore`;
* confirme que `.env.local` está no `.gitignore`;
* não publique Service Role Keys;
* não publique tokens do Mercado Pago;
* não publique senhas;
* não publique API Keys;
* não publique secrets utilizados em produção.

Caso algum segredo já tenha sido commitado no histórico do Git, ele deve ser **revogado e substituído**, mesmo que tenha sido removido posteriormente do arquivo atual.

---

# FortifySec

> **Learn. Practice. Compete. Evolve.**

Plataforma de formação prática em cibersegurança.
