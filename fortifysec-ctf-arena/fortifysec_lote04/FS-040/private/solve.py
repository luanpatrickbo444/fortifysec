import json
from pathlib import Path
p=Path(__file__).resolve().parent.parent/'public';rows=[json.loads(s) for s in (p/'events.jsonl').read_text().splitlines()];print(bytes.fromhex(next(r['payload'] for r in rows if r['type']=='exfil')).decode())
