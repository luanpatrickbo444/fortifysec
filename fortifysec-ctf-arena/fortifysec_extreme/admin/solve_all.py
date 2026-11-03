import json,zipfile,base64,zlib,hashlib,pathlib,sys
root=pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0,str(root))
from transforms import inverse
manifest=json.loads((root/'admin/manifest.json').read_text())
for c in manifest:
 with zipfile.ZipFile(root/'challenges'/c['file']) as z:
  recipe=json.loads(z.read('pipeline.json'))
  records=[json.loads(s) for s in z.read('telemetry.jsonl').decode().splitlines()]
  good=[r for r in records if r['stream']=='prod' and hashlib.sha256(r['payload'].encode()).hexdigest()==r['sha256']]
  assert [r['sequence'] for r in sorted(good,key=lambda r:r['sequence'])]==list(range(len(good)))
  data=base64.b64decode(''.join(r['payload'] for r in sorted(good,key=lambda r:r['sequence'])))
  for step in reversed(recipe['pipeline']):data=inverse(data,step['operation'],step['key'])
  proof=json.loads(zlib.decompress(data))
  assert proof['proof']==c['flag']
  assert hashlib.sha256(proof['proof'].encode()).hexdigest()==proof['checksum']
  print(c['id'],'OK')
print('30/30 challenges verified')
