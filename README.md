# FortifySec CTF — Site Next.js

Landing page responsiva com visual cyberpunk vermelho/preto, baseada na arte fornecida.

## Requisitos
- Node.js 20.9+ (recomendado Node 22)
- npm

## Executar
```bash
npm install
npm run dev
```
Abra http://localhost:3000

## Testar build de produção
```bash
npm run build
npm start
```

## Estrutura
- `app/page.tsx`: página completa e interações.
- `app/globals.css`: identidade visual responsiva.
- `app/layout.tsx`: metadados e layout.
- `public/images/fortifysec-ctf-poster.png`: arte gerada para o evento.

## Funcionalidades
- Header responsivo e menu mobile.
- Hero, informações do evento, categorias filtráveis, premiação, ranking, regras, FAQ e formulário.
- Formulário de **demonstração**, salvo em `localStorage` no próprio navegador.
- Ranking **fictício**, usado apenas para testar o design.
- Sem dependência de serviços externos para renderização (Google Fonts é opcional; fontes fallback funcionam offline).

## Importante antes de publicar
1. Confirmar com a organização datas, regras, premiação e se as inscrições estão oficialmente abertas.
2. Substituir pré-inscrição local por backend real com validação, antispam, banco de dados, proteção de dados e política de privacidade.
3. Conectar a plataforma de desafios (ex.: CTFd) e o placar real via API autenticada.
4. Confirmar domínio, canal de contato e identidade visual oficial.
5. Não utilizar o ranking de exemplo como resultado de competição real.

## Publicação na Vercel
Faça push do projeto para um repositório Git e importe-o em https://vercel.com/new. O framework Next.js será detectado automaticamente.
