# Deploy limpo da V7.15

Este ZIP já possui os arquivos do projeto diretamente na raiz.

Recomendado no repositório:

```bash
git rm -r --cached . 2>/dev/null || true
# copie os arquivos da V7.15 para a raiz do repositório
git add -A
git commit -m "FortifySec V7.15 visual hard fix"
git push
```

Se preferir não usar `git rm`, pelo menos copie tudo para a raiz e use `git add -A`.
O prebuild da V7.15 também remove layouts antigos de `/painel/*` automaticamente no ambiente do Vercel.
