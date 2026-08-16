# Instalação limpa no repositório

Para não carregar resíduos das versões anteriores, use o conteúdo deste pacote como a árvore completa do projeto.

Forma recomendada:
1. Faça backup/commit do estado atual.
2. Em uma cópia limpa do repositório, remova os arquivos rastreados atuais com `git rm -r --ignore-unmatch .`.
3. Copie todos os arquivos deste pacote para a raiz do repositório.
4. Execute `git add -A`.
5. Commit e push.

Não misture com V13–V17. Este pacote já contém a árvore completa necessária.
