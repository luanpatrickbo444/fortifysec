"""Local-only staging collector. Not an authenticated public CTFd endpoint."""
import json, os, socket, threading, time
from collections import deque
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

SOCKET = os.environ.get('FS_LIVE_EVENTS_SOCKET', '/tmp/fortifysec-live-staging.sock')
HOST = '127.0.0.1'
PORT = 8511
EVENTS = deque(maxlen=300)
ALLOWED = {'kind', 'ts', 'lab', 'status_class', 'latency_bucket'}

def listen():
    path = Path(SOCKET)
    if path.exists():
        raise SystemExit(f'Socket already exists: {path}; inspect before removing')
    sock = socket.socket(socket.AF_UNIX, socket.SOCK_DGRAM)
    sock.bind(SOCKET)
    os.chmod(SOCKET, 0o600)
    while True:
        data, _ = sock.recvfrom(2048)
        try:
            event = json.loads(data)
            if (isinstance(event, dict) and set(event) == ALLOWED
                and event.get('kind') == 'lab_request'
                and event.get('status_class') in ('2xx','3xx','4xx','5xx')
                and event.get('latency_bucket') in ('fast','normal','slow')
                and event.get('lab') == 'active-instance'
                and isinstance(event.get('ts'), int)):
                EVENTS.append(event)
        except (ValueError, TypeError):
            pass

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/api/events':
            body = json.dumps({'events': list(EVENTS), 'count': len(EVENTS)}).encode()
            mime = 'application/json'
        elif self.path in ('/app.js', '/style.css'):
            body = (Path(__file__).parent / self.path.lstrip('/')).read_bytes()
            mime = 'application/javascript' if self.path.endswith('.js') else 'text/css'
        elif self.path == '/':
            body = (Path(__file__).parent / 'index.html').read_bytes()
            mime = 'text/html; charset=utf-8'
        else:
            self.send_error(404)
            return
        self.send_response(200)
        self.send_header('Content-Type', mime)
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Cache-Control', 'no-store')
        self.send_header('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'")
        self.end_headers()
        self.wfile.write(body)

if __name__ == '__main__':
    threading.Thread(target=listen, daemon=True).start()
    print(f'Staging collector: http://{HOST}:{PORT} socket={SOCKET}', flush=True)
    ThreadingHTTPServer((HOST, PORT), Handler).serve_forever()
