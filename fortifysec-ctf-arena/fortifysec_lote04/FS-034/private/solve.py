from pathlib import Path
p=Path(__file__).resolve().parent.parent/'public';print(bytes((b-73)%256 for b in bytes.fromhex((p/'payload.hex').read_text())).decode())
