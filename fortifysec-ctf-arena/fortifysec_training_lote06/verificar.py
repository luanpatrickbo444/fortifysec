from pathlib import Path
import json,zipfile
p=Path(__file__).resolve().parent
m=json.loads((p/'admin/manifest.json').read_text())
assert len(m)==30 and len({x['id'] for x in m})==30 and len({x['flag'] for x in m})==30
for x in m:
 with zipfile.ZipFile(p/x['file']) as z:
  assert z.testzip() is None and 'challenge.md' in z.namelist()
print('OK: 30 ZIPs integro(s), 30 flags unicas, 30 IDs unicos')
