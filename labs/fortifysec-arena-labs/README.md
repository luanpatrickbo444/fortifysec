# FortifySec Arena — laboratórios Docker (pacote inicial)

Este pacote inclui **3 laboratórios funcionais**: autenticação baseada em parâmetro do cliente (8101), IDOR em API de relatórios (8102), e investigação de logs (8103). Todos são **ambientes deliberadamente vulneráveis**, para uso isolado e autorizado.

## Iniciar
```bash
docker compose up -d --build
docker compose ps
curl http://127.0.0.1:8101/
curl http://127.0.0.1:8102/
curl http://127.0.0.1:8103/
```

## Parar / reiniciar
```bash
docker compose stop
docker compose start
```

Os serviços têm `restart: unless-stopped`: após parada manual, **não** voltam automaticamente com reboot. Se quiser que retornem após reiniciar o host mesmo depois de uma parada manual, use `docker update --restart=always` para esses containers antes de parar. Os laboratórios são separados da stack principal do CTFd.

## Cadastro no CTFd
Crie desafios do tipo *standard*, com os dados:

| Nome | Categoria | Pontos | URL local (para teste) | Flag |
|---|---|---:|---|---|
| FS-LAB-02 Portal de acesso | Web | 150 | http://127.0.0.1:8101/ | `FS{auth_client_side_is_not_authorization}` |
| FS-LAB-04 API de relatórios | API | 250 | http://127.0.0.1:8102/ | `FS{idor_check_object_ownership}` |
| FS-LAB-06 Investigação SOC | Blue Team | 150 | http://127.0.0.1:8103/ | `FS{detect_bruteforce_from_logs}` |

**Não publique `127.0.0.1` como link para alunos remotos**: ele aponta para o computador de cada aluno. Para acesso remoto, use um proxy autenticado com TLS, limites de requisição e roteamento para os serviços, ou uma VPN de laboratório. Não exponha os containers vulneráveis diretamente à internet. As flags são estáticas e compartilhadas: adequadas para demonstração, não para competição valendo premiação. Para competições, implemente instâncias e flags individuais por equipe.

## Segurança e limites
- Serviços presos a `127.0.0.1`, usuário sem privilégios, sistema de arquivos somente leitura, capacidades removidas, limites de memória/processos.
- Sem `privileged`, `host network`, montagem de `/var/run/docker.sock`, ou volumes do CTFd.
- **Não rode em host com dados sensíveis sem isolamento adicional**. Preferir VM/servidor separado.
- Os códigos foram preparados, mas **não foram executados em Docker neste ambiente**; valide com `docker compose config` e `docker compose up -d --build` no seu servidor.
