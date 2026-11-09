"""Isolated lab HTTP proxy for homologation. Never expose this directly to the Internet."""
import hashlib
import hmac
import json
import os
import re
import secrets
import socket
import sqlite3
import time
from pathlib import Path
from urllib.parse import urlsplit

import requests
from flask import Flask, Response, abort, make_response, redirect, request

app = Flask(__name__)
DB = os.environ.get('FS_HOMOLOG_DB', '/tmp/fortifysec-homolog-proxy.sqlite3')
SECRET_FILE = os.environ['FS_HOMOLOG_SECRET_FILE']
MANAGER_SOCKET = os.environ.get('FS_MANAGER_SOCKET', '/run/fortifysec-labs/manager.sock')
GATEWAY_KEY_FILE = os.environ.get('FS_GATEWAY_KEY_FILE', '/etc/fortifysec-labs/gateway.key')
COOKIE = '__Host-fs-lab-homolog'
ALLOWED_METHODS = ('GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS')
STUDENT = re.compile(r'^ctfd-[1-9][0-9]{0,9}$')


def db():
    connection = sqlite3.connect(DB, timeout=5)
    connection.execute('PRAGMA busy_timeout=5000')
    connection.execute('CREATE TABLE IF NOT EXISTS tickets (digest TEXT PRIMARY KEY, student TEXT NOT NULL, expires INTEGER NOT NULL)')
    connection.execute('CREATE TABLE IF NOT EXISTS sessions (digest TEXT PRIMARY KEY, student TEXT NOT NULL, expires INTEGER NOT NULL)')
    connection.commit()
    return connection


def manager_endpoint(student):
    payload = {'action': 'endpoint', 'student': student, 'ts': int(time.time()), 'nonce': secrets.token_hex(16)}
    canonical = json.dumps(payload, sort_keys=True, separators=(',', ':')).encode()
    key = Path(GATEWAY_KEY_FILE).read_bytes().strip()
    if len(key) < 32:
        raise RuntimeError('Invalid manager gateway key')
    sig = hmac.new(key, canonical, hashlib.sha256).hexdigest()
    data = json.dumps({'payload': payload, 'sig': sig}, separators=(',', ':')).encode() + b'\n'
    with socket.socket(socket.AF_UNIX, socket.SOCK_STREAM) as s:
        s.settimeout(8)
        s.connect(MANAGER_SOCKET)
        s.sendall(data)
        result = bytearray()
        while not result.endswith(b'\n'):
            part = s.recv(4096)
            if not part or len(result) + len(part) > 16384:
                raise RuntimeError('Invalid manager reply')
            result.extend(part)
    reply = json.loads(result)
    if not reply.get('ok'):
        raise RuntimeError('Manager rejected endpoint')
    endpoint = reply.get('result')
    if not isinstance(endpoint, dict) or not endpoint.get('running'):
        return None
    port = endpoint.get('port')
    expiry = endpoint.get('expires_at')
    if type(port) is not int or not 1 <= port <= 65535 or type(expiry) is not int or expiry <= time.time():
        raise RuntimeError('Invalid manager endpoint')
    return port, expiry


def digest(value):
    return hashlib.sha256(value.encode()).hexdigest()


def authenticate():
    cookie = request.cookies.get(COOKIE, '')
    if not re.fullmatch(r'[A-Za-z0-9_-]{30,100}', cookie):
        abort(401)
    with db() as conn:
        row = conn.execute('SELECT student, expires FROM sessions WHERE digest=?', (digest(cookie),)).fetchone()
    if not row or row[1] <= time.time():
        abort(401)
    return row[0], row[1]


@app.get('/health')
def health():
    return {'ok': True, 'environment': 'homologation'}


@app.get('/redeem/<ticket>')
def redeem(ticket):
    if not re.fullmatch(r'[A-Za-z0-9_-]{30,100}', ticket):
        abort(403)
    now = int(time.time())
    with db() as conn:
        conn.execute('BEGIN IMMEDIATE')
        row = conn.execute('SELECT student, expires FROM tickets WHERE digest=?', (digest(ticket),)).fetchone()
        if not row or row[1] <= now:
            abort(403)
        conn.execute('DELETE FROM tickets WHERE digest=?', (digest(ticket),))
        student, expiry = row
        try:
            endpoint = manager_endpoint(student)
        except Exception:
            app.logger.exception('Manager unavailable during redemption')
            abort(503)
        if endpoint is None:
            abort(404)
        session = secrets.token_urlsafe(32)
        expiry = min(expiry, endpoint[1])
        conn.execute('INSERT INTO sessions VALUES (?, ?, ?)', (digest(session), student, expiry))
    response = redirect('/', 303)
    response.set_cookie(COOKIE, session, max_age=max(1, expiry-now), secure=True, httponly=True, samesite='Strict', path='/')
    response.headers['Referrer-Policy'] = 'no-referrer'
    response.headers['Cache-Control'] = 'no-store'
    return response


@app.route('/', defaults={'path': ''}, methods=ALLOWED_METHODS)
@app.route('/<path:path>', methods=ALLOWED_METHODS)
def proxy(path):
    student, session_expiry = authenticate()
    try:
        endpoint = manager_endpoint(student)
    except Exception:
        app.logger.exception('Manager unavailable')
        abort(503)
    if endpoint is None or endpoint[1] <= time.time() or session_expiry <= time.time():
        abort(403)
    port, _ = endpoint
    # Never accept arbitrary upstream host, port, or scheme from a browser.
    target = f'http://127.0.0.1:{port}/' + path
    permitted = ('Accept', 'Accept-Language', 'Content-Type', 'Range', 'If-None-Match', 'If-Modified-Since')
    headers = {k: request.headers[k] for k in permitted if k in request.headers}
    # Deliberately do not forward browser cookies or authorization headers to labs.
    try:
        upstream = requests.request(request.method, target, params=request.args,
                                    data=request.get_data(), headers=headers,
                                    timeout=(3, 12), allow_redirects=False, stream=True)
        # Bound response size to prevent memory exhaustion.
        body = upstream.raw.read(10 * 1024 * 1024 + 1, decode_content=True)
        upstream.close()
        if len(body) > 10 * 1024 * 1024:
            abort(502)
    except requests.RequestException:
        app.logger.exception('Upstream request failed')
        abort(502)
    response = make_response(body, upstream.status_code)
    for name in ('Content-Type', 'Cache-Control', 'ETag', 'Last-Modified', 'Accept-Ranges', 'Content-Range'):
        if name in upstream.headers:
            response.headers[name] = upstream.headers[name]
    location = upstream.headers.get('Location')
    if location:
        parsed = urlsplit(location)
        # Block cross-origin redirects and protocol-relative redirects.
        if not parsed.scheme and not parsed.netloc and location.startswith('/') and not location.startswith('//'):
            response.headers['Location'] = location
        else:
            response.headers['Location'] = '/'
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['Referrer-Policy'] = 'no-referrer'
    response.headers['Cache-Control'] = 'no-store'
    response.headers['Content-Security-Policy'] = "frame-ancestors 'none'"
    return response


if __name__ == '__main__':
    raise SystemExit('Use gunicorn; do not use Flask development server')
