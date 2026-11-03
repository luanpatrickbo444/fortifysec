import base64
from pathlib import Path
p=Path(__file__).resolve().parent.parent/'public';print(base64.b85decode((p/'packet.txt').read_text())[::-1].decode())
