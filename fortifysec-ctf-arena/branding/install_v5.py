from pathlib import Path
import shutil

root = Path('/opt/CTFd/CTFd/themes/fortifysec')
base = root / 'templates/base.html'
if not base.exists():
    raise SystemExit('Tema fortifysec não encontrado')
content = base.read_text(encoding='utf-8')
if '</head>' not in content:
    raise SystemExit('base.html sem </head>; abortando')
# Remove previous V4 references (V4 still remains on disk but is not loaded).
import re
content = re.sub(r'\s*<link[^>]*challenges-v4\.css[^>]*>', '', content)
content = re.sub(r'\s*<script[^>]*challenges-v4\.js[^>]*></script>', '', content)
css = '<link rel="stylesheet" href="/themes/fortifysec/static/css/challenges-v5.css?v=5">'
js = '<script defer src="/themes/fortifysec/static/js/challenges-v5.js?v=5"></script>'
if css not in content: content = content.replace('</head>', '  ' + css + '\n</head>', 1)
if js not in content: content = content.replace('</head>', '  ' + js + '\n</head>', 1)
base.write_text(content, encoding='utf-8')
for src, dst in [('/tmp/challenges-v5.css',root/'static/css/challenges-v5.css'),('/tmp/challenges-v5.js',root/'static/js/challenges-v5.js')]:
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(src,dst)
print('FortifySec Challenges V5: CSS e JS instalados; templates e handlers preservados')
