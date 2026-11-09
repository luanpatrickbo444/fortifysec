import os,json,html,hmac,hashlib,urllib.parse
from http.server import BaseHTTPRequestHandler,ThreadingHTTPServer
LAB=os.environ['LAB_ID']; FLAG=os.environ['LAB_FLAG']
DATA=json.loads(open('/app/manifest.json').read())
D=next(x for x in DATA if x['id']==LAB)
ANSWER=D['answer']
if LAB=='fs-025': ANSWER+=hashlib.sha256(b'omega').hexdigest()[:8]
class H(BaseHTTPRequestHandler):
 def send(self,code,s,typ='text/html; charset=utf-8'):
  b=s.encode();self.send_response(code);self.send_header('Content-Type',typ);self.send_header('Content-Length',str(len(b)));self.send_header('Cache-Control','no-store');self.send_header('X-Content-Type-Options','nosniff');self.end_headers();self.wfile.write(b)
 def do_GET(self):
  if self.path=='/health':return self.send(200,'ok','text/plain')
  if self.path=='/evidence':return self.send(200,json.dumps({'evidence':D['evidence']}),'application/json')
  if self.path!='/':return self.send(404,'Not found','text/plain')
  page='<meta charset="utf-8"><title>FortifySec Labs</title><body style="background:#0a1220;color:#eaf2ff;font:18px system-ui;padding:40px;max-width:850px"><h1>'+html.escape(D['name'])+'</h1><p>'+html.escape(D['question'])+'</p><pre style="white-space:pre-wrap;background:#182944;padding:20px">'+html.escape(D['evidence'])+'</pre><p><a style="color:#80bbff" href="/evidence">Evidência JSON</a></p><form method="post" action="/submit"><input name="answer" maxlength="200" required><button>Validar resposta</button></form></body>'
  self.send(200,page)
 def do_POST(self):
  if self.path!='/submit':return self.send(404,'Not found','text/plain')
  try: size=int(self.headers.get('Content-Length','0'))
  except ValueError:return self.send(400,'Invalid size','text/plain')
  if size<1 or size>512:return self.send(413,'Invalid size','text/plain')
  ans=urllib.parse.parse_qs(self.rfile.read(size).decode(errors='replace')).get('answer',[''])[0].strip()
  ok=hmac.compare_digest(ans,ANSWER)
  msg=('Correto! Flag: '+FLAG) if ok else 'Resposta incorreta.'
  self.send(200,'<meta charset="utf-8"><body style="background:#0a1220;color:#eaf2ff;font:18px system-ui;padding:40px"><h2>'+html.escape(msg)+'</h2><a href="/">Voltar</a></body>')
 def log_message(self,*args):pass
ThreadingHTTPServer(('0.0.0.0',8080),H).serve_forever()
