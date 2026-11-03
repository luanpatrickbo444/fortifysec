from pathlib import Path
import shutil
import re
root = Path('/opt/CTFd/CTFd/themes/fortifysec')
base = root / 'templates/base.html'
if not base.is_file():
    raise SystemExit('Tema fortifysec não encontrado: ' + str(base))
content = base.read_text(encoding='utf-8')
if '</head>' not in content:
    raise SystemExit('base.html não possui </head>')
# Keep the native base and all existing V5 assets; V6 is a scoped override.
content = re.sub(r'\s*<link[^>]+challenges-v6\.css[^>]*>', '', content)
content = re.sub(r'\s*<script[^>]+challenges-v6\.js[^>]*></script>', '', content)
links = ('  <link rel="stylesheet" href="/themes/fortifysec/static/css/challenges-v6.css?v=6">\n'
         '  <script defer src="/themes/fortifysec/static/js/challenges-v6.js?v=6"></script>\n')
base.write_text(content.replace('</head>', links + '</head>', 1), encoding='utf-8')
for name, dest in [('challenges-v6.css','css'),('challenges-v6.js','js')]:
    path = root / 'static' / dest / name
    path.parent.mkdir(parents=True,exist_ok=True)
    shutil.copyfile('/tmp/' + name, path)
print('FortifySec V6 instalada sem substituir templates ou handlers')
