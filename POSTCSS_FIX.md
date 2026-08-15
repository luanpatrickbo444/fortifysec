# Correção PostCSS / Vercel

O projeto FortifySec atual usa CSS puro em `app/globals.css` e não depende de Tailwind.

O erro do Vercel em `postcss.config.mjs` acontecia porque um arquivo PostCSS antigo permaneceu no repositório e tentava carregar um plugin não instalado.

Nesta versão o arquivo `postcss.config.mjs` foi sobrescrito por uma configuração neutra:

```js
const config = { plugins: {} }
export default config
```

Também confirme que não existem diretivas `@tailwind`, `@apply` ou importação de `tailwindcss` em `app/globals.css`.

Ao atualizar o GitHub, envie este `postcss.config.mjs` para substituir o antigo. Depois faça um novo deployment sem reutilizar o Build Cache.
