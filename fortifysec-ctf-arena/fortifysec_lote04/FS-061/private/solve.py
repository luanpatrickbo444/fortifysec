import json,base64
from pathlib import Path
p=Path(__file__).resolve().parent.parent/'public';rows=json.loads((p/'registry.json').read_text());print(base64.b64decode(next(x['evidence'] for x in rows if x['alias']=='node-61-orion')).decode())
