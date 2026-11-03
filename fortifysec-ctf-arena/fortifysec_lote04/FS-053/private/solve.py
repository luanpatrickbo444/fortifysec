from pathlib import Path
p=Path(__file__).resolve().parent.parent/'public';b=(p/'checkpoint').read_bytes();target=bytes([63,54,43,45,48,63,32,2,63,42,73,76,74,38,28,24,65,24,64,74,76,75,72,74,65,26,24,76,79,76,65,72,4]);key=121;assert target in b;print(bytes(x^key for x in target).decode())
