#!/usr/bin/env python3
"""Receive minimal proxy telemetry over a local UNIX datagram socket."""
import json, os, socket, sqlite3, time
from pathlib import Path
SOCK = os.getenv('FS_LIVE_SOCKET', '/run/fortifysec-live/collector.sock')
DB = os.getenv('FS_LIVE_DB', '/var/lib/fortifysec-live/events.sqlite3')
Path(SOCK).parent.mkdir(parents=True, exist_ok=True)
con=sqlite3.connect(DB,timeout=5)
con.execute('PRAGMA journal_mode=DELETE')
con.execute('CREATE TABLE IF NOT EXISTS events (id INTEGER PRIMARY KEY AUTOINCREMENT, ts INTEGER NOT NULL, student TEXT NOT NULL, lab TEXT NOT NULL, status_class TEXT NOT NULL, latency_bucket TEXT NOT NULL)')
con.execute('CREATE INDEX IF NOT EXISTS idx_events_student_ts ON events(student,ts)')
con.commit()
os.chmod(DB,0o640)
if Path(SOCK).exists():
    raise SystemExit('Socket already exists; inspect and remove stale socket manually: '+SOCK)
s=socket.socket(socket.AF_UNIX,socket.SOCK_DGRAM)
s.bind(SOCK);os.chmod(SOCK,0o600)
print('FortifySec collector listening',flush=True)
try:
    while True:
        raw,_=s.recvfrom(1024)
        try:
            x=json.loads(raw)
            if set(x)!={'student','lab','status_class','latency_bucket','ts'}:continue
            if not isinstance(x['student'],str) or not x['student'].startswith('ctfd-') or not x['student'][5:].isdigit():continue
            if x['lab']!='active-instance' or x['status_class'] not in ('2xx','3xx','4xx','5xx') or x['latency_bucket'] not in ('fast','normal','slow'):continue
            if type(x['ts']) is not int or abs(x['ts']-time.time())>60:continue
            con.execute('INSERT INTO events(ts,student,lab,status_class,latency_bucket) VALUES(?,?,?,?,?)',(x['ts'],x['student'],x['lab'],x['status_class'],x['latency_bucket']))
            con.execute('DELETE FROM events WHERE ts<?',(int(time.time())-7*86400,))
            con.commit()
        except (ValueError,TypeError,sqlite3.Error):pass
finally:
    s.close();con.close()
    try: Path(SOCK).unlink()
    except OSError: pass
