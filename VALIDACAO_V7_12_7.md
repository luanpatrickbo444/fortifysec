# FortifySec V7.12.7 — Design Restore

Base canônica: V7.12 original.

## Preservado byte a byte da V7.12
- app/**
- components/**
- lib/**
- supabase/**
- proxy.ts
- next.config.ts
- postcss.config.mjs
- tsconfig.json

## CSS
- app/layout.tsx contém exatamente `import './globals.css'`
- app/globals.css: 63.270 bytes
- SHA-256: e257c8bef456da614bee48d2624700c48d5d6a8f8b4d0a6c4ae40e246e478182

## Menu do aluno
- exatamente 1 `<DashboardShell>` dentro de app/painel/**
- app/painel/layout.tsx é o único layout que monta DashboardShell
- labs/desafios herdam o shell pai

## Self-clean
O prebuild remove arquivos residuais que não pertencem à V7.12 em app/, components/ e lib/, além de middleware/src/pages/configs legados.

O prebuild aborta o deploy se:
1. app/globals.css não existir;
2. app/layout.tsx não importar ./globals.css;
3. houver quantidade diferente de 1 DashboardShell em app/painel.

## Teste de repositório contaminado
Foram injetados middleware.ts, src/, pages/, vercel.json, app/portal.css, rota API antiga e layout extra de perfil. Todos foram removidos e as três assertions permaneceram OK.

## Build local
O `npm install` não concluiu dentro do limite do ambiente local, então o build Next completo não foi alegado como executado aqui. O código canônico é byte a byte o mesmo do deploy V7.12 que já compilou no Vercel; apenas package.json (versão/prebuild) e o script de limpeza foram adicionados.
