# FortifySec CTF — Next.js 15

Projeto independente, com `app/` como único App Router. Não misture com a pasta `src/` ou `fortify-one-next/` de outro projeto.

## Executar

```bash
npm install
npm run build
npm run dev
```

## Publicar no repositório existente

Faça backup antes. Substitua o conteúdo antigo da raiz pelos arquivos deste pacote; remova pastas antigas `src/` e `fortify-one-next/` **somente se não fizerem parte do site que deseja publicar**. Remova configurações antigas `postcss.config.*` se não usa Tailwind. Então execute `npm install`, `npm run build`, `git add -A`, `git commit -m 'fix: clean Next.js project'`, `git push origin main`.

O formulário de interesse é apenas demonstrativo: salva no navegador, não envia inscrições a um servidor.
