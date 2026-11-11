# Append to the END of the existing proxy-dev/homolog/server.py module.
# Does not change the forwarding logic or expose request data.
import socket as _fs_socket
import json as _fs_json
import time as _fs_time
import os as _fs_os
from flask import request as _fs_request

@app.before_request
def _fs_telemetry_clock():
    from flask import g
    g._fs_started = _fs_time.monotonic()

@app.after_request
def _fs_telemetry_after(response):
    try:
        from flask import g
        path = _fs_request.path
        if path.startswith('/internal/') or path.startswith('/redeem/'):
            return response
        # Authenticate with the proxy's existing session lookup.
        # Do not send cookies, IPs, URLs, query strings or headers.
        identity = authenticate()
        if not isinstance(identity, tuple) or len(identity) < 1:
            return response
        student = identity[0]
        if not isinstance(student, str) or not student.startswith('ctfd-'):
            return response
        elapsed = _fs_time.monotonic() - getattr(g, '_fs_started', _fs_time.monotonic())
        code = int(response.status_code)
        payload = dict(student=student, lab='active-instance', ts=int(_fs_time.time()),
                       status_class=str(code//100)+'xx',
                       latency_bucket='fast' if elapsed < .25 else 'normal' if elapsed < 2 else 'slow')
        if payload['status_class'] not in ('2xx','3xx','4xx','5xx'):
            return response
        sock = _fs_socket.socket(_fs_socket.AF_UNIX,_fs_socket.SOCK_DGRAM)
        try:
            sock.setblocking(False)
            sock.sendto(_fs_json.dumps(payload).encode(),_fs_os.environ.get('FS_LIVE_SOCKET','/run/fortifysec-live/collector.sock'))
        finally:
            sock.close()
    except Exception:
        pass  # Never affect the lab response when telemetry is unavailable.
    return response
