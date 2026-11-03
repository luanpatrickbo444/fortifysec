#!/usr/bin/env python3
"""CTFd importer: uses documented API; hidden challenges only."""
import argparse,os,json,sys,urllib.request,urllib.error,uuid
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('--url',default='http://127.0.0.1:8000');p.add_argument('--aplicar',action='store_true');a=p.parse_args()
r=Path(__file__).resolve().parent;m=json.loads((r/'manifest.private.json').read_text());assert len(m)==30
for x in m:
 assert (r/(x['id']+'.zip')).is_file() and x['flag'].startswith('FORTIFY{')
print(f'Validado: {len(m)} desafios; modo:', 'IMPORTACAO' if a.aplicar else 'SIMULACAO')
if not a.aplicar:sys.exit(0)
token=os.environ.get('CTFD_ADMIN_TOKEN','').strip()
if not token:sys.exit('Defina CTFD_ADMIN_TOKEN antes de --aplicar')
base=a.url.rstrip('/')
def api(method,path,data=None,content_type='application/json'):
 body=json.dumps(data).encode() if data is not None else None
 headers={'Authorization':'Token '+token,'Accept':'application/json'}
 if body is not None:headers['Content-Type']=content_type
 req=urllib.request.Request(base+path,data=body,headers=headers,method=method)
 try:
  with urllib.request.urlopen(req,timeout=25) as resp:return json.load(resp)
 except urllib.error.HTTPError as e:
  raise RuntimeError(f'{method} {path}: HTTP {e.code}: {e.read(1000).decode(errors="replace")}')
def upload(challenge_id,filepath):
 boundary='----FortifySec'+uuid.uuid4().hex
 b=filepath.read_bytes();name=filepath.name
 parts=[f'--{boundary}\r\nContent-Disposition: form-data; name="challenge_id"\r\n\r\n{challenge_id}\r\n'.encode(),f'--{boundary}\r\nContent-Disposition: form-data; name="file"; filename="{name}"\r\nContent-Type: application/zip\r\n\r\n'.encode(),b,b'\r\n',f'--{boundary}--\r\n'.encode()]
 headers={'Authorization':'Token '+token,'Accept':'application/json','Content-Type':f'multipart/form-data; boundary={boundary}'}
 req=urllib.request.Request(base+'/api/v1/files',data=b''.join(parts),headers=headers,method='POST')
 try:
  with urllib.request.urlopen(req,timeout=60) as resp:return json.load(resp)
 except urllib.error.HTTPError as e:raise RuntimeError(f'upload {name}: HTTP {e.code}: {e.read(1000).decode(errors="replace")}')
existing=api('GET','/api/v1/challenges?view=admin').get('data',[])
names={x.get('name') for x in existing}
for x in m:
 if x['name'] in names:print('JA EXISTE',x['id']);continue
 try:
  ch=api('POST','/api/v1/challenges',{'name':x['name'],'category':x['category'],'description':x['description'],'value':x['value'],'type':'standard','state':'hidden'})
  cid=ch['data']['id'];print('CRIADO',x['id'],'ID',cid)
  api('POST','/api/v1/flags',{'challenge_id':cid,'content':x['flag'],'type':'static','data':''})
  upload(cid,r/(x['id']+'.zip'))
  print('OK',x['id'])
 except Exception as exc:
  print('ERRO',x['id'],str(exc),file=sys.stderr)
  print('Importacao interrompida; confira o desafio no painel antes de repetir.',file=sys.stderr)
  sys.exit(1)
