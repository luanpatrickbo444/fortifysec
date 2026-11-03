import zipfile,base64
from pathlib import Path
p=Path(__file__).resolve().parent.parent/'public';z=zipfile.ZipFile(p/'backup.zip');print(base64.b64decode(z.read('archive/.cache/incident.bin')).decode())
