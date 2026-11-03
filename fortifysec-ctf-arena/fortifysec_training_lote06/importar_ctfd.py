import argparse,json,os,sys,time
from pathlib import Path
from urllib.request import Request,urlopen
from urllib.error import HTTPError
p=Path(__file__).resolve().parent
m=json.loads((p/'admin/manifest.json').read_text())
a=argparse.ArgumentParser();a.add_argument('--url',default='http://127.0.0.1:8000');a.add_argument('--apply',action='store_true');args=a.parse_args()
print('Pacotes:',len(m),'modo:', 'IMPORTACAO' if args.apply else 'SIMULACAO')
if not args.apply: sys.exit(0)
token=os.environ.get('CTFD_ADMIN_TOKEN','')
if not token: sys.exit('Defina CTFD_ADMIN_TOKEN antes de --apply')
base=args.url.rstrip('/')+'/api/v1'
def api(path,method='GET',data=None):
 payload=json.dumps(data).encode() if data is not None else None
 req=Request(base+path,data=payload,method=method,headers={'Authorization':'Token '+token,'Accept':'application/json','Content-Type':'application/json'})
 try:
  with urlopen(req,timeout=20) as r:return json.load(r)
 except HTTPError as e:
  print('API erro',e.code,path,e.read().decode()[:500]);raise
existing=api('/challenges?view=admin').get('data',[])
names={x['name'] for x in existing}
for x in m:
 name=x['id']+' — '+x['title']
 if name in names:print('PULADO (ja existe):',name);continue
 desc=x['category']+' | '+x['difficulty']+' - Analise o anexo e encontre a flag.'
 r=api('/challenges','POST',{'name':name,'category':x['category'],'description':desc,'value':x['value'],'type':'standard','state':'hidden','max_attempts':0})
 cid=r['data']['id'];print('CRIADO:',cid,name)
 api('/flags','POST',{'challenge_id':cid,'content':x['flag'],'type':'static'})
 # Multipart upload using requests if installed
 try:
  import requests
  with open(p/x['file'],'rb') as f:
   resp=requests.post(base+'/files',headers={'Authorization':'Token '+token},data={'challenge_id':str(cid),'type':'challenge'},files={'file':(x['file'],f,'application/zip')},timeout=40)
  resp.raise_for_status()
  if not resp.json().get('success'):print('ATENCAO: arquivo nao anexado',name,resp.text[:300])
 except ImportError:
  print('ATENCAO: instale requests para anexar arquivos:',name)
 except Exception as e:print('ATENCAO: falha no anexo',name,str(e))
print('Importacao finalizada; revise arquivos e flags no painel admin.')
