#!/usr/bin/env python3
"""Importa 6 desafios via API CTFd, com anexos e flags. Ocultos por padrao."""
import argparse, json, os, pathlib, sys, zipfile
try:
 import requests
except ImportError:
 sys.exit('Instale requests: python3 -m pip install requests')
ROOT=pathlib.Path(__file__).resolve().parent
parser=argparse.ArgumentParser()
parser.add_argument('--url',default='http://127.0.0.1:8000')
parser.add_argument('--aplicar',action='store_true')
args=parser.parse_args()
entries=json.loads((ROOT/'ADMIN_PRIVADO/desafios.json').read_text())
for e in entries:
 z=ROOT/'PARTICIPANTES'/e['archive']
 assert z.is_file(),f'Arquivo ausente: {z}'
 with zipfile.ZipFile(z) as f: assert f.testzip() is None
 assert e['flag'].startswith('FSCTF{') and e['flag'].endswith('}')
 print(f"VALIDADO {e['id']} | {e['name']} | {z.stat().st_size} bytes")
if not args.aplicar:
 print('Simulacao concluida. Nenhum dado enviado. Use --aplicar para importar.');sys.exit(0)
token=os.environ.get('CTFD_ADMIN_TOKEN')
if not token:sys.exit('Configure a variavel CTFD_ADMIN_TOKEN antes de importar.')
s=requests.Session();s.headers.update({'Authorization':f'Token {token}','Accept':'application/json'})
url=args.url.rstrip('/')
def api(method,path,**kwargs):
 try:r=s.request(method,url+'/api/v1/'+path.lstrip('/'),timeout=35,**kwargs)
 except requests.RequestException as ex:sys.exit(f'Erro de conexao: {ex}')
 try:body=r.json()
 except ValueError:sys.exit(f'API {path}: HTTP {r.status_code}, resposta nao JSON: {r.text[:250]}')
 if not r.ok or body.get('success') is False:sys.exit(f'API {path}: HTTP {r.status_code}, {str(body)[:650]}')
 return body.get('data')
existing=api('GET','challenges?view=admin')
if not isinstance(existing,list):sys.exit('Nao foi possivel listar desafios; verifique as permissoes do token.')
known={e['name'] for e in existing}
for e in entries:
 if e['name'] in known:
  print('IGNORADO: desafio existente',e['name']);continue
 print('CRIANDO:',e['name'])
 data=api('POST','challenges',json={'name':e['name'],'category':e['category'],'description':e['description']+'\n\nBaixe o arquivo anexo para realizar o laboratorio.','value':e['value'],'type':'standard','state':'hidden'})
 cid=data['id']
 api('POST','flags',json={'challenge_id':cid,'content':e['flag'],'type':'static','data':''})
 z=ROOT/'PARTICIPANTES'/e['archive']
 with z.open('rb') as fp:
  uploaded=api('POST','files',files={'file':(z.name,fp,'application/zip')},data={'type':'challenge','challenge_id':str(cid)})
 print('OK:',e['name'],'ID',cid,'anexo',z.name)
print('IMPORTACAO FINALIZADA. Confira /admin/challenges antes de publicar.')
