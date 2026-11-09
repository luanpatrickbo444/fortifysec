from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
FLAG='FS{idor_check_object_ownership}'
records={'100':{'owner':'aluno','title':'Boas-vindas','note':'Primeiro relatório'},'101':{'owner':'admin','title':'Auditoria interna','note':FLAG}}
class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/':
            payload={'mission':'Investigue a API e identifique acesso indevido a objetos','authenticated_as':'aluno','hint':'GET /api/reports/100'}; code=200
        elif self.path.startswith('/api/reports/'):
            key=self.path.split('/')[-1]; payload=records.get(key,{'error':'not found'}); code=200 if key in records else 404
        else: payload={'error':'not found'}; code=404
        b=json.dumps(payload).encode(); self.send_response(code); self.send_header('Content-Type','application/json'); self.send_header('Content-Length',str(len(b))); self.end_headers(); self.wfile.write(b)
ThreadingHTTPServer(('0.0.0.0',8000),Handler).serve_forever()
