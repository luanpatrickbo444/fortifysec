FORTIFYSEC - ADMIN CURSOS NATIVE ROUTE FIX

Substitua na raiz do projeto:
- next.config.ts
- proxy.ts

Objetivo:
- remover qualquer rewrite/redirect de /admin/cursos para /admin/content-studio
- deixar /admin/cursos ser resolvido nativamente pelo App Router
- manter apenas o rewrite publico / -> /academy
- preservar o redirect de compatibilidade /empresa/vagas -> /empresa/job-console

Depois:
1. git add next.config.ts proxy.ts
2. git commit -m "fix admin cursos native route"
3. git push origin main
4. aguarde novo deployment READY na Vercel
5. teste /admin/cursos em aba anonima e depois logado como admin

No build, precisa existir:
/admin/cursos
/admin/cursos/[id]

Nos Runtime Logs, uma requisicao para /admin/cursos deve executar route /admin/cursos.
Se continuar executando /admin/content-studio, existe outro rewrite fora desses dois arquivos.
