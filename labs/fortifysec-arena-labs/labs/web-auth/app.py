from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs
from html import escape

FLAG = 'FS{auth_client_side_is_not_authorization}'
class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        u = urlparse(self.path)
        qs = parse_qs(u.query)
        if u.path == '/':
            body = '''<h1>FortifySec - Portal de Treinamento</h1><p>Missão: encontre a falha no controle de acesso do painel.</p><p>Login de teste: aluno / aluno123</p><form action="/dashboard"><input name="user" value="aluno"><input name="role" value="student"><button>Entrar</button></form>'''
        elif u.path == '/dashboard':
            role = qs.get('role',['student'])[0]
            body = '<h1>Painel</h1><p>Perfil informado: '+escape(role)+'</p>'
            body += ('<p>Área administrativa: '+FLAG+'</p>' if role == 'admin' else '<p>Área restrita a administradores.</p>')
        else:
            self.send_error(404); return
        b = ('<!doctype html><meta charset="utf-8"><title>FS Lab Auth</title>'+body).encode()
        self.send_response(200); self.send_header('Content-Type','text/html; charset=utf-8'); self.send_header('Content-Length',str(len(b))); self.end_headers(); self.wfile.write(b)
ThreadingHTTPServer(('0.0.0.0',8000), Handler).serve_forever()
