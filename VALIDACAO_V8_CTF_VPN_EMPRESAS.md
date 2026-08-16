# Validação — V8 CTF/VPN/Empresas

- `app/globals.css`: SHA-256 `e257c8bef456da614bee48d2624700c48d5d6a8f8b4d0a6c4ae40e246e478182` — igual à base funcional.
- Imports locais `@/` e relativos: 0 arquivos faltando na varredura.
- Parser TypeScript (`tsc --noResolve`): nenhum diagnóstico de sintaxe TS1xxx; os diagnósticos restantes são apenas módulos/tipos ausentes porque `npm install` não concluiu neste ambiente.
- `range-provider/server.mjs`: `node --check` OK.
- `package.json` principal: sem novas dependências.
- `npm install`: excedeu o timeout deste ambiente; portanto não foi possível executar `next build` completo localmente.

## Arquivos principais adicionados

- `supabase/migrations/006_ctf_vpn_companies.sql`
- `range-provider/*`
- `components/CompanyShell.tsx`
- `app/admin/empresas/page.tsx`
- `app/empresa/*`
- `app/vagas/*`
- `app/painel/ctf/[id]/page.tsx`

## Arquivos principais alterados

- `app/actions.ts`
- `lib/auth.ts`
- `components/SiteHeader.tsx`
- `components/DashboardShell.tsx`
- `app/admin/desafios/page.tsx`
- `app/painel/desafios/[slug]/page.tsx`
- `app/painel/labs/[slug]/page.tsx`
- `app/painel/ctf/page.tsx`
- `app/admin/page.tsx`
- `app/talentos/page.tsx`
