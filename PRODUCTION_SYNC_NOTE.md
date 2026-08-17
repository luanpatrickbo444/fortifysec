# FortifySec — nota de sincronização

Este pacote completo foi montado sobre o último snapshot completo disponível nesta conversa (V8.2.2 + hotfix de login) e recebeu o Range Provider híbrido Docker + Azure.

A Vercel mostra que a produção atual está no commit `338e4ba` (`fix bug selection menu`), posterior a esse snapshot. O conector da Vercel permite validar deploy/build/rotas, mas não fornece a árvore de código-fonte do repositório privado.

Por isso, para preservar exatamente as correções mais recentes de produção, a aplicação recomendada é substituir apenas a pasta `range-provider/` do repositório atual pelo pacote `fortifysec-range-provider-AZURE-COMPLETO.zip`.

O restante do site não precisa mudar para a integração Azure, pois o contrato `POST /sessions` e `DELETE /sessions/:id` foi preservado.
