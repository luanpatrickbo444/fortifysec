from pathlib import Path
import ast
p=Path('/opt/CTFd/CTFd/plugins/fortifysec_labs/__init__.py')
s=p.read_text()
if 'fs-v5-navigation' in s:
    raise SystemExit('Already patched')
if s.count('</header>')!=1 or s.count('</style>')!=1:
    raise SystemExit('Unexpected labs template; abort build')
nav='''\n<nav class="fs-v5-navigation" aria-label="FortifySec Labs"><a href="/labs/">Laboratórios</a><a href="/labs/desafios">Desafios</a><a href="/labs/ranking">Ranking</a><a href="/labs/live-attacks">Live Attacks</a><a href="/labs/perfil">Meu perfil</a><a href="/logout">Sair</a></nav>\n'''
css='''\n.fs-v5-navigation{display:flex;gap:8px;flex-wrap:wrap;margin:16px 0;padding:12px;border:1px solid #64253a;border-radius:13px;background:#160b12}.fs-v5-navigation a{padding:10px 14px;border-radius:9px;color:#f5dfe5;font-size:13px;font-weight:700;text-decoration:none}.fs-v5-navigation a:hover{background:#a71938;color:white}@media(max-width:650px){.fs-v5-navigation{display:grid;grid-template-columns:1fr 1fr}.fs-v5-navigation a{text-align:center}}\n'''
s=s.replace('</style>',css+'</style>',1).replace('</header>','</header>'+nav,1)
ast.parse(s)
p.write_text(s)
