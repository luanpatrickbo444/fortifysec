#!/usr/bin/env python3
from pathlib import Path
import shutil

root = Path('/opt/CTFd/CTFd/themes/fortifysec')
base = root / 'templates/base.html'
if not base.exists():
    raise SystemExit(f'Tema não encontrado: {base}')
css = root / 'static/css/scoreboard-v7.css'
js = root / 'static/js/scoreboard-v7.js'
css.parent.mkdir(parents=True, exist_ok=True)
js.parent.mkdir(parents=True, exist_ok=True)
shutil.copyfile('/tmp/fs-ranking-v7.css', css)
shutil.copyfile('/tmp/fs-ranking-v7.js', js)
html = base.read_text(encoding='utf-8')
start = '<!-- FORTIFYSEC-RANKING-V7 -->'
end = '<!-- /FORTIFYSEC-RANKING-V7 -->'
if start in html and end in html:
    html = html[:html.index(start)] + html[html.index(end) + len(end):]
block = (f'{start}\n'
         '<link rel="stylesheet" href="/themes/fortifysec/static/css/scoreboard-v7.css?v=7">\n'
         '<script defer src="/themes/fortifysec/static/js/scoreboard-v7.js?v=7"></script>\n'
         f'{end}\n')
if '</head>' not in html:
    raise SystemExit('Tag </head> ausente. Nenhuma alteração feita no template.')
html = html.replace('</head>', block + '</head>', 1)
base.write_text(html, encoding='utf-8')
print('FortifySec Ranking V7 instalado no tema fortifysec.')
