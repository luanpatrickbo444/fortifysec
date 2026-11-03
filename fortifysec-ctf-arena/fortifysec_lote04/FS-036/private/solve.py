import zlib
from pathlib import Path
p=Path(__file__).resolve().parent.parent/'public';print(zlib.decompress((p/'stream.bin').read_bytes())[::-1].decode())
