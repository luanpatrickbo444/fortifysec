# Validação FortifySec V7.12.6

- Imports locais quebrados: **0**
- Arquivos de rota canônicos: **39**
- DashboardShell em app/painel: **['app/painel/layout.tsx']**
- Root layout contém CSS inline: **True**
- proxy.ts contém redirect: **False**
- prebuild configurado: **node scripts/prune-stale-repo.mjs**
- globals.css igual ao V7.12 original: **True**
- SHA256 globals.css: `e257c8bef456da614bee48d2624700c48d5d6a8f8b4d0a6c4ae40e246e478182`

## Teste de repositório sujo
Foi injetado propositalmente `middleware.ts` com redirect para `/login`, `vercel.json`, `next.config.js`, `postcss.config.js`, `src/`, `pages/`, rotas antigas e layout extra de perfil. O prebuild remove todos os arquivos conflitantes antes do Next.js compilar.
