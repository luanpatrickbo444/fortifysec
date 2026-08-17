# FortifySec V8 — CTF + VPN + Empresas/Vagas

Esta versão parte da base funcional enviada pelo usuário e mantém `app/globals.css` intacto.

## 1. Banco de dados

Execute apenas a migration nova, depois das migrations 000–005 já existentes:

```text
supabase/migrations/006_ctf_vpn_companies.sql
```

Ela adiciona:

- vínculo opcional `challenges.lab_id`;
- dados de VPN/alvo em `lab_sessions`;
- `ctf_participants`;
- `ctf_solves`;
- `submit_ctf_flag(...)`;
- `get_ctf_leaderboard(...)`;
- `companies`;
- `company_members`;
- `jobs`;
- `job_applications`;
- RLS/policies e índices.

Não execute `001_final_schema.sql` novamente em produção.

## 2. Challenge com alvo/VPN

Fluxo:

1. Admin cria um Cyber Lab e define `Provider Lab ID`.
2. Admin cria um Challenge e seleciona esse Lab no campo `Alvo / Lab com VPN`.
3. O aluno abre o Challenge e clica `INICIAR ALVO + VPN`.
4. A Server Action chama `LAB_PROVIDER_API_URL/sessions`.
5. O provider devolve sessão, VPN, endereço do alvo e expiração.
6. A FortifySec grava isso em `lab_sessions`.
7. O aluno baixa a VPN e acessa somente o subnet do alvo.
8. Ao encerrar, `DELETE /sessions/:id` remove peer, container e network.

## 3. CTF

Fluxo:

1. Admin cria evento em `/admin/ctf`.
2. Admin vincula Challenges ao evento.
3. Aluno entra pelo `/painel/ctf`.
4. A inscrição é gravada em `ctf_participants`.
5. Durante evento `live` e dentro de `starts_at/ends_at`, os Challenges são liberados.
6. A flag do CTF chama `submit_ctf_flag`.
7. A pontuação é gravada em `ctf_solves`.
8. `/painel/ctf/[id]` mostra ranking específico do evento.

Observação: o MVP ainda utiliza a flag cadastrada no Challenge. Para CTF competitivo com premiação, a próxima evolução recomendada é flag dinâmica por sessão.

## 4. Empresas e vagas

Fluxo:

1. Empresa acessa `/empresa/cadastro`.
2. Cria conta empresarial.
3. Admin visualiza em `/admin/empresas`.
4. Admin valida a empresa.
5. Empresa entra em `/empresa/login`.
6. Empresa publica em `/empresa/vagas/nova`.
7. Vaga aparece em `/vagas` somente se empresa estiver validada e vaga `published`.
8. Aluno envia candidatura pela página da vaga.
9. Empresa vê candidatos em `/empresa/candidatos`, incluindo XP, headline, GitHub e LinkedIn.
10. Empresa muda status: recebida, visualizada, entrevista, recusada ou contratada.

## 5. Range Provider VPS

Pasta:

```text
range-provider/
```

Arquivos principais:

- `server.mjs` — API de provisionamento;
- `labs.example.json` — catálogo de imagens/alvos;
- `.env.example` — variáveis;
- `setup-ubuntu.sh` — bootstrap do host;
- `fortify-range.service` — systemd;
- `README.md` — operação.

No Vercel:

```env
LAB_PROVIDER_API_URL=https://range.fortifysec.com.br
LAB_PROVIDER_API_KEY=SEGREDO_FORTE_IGUAL_AO_PROVIDER
```

No VPS:

```env
PROVIDER_API_KEY=SEGREDO_FORTE_IGUAL_AO_VERCEL
PUBLIC_BASE_URL=https://range.fortifysec.com.br
WG_ENDPOINT=range.fortifysec.com.br:51820
WG_INTERFACE=wg0
```

## 6. DNS sugerido

```text
www.fortifysec.com.br      -> Vercel
range.fortifysec.com.br    -> VPS Cyber Range
```

A porta UDP 51820 é do WireGuard. A API HTTPS do provider deve ficar atrás de TLS e protegida pelo Bearer token, idealmente também por camada adicional de controle de acesso.

## 7. Ordem de implantação

1. Faça backup do banco.
2. Rode `006_ctf_vpn_companies.sql`.
3. Suba o código Next.js.
4. Confira `/admin/empresas`, `/vagas` e `/painel/ctf`.
5. Prepare VPS separado.
6. Instale WireGuard/Docker.
7. Configure `range-provider/labs.json`.
8. Configure as duas variáveis `LAB_PROVIDER_*` no Vercel.
9. Crie um Lab de teste com `Provider Lab ID = web-juice-01`.
10. Associe esse Lab a um Challenge.
11. Teste com conta de aluno matriculada.

## 8. O que NÃO foi alterado

- `app/globals.css`;
- mecanismo normal `import './globals.css'`;
- preço principal;
- autenticação principal aluno/admin;
- Mercado Pago existente;
- estrutura de cursos/aulas;
- package.json do Next.js (nenhuma dependência nova no frontend).
