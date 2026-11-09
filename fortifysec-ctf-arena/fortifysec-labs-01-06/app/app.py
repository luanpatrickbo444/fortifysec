import os, sqlite3, json, base64, hmac, hashlib, struct, time
from flask import Flask, request, jsonify, render_template_string, Response, abort
import jwt
app=Flask(__name__)
LAB=os.environ.get('LAB_ID','sql-injection')
FLAG=os.environ.get('LAB_FLAG','FORTIFY{LOCAL_TEST_ONLY}')
LABS={
 'sql-injection':('SQL Injection — Data Breach','Descubra o segredo de uma conta de auditoria em um banco fictício.'),
 'stored-xss':('Stored XSS — Browser Injection','Investigue uma caixa de mensagens que renderiza HTML sem neutralização.'),
 'api-access':('API Broken Access Control','Encontre um relatório confidencial de outra conta simulada.'),
 'jwt-security':('JWT Authentication Flaws','Descubra como a aplicação confia em dados de um token não verificado.'),
 'linux-audit':('Linux Privilege Audit','Inspecione permissões e uma tarefa automatizada em um sistema Linux simulado.'),
 'network-forensics':('Network Packet Investigation','Examine uma captura PCAP sintética e reconstrua uma requisição HTTP.'),
}
assert LAB in LABS
TITLE,DESC=LABS[LAB]
BASE='''<!doctype html><html lang="pt-br"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{{ title }} · FortifySec</title><style>body{background:#090c13;color:#e9edf7;font:16px system-ui;margin:0}main{max-width:860px;margin:6vh auto;padding:30px;background:#131927;border:1px solid #2a3549;border-radius:16px}h1{color:#f25d65}code,pre{background:#080e19;padding:8px;border-radius:6px;overflow:auto}a{color:#78d1ff}input,textarea,button{padding:12px;background:#0b1320;color:white;border:1px solid #506078;border-radius:8px}button{cursor:pointer;background:#a5293c}li{margin:10px 0}</style><main><small>FORTIFYSEC / LABORATÓRIO {{lab}}</small><h1>{{title}}</h1><p>{{desc}}</p><hr>{{body|safe}}<hr><small>Ambiente de treinamento isolado. Flags: FORTIFY{...}</small></main></html>'''
def page(body):return render_template_string(BASE,title=TITLE,desc=DESC,lab=LAB,body=body)
@app.get('/health')
def health():return jsonify(status='ok',lab=LAB)
@app.get('/')
def home():
 if LAB=='sql-injection':
  return page('''<p>Portal interno de pesquisa de usuários. Investigue a consulta construída pela aplicação.</p><form action="/lookup"><input name="user" placeholder="Nome do usuário"><button>Pesquisar</button></form><p>Dica: a tabela fictícia chama-se <code>accounts</code>.</p>''')
 if LAB=='stored-xss':
  return page('''<p>Quadro de mensagens de um time de operações. O navegador de auditoria sinaliza a execução de JavaScript via <code>/audit?proof=1</code> (não há captura de cookies).</p><form method="post" action="/post"><textarea name="message" rows="4" cols="55" placeholder="Mensagem"></textarea><button>Publicar</button></form><a href="/board">Abrir quadro</a>''')
 if LAB=='api-access':
  return page('''<p>Você é o usuário <code>analyst</code>. Consulte <code>/api/profile</code> e os relatórios em <code>/api/reports/100</code>. Descubra o ID de outro relatório.</p>''')
 if LAB=='jwt-security':
  return page('''<p>Um serviço legado confia no conteúdo de tokens JWT sem verificar sua assinatura. Examine o token fornecido em <a href="/token">/token</a> e teste <code>/vault</code> com cabeçalho <code>Authorization: Bearer &lt;token&gt;</code>.</p>''')
 if LAB=='linux-audit':
  return page('''<p>Snapshot simulado de um servidor. Investigue <a href="/files">/files</a> e <a href="/cron">/cron</a>. A tarefa privilegiada lê uma configuração modificável por qualquer usuário. Descubra o arquivo que ela utiliza.</p>''')
 return page('''<p>Baixe o <a href="/capture.pcap">PCAP sintético</a> e identifique o valor do cabeçalho <code>X-Lab-Token</code> de uma requisição HTTP.</p><p>Ferramentas sugeridas: Wireshark, tshark.</p>''')
