from pathlib import Path
import shutil

root = Path('/opt/CTFd/CTFd/themes')
core = root / 'core'
theme = root / 'fortifysec'
if not (core / 'templates/base.html').is_file():
    raise SystemExit('Tema core ausente: abortando')
if not theme.is_dir():
    shutil.copytree(core, theme)
# Preserve existing FortifySec premium CSS link and all native CTFd templates.
base = theme / 'templates/base.html'
if not base.is_file():
    raise SystemExit('base.html ausente: abortando')
content = base.read_text(encoding='utf-8')
if '</head>' not in content:
    raise SystemExit('base.html inválido: tag </head> ausente')
css_tag = '<link rel="stylesheet" href="/themes/fortifysec/static/css/challenges-v4.css?v=4">'
js_tag = '<script defer src="/themes/fortifysec/static/js/challenges-v4.js?v=4"></script>'
for tag in (css_tag, js_tag):
    if tag not in content:
        content = content.replace('</head>', '  ' + tag + '\n</head>', 1)
base.write_text(content, encoding='utf-8')
for folder, source, name in [('css','/tmp/challenges-v4.css','challenges-v4.css'),('js','/tmp/challenges-v4.js','challenges-v4.js')]:
    dest = theme / 'static' / folder
    dest.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(source, dest / name)
print('FortifySec Challenges V4 instalado. Templates e handlers originais preservados.')
