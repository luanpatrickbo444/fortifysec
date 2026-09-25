# FORTIFY ONE — Landing Page

Recriação completa da landing page **Fortify One** em **Next.js 16** (App Router) + **Tailwind CSS 4** + **lucide-react**.

## Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- lucide-react (ícones)

## Como rodar

```bash
cd fortify-one
npm install
npm run dev
```

Abra http://localhost:3000

## Build para produção

```bash
npm run build
npm start
```

## Estrutura

```
src/app/
  layout.tsx    # Layout raiz + metadata
  page.tsx      # Landing page completa (client component)
  globals.css   # Tema dark + tokens (lime, violet, cyan)
public/
```

## Seções

- Header sticky com menu mobile
- Hero + stack de cards (LABS / BLUE TEAM / CTF)
- Features (6 itens)
- Trilhas (12 módulos)
- Certificações (FYCP, FYWP, FYAP, FYES) + 8 passos
- CTF com prêmio R$ 15.000
- Depoimentos
- Planos (Básico / Completo / Premium)
- FAQ accordion
- CTA garantia 7 dias
- Footer com WhatsApp

## Deploy

Pronto para Vercel:

```bash
npx vercel
```
