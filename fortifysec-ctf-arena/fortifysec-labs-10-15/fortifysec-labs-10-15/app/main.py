import os, sqlite3, tempfile, json, base64, hmac, hashlib
from flask import Flask, request, jsonify, make_response
app=Flask(__name__)
LAB=os.environ.get('LAB_ID','10')
FLAG=os.environ.get('LAB_FLAG','FS{LOCAL_DEMO_CHANGE_ME}')
MISSIONS={
'10':('Broken Access Control','Identifique acesso indevido ao relatório de outro usuário','GET /api/reports/100'),
'11':('SQL Injection','Encontre a consulta insegura no catálogo de produtos','GET /api/products?name=...'),
'12':('JWT Validation','Explore a validação incorreta de um token de treinamento','GET /api/admin com Authorization: Bearer <token>'),
'13':('SSRF Simulado','Descubra o recurso interno acessível pelo visualizador','GET /api/preview?url=...'),
'14':('Insecure Upload','Teste o processamento inseguro de metadados de upload','POST /api/upload'),
'15':('Mass Assignment','Encontre um campo administrativo aceito indevidamente','PATCH /api/profile')}
@app.get('/')
def home():
 name,mission,hint=MISSIONS[LAB]
 return jsonify(lab=f'FS-{LAB}',name=name,mission=mission,authenticated_as='aluno',hint=hint)
@app.get('/health')
def health():return jsonify(ok=True,lab=LAB)
@app.get('/api/reports/<int:rid>')
def reports(rid):
 if LAB!='10':return jsonify(error='not found'),404
 if rid==100:return jsonify(id=100,owner='aluno',body='Meu relatório')
 if rid==101:return jsonify(id=101,owner='gestor',body='Relatório confidencial',flag=FLAG)
 return jsonify(error='not found'),404
@app.get('/api/products')
def products():
 if LAB!='11':return jsonify(error='not found'),404
 conn=sqlite3.connect(':memory:');conn.executescript("CREATE TABLE products(name TEXT,price INTEGER);INSERT INTO products VALUES('teclado',100),('mouse',50);CREATE TABLE secrets(flag TEXT);")
 conn.execute('INSERT INTO secrets VALUES(?)',(FLAG,))
 q=request.args.get('name','teclado')
 try: rows=conn.execute("SELECT name,price FROM products WHERE name='"+q+"'").fetchall();return jsonify(results=rows)
 except sqlite3.Error:return jsonify(error='invalid query'),400
@app.get('/api/token')
def token():
 if LAB!='12':return jsonify(error='not found'),404
 payload=base64.urlsafe_b64encode(json.dumps({'sub':'aluno','role':'user'}).encode()).decode().rstrip('=')
 return jsonify(token='training.'+payload+'.demo',hint='O servidor confia no conteúdo sem verificar a assinatura')
@app.get('/api/admin')
def admin():
 if LAB!='12':return jsonify(error='not found'),404
 token=request.headers.get('Authorization','').removeprefix('Bearer ')
 try: payload=json.loads(base64.urlsafe_b64decode(token.split('.')[1]+'==='))
 except (ValueError,IndexError):return jsonify(error='invalid token'),401
 return jsonify(flag=FLAG) if payload.get('role')=='admin' else (jsonify(error='forbidden'),403)
@app.get('/api/preview')
def preview():
 if LAB!='13':return jsonify(error='not found'),404
 url=request.args.get('url','')
 # Simulation only: no outbound HTTP requests or access to host metadata.
 if url=='http://internal.training.local/secret':return jsonify(content=FLAG)
 if url=='https://news.training.local/':return jsonify(content='Notícias de treinamento')
 return jsonify(error='URL indisponível no simulador',hint='Somente hosts de treinamento são simulados'),404
@app.post('/api/upload')
def upload():
 if LAB!='14':return jsonify(error='not found'),404
 data=request.get_json(silent=True) or {}
 filename=data.get('filename','')
 if not isinstance(filename,str):return jsonify(error='invalid filename'),400
 # Intentional vulnerable business rule: trusts client-supplied content_type metadata.
 if data.get('content_type')=='image/png' and filename.endswith('.php'):
  return jsonify(status='accepted',stored_as=filename,flag=FLAG)
 return jsonify(status='rejected',hint='O backend confia demais nos metadados fornecidos pelo cliente'),400
@app.route('/api/profile',methods=['GET','PATCH'])
def profile():
 if LAB!='15':return jsonify(error='not found'),404
 if request.method=='GET':return jsonify(username='aluno',role='user',department='training')
 data=request.get_json(silent=True) or {}
 if data.get('role')=='admin':return jsonify(status='updated',role='admin',flag=FLAG)
 return jsonify(status='updated',role='user')
if __name__=='__main__':app.run(host='0.0.0.0',port=8080)
