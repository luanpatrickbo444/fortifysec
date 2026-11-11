"""Best-effort, privacy-minimal lab traffic telemetry."""
import json
import os
import socket
import time

SOCKET_PATH = os.environ.get('FS_LIVE_EVENTS_SOCKET', '/run/fortifysec-live/events.sock')

def emit_lab_request(student, status, elapsed_ms):
    """Never interrupt lab traffic if telemetry is unavailable."""
    try:
        event = {
            'kind': 'lab_request',
            'ts': int(time.time()),
            'lab': 'active-instance',
            'status_class': f'{int(status) // 100}xx',
            'latency_bucket': ('fast' if elapsed_ms < 100 else 'normal' if elapsed_ms < 500 else 'slow'),
        }
        # Do not include student ID, path, query, IP, headers or body.
        data = json.dumps(event, separators=(',', ':')).encode()
        with socket.socket(socket.AF_UNIX, socket.SOCK_DGRAM) as sock:
            sock.settimeout(0.02)
            sock.sendto(data, SOCKET_PATH)
    except (OSError, ValueError, TypeError):
        pass
