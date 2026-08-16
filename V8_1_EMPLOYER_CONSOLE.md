# FortifySec V8.1 — Employer Console

Atualização da área empresarial com foco em recrutamento técnico baseado em evidências da plataforma.

## O que mudou

- Novo design para `/empresa/login` e `/empresa/cadastro`, alinhado ao visual dark + verde da FortifySec.
- Employer Console renovado com navegação lateral e status de validação da empresa.
- Dashboard empresarial com métricas de vagas, candidaturas, talentos públicos e perfis Open to Work.
- Gestão de vagas com filtros por status, criação, edição e mudança de status.
- Empresas ainda não validadas podem preparar vagas como rascunho, mas não publicá-las.
- Nova rota `/empresa/talentos` com busca por nome/headline, XP mínimo, disponibilidade e ordenação.
- Talent Search respeita `profile_public=true` e não expõe e-mail de talentos que não se candidataram.
- Evidências exibidas no Talent Search: XP, challenges resolvidos e sessões de Labs concluídas.
- Shortlist interna de talentos por empresa.
- Área de candidatos com filtros por vaga/status, links públicos e pipeline de seleção.

## Nova migration obrigatória para Shortlist

Execute no Supabase SQL Editor depois das migrations anteriores:

`supabase/migrations/007_employer_console.sql`

A busca de talentos funciona mesmo sem a migration, mas a função de salvar/remover talentos da shortlist só é habilitada após a tabela existir.

## Rotas empresariais

- `/empresa/login`
- `/empresa/cadastro`
- `/empresa`
- `/empresa/vagas`
- `/empresa/vagas/nova`
- `/empresa/vagas/[id]/editar`
- `/empresa/talentos`
- `/empresa/candidatos`

## Segurança

- Todas as ações de empresa usam `requireCompany()` no servidor.
- Alterações de vagas são limitadas por `company_id`.
- Publicação de vaga exige `company.verified=true`.
- Talent Search seleciona somente os campos públicos dos perfis que optaram por exposição.
- E-mail é mostrado apenas na área de candidatos, onde o usuário já enviou candidatura à empresa.
- Escritas da shortlist continuam via Server Actions/service role; clientes autenticados têm somente leitura protegida por RLS.
