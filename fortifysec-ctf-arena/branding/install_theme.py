from pathlib import Path
import shutil

root = Path('/opt/CTFd/CTFd/themes')
core = root / 'core'
theme = root / 'fortifysec'
if not (core / 'templates/base.html').is_file():
    raise SystemExit('Tema core não encontrado; instalação cancelada')
if not theme.is_dir():
    shutil.copytree(core, theme)
# Restore the original base template to prevent legacy global hero injections.
base = theme / 'templates/base.html'
original = (core / 'templates/base.html').read_text(encoding='utf-8')
link = '<link rel="stylesheet" href="/themes/fortifysec/static/css/fortifysec.css?v=3">'
if '</head>' not in original:
    raise SystemExit('Tag </head> ausente; instalação cancelada')
base.write_text(original.replace('</head>', '  ' + link + '\n</head>', 1), encoding='utf-8')
cssdir = theme / 'static/css'
cssdir.mkdir(parents=True, exist_ok=True)
shutil.copyfile('/tmp/fortifysec.css', cssdir / 'fortifysec.css')
print('FortifySec: tema core preservado e CSS instalado')
