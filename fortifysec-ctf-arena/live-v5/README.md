# FortifySec Labs V5 — implantação controlada

## Entregue

- `/labs/desafios`: lista de desafios da API autenticada `/api/v1/challenges`, busca e categorias.
- `/labs/ranking`: classificação da API `/api/v1/scoreboard`, busca e métricas reais.
- `/labs/live-attacks`: visualização animada abstrata, alimentada por eventos HTTP reais do proxy; não mostra geolocalização inventada.
- `/labs/perfil`: acesso ao perfil CTFd.
- `/labs/`: menu responsivo inserido no template do plugin original, preservando suas APIs.
- Coletor Unix datagram + SQLite com retenção de sete dias; API só exibe eventos do próprio aluno, exceto administradores.

## Limites

A API de scoreboard pode variar conforme modo de equipes, privacidade e versão CTFd. A API de desafios só mostra desafios visíveis ao usuário. O link 'Abrir desafio' leva à página de desafios original; não replica a interface de resolução de flags. O mapa é **abstrato**, não geolocaliza origens ou destinos. Não há eventos de demonstração. Não alterar o plugin `fortifysec_labs` ativo sem backup e validação.

## Preparação no Kali

```bash
cd ~/Documents/fortifysec/fortifysec-ctf-arena
mkdir -p live-v5
# Extraia o conteúdo deste ZIP em live-v5/
docker build -f live-v5/Dockerfile.live-v5 -t fortifysec-ctf-ctfd:live-v5 live-v5
```

O build usa como base `fortifysec-ctf-ctfd:socket-fix-20261109` **local**, sem rebuild da imagem upstream.

## Coletor

```bash
sudo install -d -m 755 /opt/fortifysec-live
sudo install -d -m 755 /run/fortifysec-live
sudo install -m 644 live-v5/telemetry/collector.py /opt/fortifysec-live/collector.py
sudo install -m 644 live-v5/fortifysec-live-collector.service /etc/systemd/system/fortifysec-live-collector.service
sudo systemctl daemon-reload
sudo systemctl enable --now fortifysec-live-collector.service
sudo systemctl status fortifysec-live-collector.service --no-pager
```

`/run` é temporário. Para reinicialização, adicionar `RuntimeDirectory=fortifysec-live` ao unit, ou criar a pasta com tmpfiles.d. O coletor mantém SQLite em `/run`, portanto o histórico desaparece ao reiniciar a máquina. Para retenção durável, mover banco para `/var/lib` com bind mount específico e permissões apropriadas.

## Proxy (telemetria real)

O arquivo `telemetry/proxy_hook.py` deve ser anexado **ao final** de `proxy-dev/homolog/server.py` somente depois de confirmar que esse é o proxy real em produção e que `authenticate()` devolve `(student, expiry)`.

```bash
cp proxy-dev/homolog/server.py proxy-dev/homolog/server.py.before-live-v5
cat live-v5/telemetry/proxy_hook.py >> proxy-dev/homolog/server.py
python3 -m py_compile proxy-dev/homolog/server.py
sudo systemctl restart fortifysec-labs-proxy-v2.service
```

**Não execute essa etapa às cegas.** Antes, valide se o serviço tem permissão para enviar ao socket root: `ls -l /run/fortifysec-live/collector.sock`, `systemctl show fortifysec-labs-proxy-v2.service -p User -p Group`. O serviço já foi observado rodando como root, mas revalide. Se não estiver, configure um grupo Unix específico; não abra o socket para todos. Eventos só são enviados após autenticação de sessão no proxy.

## Compose

Usar a ordem dos quatro arquivos existentes, mais `live-v5/docker-compose.live-v5.yml`. O Compose de recuperação é protegido: execute com `sudo` se necessário, preservando as variáveis de ambiente carregadas pelo Compose. Antes de publicar, confira `config --quiet` e imagem, volumes, rede e variáveis, sem imprimir segredos. Confirme backups de MariaDB e uploads. Publique apenas `ctfd` com `up -d --no-deps --no-build ctfd`. Não execute `down -v`.

## Testes

- Anônimo: `/labs/`, `/labs/ranking`, `/labs/live-attacks` devem exigir login.
- Autenticado: API de scoreboard e challenges devem carregar.
- Aluno A: apenas eventos do aluno A; aluno B: apenas B; admin: agregados.
- Eventos reais: fazer uma requisição em laboratório autorizado, confirmar incremento em `/labs/live-attacks`.
- Testar links e responsividade.
- Rollback: reverter o arquivo Compose V5, reconstruir somente ctfd com imagem anterior; restaurar `server.py.before-live-v5` e reiniciar o proxy. Banco e volumes CTFd permanecem intocados.
