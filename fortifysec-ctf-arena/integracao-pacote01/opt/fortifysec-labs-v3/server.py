#!/usr/bin/env python3
"""Local Unix socket lab controller. Run on host as a dedicated systemd service."""
import fcntl
import hashlib
import hmac
import importlib.util
import json
import os
from pathlib import Path
import re
import secrets
import socketserver
import subprocess
import time

SOCKET = '/run/fortifysec-labs/manager.sock'
SECRET_FILE = '/etc/fortifysec-labs/manager.key'
LABCTL = '/opt/fortifysec-labs-v2/labctl.py'
LABS = ('web-auth', 'api-idor', 'log-forensics', 'sql-injection', 'stored-xss', 'api-access', 'jwt-security', 'linux-audit', 'network-forensics')
MAX_ACTIVE = 10
MAX_MINUTES = 60

spec = importlib.util.spec_from_file_location('fs_labctl', LABCTL)
labctl = importlib.util.module_from_spec(spec)
spec.loader.exec_module(labctl)
KEY = Path(SECRET_FILE).read_bytes().strip()
GATEWAY_KEY = Path('/etc/fortifysec-labs/gateway.key').read_bytes().strip()
if len(GATEWAY_KEY) < 32:
    raise RuntimeError('Gateway key too short')
if len(KEY) < 32:
    raise RuntimeError('Manager key too short')



def lab_endpoint(container):
    """Resolve a porta local de um laboratório pelo Docker."""
    result = subprocess.run(
        ['docker', 'port', container, ('8080/tcp' if any((c['Config'].get('Labels') or {}).get('fortifysec.lab') in labctl.PACK1 and c['Name'].lstrip('/') == container for c in labctl.containers()) else '8000/tcp')],
        capture_output=True,
        text=True,
        timeout=5,
        check=True
    )

    for line in result.stdout.splitlines():
        host, sep, port = line.strip().rpartition(':')
        if sep and host == '127.0.0.1' and port.isdigit():
            number = int(port)
            if 1 <= number <= 65535:
                return number

    raise RuntimeError('Laboratório sem porta local válida')


def info(student):
    now = int(time.time())
    for c in labctl.containers():
        labels = c['Config'].get('Labels') or {}
        if labels.get('fortifysec.student') != student:
            continue
        expires = int(labels.get('fortifysec.expires') or '0')
        if expires <= now:
            return {'running': False}
        return {
            'running': c['State']['Running'],
            'lab': labels.get('fortifysec.lab'),
            'container': c['Name'].lstrip('/'),
            'expires_at': expires,
            'remaining_seconds': max(0, expires - now),
        }
    return {'running': False}


def execute(req):
    student = req.get('student')
    if not isinstance(student, str) or not re.fullmatch(r'ctfd-[1-9][0-9]{0,9}', student):
        raise ValueError('Invalid student')
    action = req.get('action')
    if action == 'status':
        return info(student)
    if action == 'endpoint':
        existing = info(student)
        if not existing.get('running'):
            return {'running': False}
        port = lab_endpoint(existing['container'])
        return {
            'running': True,
            'port': port,
            'expires_at': existing['expires_at']
        }
    if action == 'start':
        lab = req.get('lab')
        if lab not in LABS:
            raise ValueError('Unknown lab')
        labctl.cleanup()
        existing = info(student)
        if existing['running']:
            return existing
        if len(labctl.containers()) >= MAX_ACTIVE:
            raise ValueError('All lab slots are currently occupied')
        class Args: pass
        args = Args()
        args.student, args.lab, args.minutes, args.max_sessions = student, lab, MAX_MINUTES, MAX_ACTIVE
        # The original CLI prints JSON; invoke its function while capturing stdout.
        import contextlib
        import io
        with contextlib.redirect_stdout(io.StringIO()):
            labctl.start(args)
        return info(student)
    if action == 'stop':
        existing = info(student)
        if not existing['running']:
            return {'running': False}
        class Args: pass
        args = Args()
        args.container = existing['container']
        import contextlib
        import io
        with contextlib.redirect_stdout(io.StringIO()):
            labctl.stop(args)
        return {'running': False}
    raise ValueError('Unknown action')


class Handler(socketserver.StreamRequestHandler):
    def handle(self):
        try:
            raw = self.rfile.readline(4097)
            if not raw or len(raw) > 4096 or not raw.endswith(b'\n'):
                raise ValueError('Invalid request size')
            envelope = json.loads(raw)
            payload = envelope.get('payload')
            sig = envelope.get('sig')
            if not isinstance(payload, dict) or not isinstance(sig, str):
                raise ValueError('Invalid envelope')
            canonical = json.dumps(payload, sort_keys=True, separators=(',', ':')).encode()
            action = payload.get('action')
            if action not in ('status', 'start', 'stop', 'endpoint'):
                raise ValueError('Unknown action')
            selected_key = GATEWAY_KEY if action == 'endpoint' else KEY
            expected = hmac.new(selected_key, canonical, hashlib.sha256).hexdigest()
            if not hmac.compare_digest(expected, sig):
                raise ValueError('Invalid signature')
            ts = payload.get('ts')
            nonce = payload.get('nonce')
            if type(ts) is not int or abs(time.time() - ts) > 30 or not isinstance(nonce, str) or not re.fullmatch(r'[0-9a-f]{32}', nonce):
                raise ValueError('Expired or invalid request')
            with open('/run/fortifysec-labs/manager.lock', 'a+b') as lock:
                fcntl.flock(lock, fcntl.LOCK_EX)
                # One process with bounded replay cache; lock serializes all actions.
                now = time.time()
                self.server.seen = {k: v for k, v in self.server.seen.items() if now - v < 90}
                if nonce in self.server.seen:
                    raise ValueError('Replay rejected')
                self.server.seen[nonce] = now
                result = execute(payload)
            response = {'ok': True, 'result': result}
        except (ValueError, KeyError, RuntimeError, json.JSONDecodeError) as e:
            response = {'ok': False, 'error': str(e)[:180]}
        except Exception:
            response = {'ok': False, 'error': 'Internal manager error'}
        self.wfile.write((json.dumps(response, separators=(',', ':')) + '\n').encode())


class Server(socketserver.ThreadingUnixStreamServer):
    daemon_threads = True


def main():
    Path(SOCKET).parent.mkdir(parents=True, exist_ok=True)
    try:
        os.unlink(SOCKET)
    except FileNotFoundError:
        pass
    with Server(SOCKET, Handler) as srv:
        srv.seen = {}
        os.chown(SOCKET, 0, 1001)
        os.chmod(SOCKET, 0o660)  # Authenticated HMAC required for every request.
        srv.serve_forever()


if __name__ == '__main__':
    main()