@app.get('/lookup')
def lookup():
 if LAB!='sql-injection':abort(404)
 user=request.args.get('user','')[:180]
 db=sqlite3.connect(':memory:')
 db.executescript('CREATE TABLE accounts(username TEXT, secret TEXT); INSERT INTO accounts VALUES ("guest","public"),("analyst","training"),("audit","hidden");')
 db.execute('UPDATE accounts SET secret=? WHERE username="audit"',(FLAG,))
 try:
  # Intentionally vulnerable query: isolated, ephemeral SQLite database only.
  results=db.execute("SELECT username, secret FROM accounts WHERE username = '"+user+"'").fetchall()
  return page('<pre>'+__import__('html').escape(repr(results))+'</pre><a href="/">Voltar</a>')
 except sqlite3.Error as exc:return page('<pre>Erro de consulta: '+__import__('html').escape(str(exc))+'</pre>'),400
messages=[]
@app.post('/post')
def post():
 if LAB!='stored-xss':abort(404)
 messages.append(request.form.get('message','')[:2000]);del messages[:-20]
 return ('<a href="/board">Mensagem publicada — visualizar</a>',201)
@app.get('/board')
def board():
 if LAB!='stored-xss':abort(404)
 # Deliberately unsafe output only within an isolated training origin.
 return page('<h2>Mensagens</h2>'+''.join('<article>'+x+'</article><hr>' for x in messages)+'<a href="/">Voltar</a>')
@app.get('/audit')
def audit():
 if LAB!='stored-xss':abort(404)
 if request.args.get('proof')=='1':return jsonify(flag=FLAG,note='Flag de prova, sem sessão ou cookies reais')
 abort(404)
@app.get('/api/profile')
def profile():
 if LAB!='api-access':abort(404)
 return jsonify(user='analyst',report_id=100,team='SOC')
@app.get('/api/reports/<int:rid>')
def reports(rid):
 if LAB!='api-access':abort(404)
 data={100:{'owner':'analyst','summary':'Routine SOC review'},101:{'owner':'manager','summary':'Budget'},102:{'owner':'director','summary':'Confidential', 'flag':FLAG}}
 if rid not in data:abort(404)
 # Intentionally missing object-level authorization in this simulated API.
 return jsonify(id=rid,**data[rid])
@app.get('/token')
def token():
 if LAB!='jwt-security':abort(404)
 return jsonify(token=jwt.encode({'sub':'analyst','role':'viewer'},'lab-demo-key',algorithm='HS256'))
@app.get('/vault')
def vault():
 if LAB!='jwt-security':abort(404)
 auth=request.headers.get('Authorization','')
 if not auth.startswith('Bearer '):return jsonify(error='Bearer token required'),401
 try:
  # Intentionally insecure: unverified claims; training-only endpoint.
  claims=jwt.decode(auth[7:],options={'verify_signature':False},algorithms=['HS256'])
 except jwt.PyJWTError:return jsonify(error='invalid token'),400
 return jsonify(flag=FLAG) if claims.get('role')=='admin' else (jsonify(error='admin role required'),403)
@app.get('/files')
def files():
 if LAB!='linux-audit':abort(404)
 return jsonify(files=[{'path':'/etc/cron.d/backup','mode':'0644','owner':'root'},{'path':'/opt/backup/config.ini','mode':'0666','owner':'root'},{'path':'/root/flag.txt','mode':'0600','owner':'root'}],hint='Qual arquivo é gravável por todos?')
@app.get('/cron')
def cron():
 if LAB!='linux-audit':abort(404)
 return jsonify(schedule='*/5 * * * * root /usr/local/bin/backup --config /opt/backup/config.ini',note='Simulação, nenhum cron privilegiado executado')
@app.get('/audit-path')
def audit_path():
 if LAB!='linux-audit':abort(404)
 return jsonify(flag=FLAG) if request.args.get('path')=='/opt/backup/config.ini' else (jsonify(error='arquivo incorreto'),400)
def pcap():
 # Synthetic Ethernet/IPv4/TCP single packet with fake addresses, no real capture.
 payload=('GET /telemetry HTTP/1.1\r\nHost: training.invalid\r\nX-Lab-Token: '+FLAG+'\r\n\r\n').encode()
 eth=bytes.fromhex('0200000000010200000000020800')
 ip=bytearray(20);ip[0]=0x45;struct.pack_into('!H',ip,2,20+20+len(payload));ip[8]=64;ip[9]=6;ip[12:16]=bytes([192,0,2,10]);ip[16:20]=bytes([198,51,100,20])
 tcp=bytearray(20);struct.pack_into('!HH',tcp,0,51515,80);tcp[12]=0x50;tcp[13]=0x18
 pkt=eth+ip+tcp+payload
 return struct.pack('<IHHIIII',0xa1b2c3d4,2,4,0,0,65535,1)+struct.pack('<IIII',int(time.time()),0,len(pkt),len(pkt))+pkt
@app.get('/capture.pcap')
def capture():
 if LAB!='network-forensics':abort(404)
 return Response(pcap(),mimetype='application/vnd.tcpdump.pcap',headers={'Content-Disposition':'attachment; filename=fortifysec-training.pcap'})
