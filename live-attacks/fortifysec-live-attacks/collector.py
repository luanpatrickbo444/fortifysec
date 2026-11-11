"""Local-only lab activity collector. Not a public authenticated endpoint."""
import json, os, socket, threading, time
from collections import deque
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

SOCKET = os.environ.get('FS_LIVE_EVENTS_SOCKET', '/tmp/fortifysec-live-staging.sock')
HOST, PORT = '127.0.0.1', 8511
EVENTS = deque(maxlen=1000)
LOCK = threading.Lock()
SEQUENCE = 0
ALLOWED = {'kind', 'ts', 'lab', 'status_class', 'latency_bucket'}

def listen():
    global SEQUENCE
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
                and type(event.get('ts')) is int):
                with LOCK:
                    SEQUENCE += 1
                    EVENTS.append(dict(event, id=SEQUENCE))
        except (ValueError, TypeError):
            pass

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        path = self.path.split('?', 1)[0]
        if path == '/api/events':
            with LOCK:
                payload = {'events': list(EVENTS)[-150:], 'count': SEQUENCE, 'server_ts': int(time.time())}
            body, mime = json.dumps(payload).encode(), 'application/json'
        elif path in ('/app.js', '/style.css', '/index.html'):
            body = (Path(__file__).parent / path.lstrip('/')).read_bytes()
            mime = 'application/javascript' if path.endswith('.js') else 'text/css' if path.endswith('.css') else 'text/html; charset=utf-8'
        elif path == '/':
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
    print(f'Live Attacks: http://{HOST}:{PORT} socket={SOCKET}', flush=True)
    ThreadingHTTPServer((HOST, PORT), Handler).serve_forever()
