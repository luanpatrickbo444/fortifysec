# FortifySec CTF Arena — Atualização do tema

Este pacote atualiza SOMENTE `branding/fortifysec.css` e mantém `branding/install_theme.py` compatível com o projeto Docker entregue anteriormente. Não substitui volumes, banco de dados, contas ou desafios.

## Instalar no Kali Linux

1. Faça backup do diretório `branding/` atual.
2. Copie os arquivos deste ZIP para dentro de `~/Documents/fortifysec-ctf-arena/`, mantendo as subpastas (substitua os dois arquivos em `branding/`).
3. Rode:

```bash
cd ~/Documents/fortifysec-ctf-arena
docker compose build --no-cache ctfd
docker compose up -d --no-deps ctfd
docker compose ps
```

Se seu usuário não tem acesso ao Docker, prefixe cada comando Docker com `sudo`.

4. No painel CTFd, vá em `Config` > `Themes` (ou seção equivalente de aparência) e selecione `fortifysec`. Salve e atualize a página pública com Ctrl+Shift+R.
5. Se a opção `fortifysec` não aparecer, rode `docker compose logs --tail=100 ctfd` e verifique o log do build. A configuração do tema depende da estrutura da versão CTFd instalada.

## Segurança

Não execute `docker compose down -v`: essa opção APAGA volumes persistentes do banco e uploads. O comando acima reconstrói apenas a imagem CTFd e reinicia seu serviço, mantendo MariaDB e Redis.

O tema altera a interface pública do CTFd. A área `/admin` pode manter a aparência padrão, pois o painel administrativo usa recursos próprios. Isso é esperado.

## Verificação

Abra `http://localhost:8000` em uma janela privada. Confirme o nome do tema, cores e páginas públicas `/challenges`, `/scoreboard`, `/login` e `/register`. O nome do evento é alterado em `Admin > Config`, não no CSS.
