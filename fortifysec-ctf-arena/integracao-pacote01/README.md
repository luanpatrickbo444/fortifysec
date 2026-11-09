# FortifySec — integração pacote 01 (homologação)

Arquivos preparados a partir do código enviado. Inclui catálogo de seis labs, criação de instâncias por aluno, porta 8080 e leitura das flags existentes no .env. NÃO contém .env ou segredos.

## Importante
O endpoint `/labs/access/` do plugin original ainda retorna `proxy: pending`: **este pacote NÃO conclui o acesso interativo nem a pontuação CTFd**. Não disponibilize os labs ao público até validar o proxy, flags por participante e isolamento de rede. O Compose atual contém instâncias compartilhadas e não deve ser ligado ao banco CTFd.

## Instalação controlada no Kali
1. Extraia o zip em uma pasta temporária. Faça backup dos arquivos existentes.
2. Confirme que as seis imagens estão construídas: `sudo docker image ls fortifysec-training-pack1-lab*`.
3. Confirme `chmod 600 ~/Documents/fortifysec/fortifysec-ctf-arena/fortifysec-labs-01-06/.env`.
4. Substitua os arquivos SOMENTE após revisar o diff. O script `install-homologacao.sh` realiza backup e substituição; ele NÃO reinicia serviços.
5. `sudo systemctl restart fortifysec-labs-manager`; para atualizar o plugin CTFd, reconstrua apenas a imagem CTFd e recrie somente o serviço CTFd, seguindo seu Dockerfile e override de produção existentes. Não execute `down -v`.
6. Teste login, status, start/stop em ambiente de homologação e confirme que não houve regressões.

**Atenção:** o labctl usa o caminho do .env do usuário kali; ajuste se o projeto estiver em outro local. As flags ainda são estáticas, iguais entre instâncias, e precisam de estratégia de flags únicas por usuário antes de uma competição pública.
