from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse
LOG='''2026-11-05T10:01:02Z 192.0.2.10 GET /login 200\n2026-11-05T10:01:08Z 192.0.2.10 POST /login 401\n2026-11-05T10:01:12Z 198.51.100.23 POST /login 401\n2026-11-05T10:01:13Z 198.51.100.23 POST /login 401\n2026-11-05T10:01:14Z 198.51.100.23 POST /login 401\n2026-11-05T10:01:15Z 198.51.100.23 POST /login 200\n2026-11-05T10:01:16Z 198.51.100.23 GET /admin/export?token=FS{detect_bruteforce_from_logs} 200\n2026-11-05T10:01:19Z 192.0.2.10 GET /dashboard 200\n'''
class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        path=urlparse(self.path).path
        if path=='/': data=b'FortifySec SOC Lab: investigue /logs/access.log e identifique o IP suspeito e a flag.\n'
        elif path=='/logs/access.log': data=LOG.encode()
        else: self.send_error(404); return
        self.send_response(200); self.send_header('Content-Type','text/plain; charset=utf-8'); self.send_header('Content-Length',str(len(data))); self.end_headers(); self.wfile.write(data)
ThreadingHTTPServer(('0.0.0.0',8000),Handler).serve_forever()
