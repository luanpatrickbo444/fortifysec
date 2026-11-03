#!/usr/bin/env python3
import argparse, json, os, sys, urllib.request, urllib.error, urllib.parse, uuid
from pathlib import Path
BASE=Path(__file__).resolve().parent
DATA=json.loads((BASE/'ADMIN_PRIVADO/desafios.json').read_text())
p=argparse.ArgumentParser(description='FortifySec importador Lote 03 (dry-run por padrao)')
p.add_argument('--url',default='http://127.0.0.1:8000');p.add_argument('--aplicar',action='store_true');p.add_argument('--sem-anexos',action='store_true');a=p.parse_args()
for r in DATA:
 path=BASE/'PARTICIPANTES'/r['file']
 if not path.is_file():sys.exit('Arquivo ausente: '+str(path))
print('Validado:',len(DATA),'desafios; modo:', 'IMPORTACAO' if a.aplicar else 'SIMULACAO')
if not a.aplicar:sys.exit(0)
token=os.getenv('CTFD_ADMIN_TOKEN')
if not token:sys.exit('Defina CTFD_ADMIN_TOKEN antes de --aplicar')
url=a.url.rstrip('/')
def req(method,route,payload=None,content_type='application/json'):
 data=None if payload is None else (json.dumps(payload).encode() if content_type=='application/json' else payload)
 h={'Authorization':'Token '+token,'Accept':'application/json'}
 if data is not None:h['Content-Type']=content_type
 request=urllib.request.Request(url+route,data=data,headers=h,method=method)
 try:
  with urllib.request.urlopen(request,timeout=25) as resp:return json.loads(resp.read())
 except urllib.error.HTTPError as e:
  sys.exit(f'ERRO {method} {route} HTTP {e.code}: {e.read(500).decode(errors="replace")}')
existing=req('GET','/api/v1/challenges?view=admin').get('data',[])
names={x.get('name') for x in existing}
for r in DATA:
 if r['name'] in names:
  print('JA EXISTE:',r['name']);continue
 obj=req('POST','/api/v1/challenges',{'name':r['name'],'category':r['category'],'description':r['description'],'value':r['value'],'type':'standard','state':'hidden'})
 cid=obj.get('data',{}).get('id')
 if not cid:sys.exit('Desafio criado sem ID, revise o painel antes de repetir')
 print('CRIADO:',cid,r['name'])
 req('POST','/api/v1/flags',{'challenge_id':cid,'content':r['flag'],'type':'static','data':''})
 if not a.sem_anexos:
  path=BASE/'PARTICIPANTES'/r['file'];boundary='----FortifySec'+uuid.uuid4().hex
  def field(k,v):return (f'--{boundary}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n{v}\r\n').encode()
  body=field('challenge_id',str(cid))+field('type','challenge')
  body+=(f'--{boundary}\r\nContent-Disposition: form-data; name="file"; filename="{path.name}"\r\nContent-Type: application/zip\r\n\r\n').encode()+path.read_bytes()+b'\r\n'+(f'--{boundary}--\r\n').encode()
  req('POST','/api/v1/files',body,'multipart/form-data; boundary='+boundary)
  print('ANEXADO:',path.name)
print('Concluido. Confira os desafios ocultos no painel administrativo.')
