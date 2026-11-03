from pathlib import Path
p=Path(__file__).resolve().parent.parent/'public';d=bytes.fromhex((p/'cipher.hex').read_text());k=bytes.fromhex((p/'key.hex').read_text());print(bytes(b^k[j%len(k)] for j,b in enumerate(d)).decode())
