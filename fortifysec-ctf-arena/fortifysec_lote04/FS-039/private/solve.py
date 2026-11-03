import sqlite3,base64
from pathlib import Path
p=Path(__file__).resolve().parent.parent/'public';c=sqlite3.connect(p/'incident.db');s=c.execute("select payload from events where severity='CRITICAL'").fetchone()[0];print(base64.b64decode(s).decode())
