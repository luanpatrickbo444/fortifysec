#!/usr/bin/env python3
import argparse,os,json,pathlib,sys
try:import requests
except ImportError:sys.exit('Install requests: python3 -m pip install requests')
p=argparse.ArgumentParser();p.add_argument('--url',default='http://127.0.0.1:8000');p.add_argument('--apply',action='store_true');a=p.parse_args()
root=pathlib.Path(__file__).resolve().parents[1]
manifest=json.loads((root/'admin/manifest.json').read_text())
for c in manifest:assert (root/'challenges'/c['file']).is_file()
print('Validated',len(manifest),'challenge archives')
if not a.apply:sys.exit('Dry run: use --apply to create hidden challenges')
token=os.getenv('CTFD_ADMIN_TOKEN')
if not token:sys.exit('CTFD_ADMIN_TOKEN missing')
s=requests.Session();s.headers.update({'Authorization':'Token '+token,'Accept':'application/json'})
url=a.url.rstrip('/')
def api(method,path,**kw):
 r=s.request(method,url+'/api/v1/'+path,timeout=30,**kw)
 if not r.ok:raise RuntimeError(f'{method} {path}: HTTP {r.status_code}: {r.text[:400]}')
 j=r.json()
 if not j.get('success'):raise RuntimeError(str(j)[:400])
 return j['data']
existing=api('GET','challenges?view=admin')
known={c['name'] for c in existing}
for c in manifest:
 if c['name'] in known:
  print('SKIP existing',c['name']);continue
 payload={'name':c['name'],'category':c['category'],'description':f"Offline evidence reconstruction. Download the attached {c['file']} and submit the recovered proof token.",'value':c['value'],'type':'standard','state':'hidden'}
 created=api('POST','challenges',json=payload);cid=created['id']
 print('CREATED hidden',c['name'],'id',cid,flush=True)
 api('POST','flags',json={'challenge_id':cid,'content':c['flag'],'type':'static','data':''})
 with open(root/'challenges'/c['file'],'rb') as f:
  api('POST','files',files={'file':(c['file'],f,'application/zip')},data={'challenge_id':str(cid),'type':'challenge'})
 print('FLAG+FILE OK',cid,flush=True)
print('Import completed; review all hidden challenges in admin panel.')
