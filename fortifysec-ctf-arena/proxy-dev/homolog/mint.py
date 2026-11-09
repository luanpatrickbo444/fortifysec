"""Local-only test ticket issuer. Never expose as a web endpoint."""
import argparse
import hashlib
import os
import re
import secrets
import sqlite3
import time

parser = argparse.ArgumentParser()
parser.add_argument('student', help='e.g. ctfd-123')
parser.add_argument('--ttl', type=int, default=60)
args = parser.parse_args()
if not re.fullmatch(r'ctfd-[1-9][0-9]{0,9}', args.student) or not 1 <= args.ttl <= 120:
    parser.error('Invalid student or TTL')
path = os.environ.get('FS_HOMOLOG_DB', '/tmp/fortifysec-homolog-proxy.sqlite3')
ticket = secrets.token_urlsafe(32)
with sqlite3.connect(path) as db:
    db.execute('CREATE TABLE IF NOT EXISTS tickets (digest TEXT PRIMARY KEY, student TEXT NOT NULL, expires INTEGER NOT NULL)')
    db.execute('INSERT INTO tickets VALUES (?, ?, ?)', (hashlib.sha256(ticket.encode()).hexdigest(), args.student, int(time.time()) + args.ttl))
print('/redeem/' + ticket)
