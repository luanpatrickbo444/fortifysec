import hashlib
from pathlib import Path
p=Path(__file__).resolve().parent.parent/'public';k=hashlib.sha256((p/'nonce.txt').read_text().encode()).digest();d=(p/'data.bin').read_bytes();print(bytes(b^k[j%len(k)] for j,b in enumerate(d)).decode())
