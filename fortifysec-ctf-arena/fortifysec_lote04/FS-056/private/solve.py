from pathlib import Path
p=Path(__file__).resolve().parent.parent/'public';b=(p/'checkpoint').read_bytes();target=bytes([200,193,220,218,199,200,215,245,200,221,190,187,184,209,239,188,184,239,185,186,186,187,190,191,235,232,188,190,234,235,182,234,243]);key=142;assert target in b;print(bytes(x^key for x in target).decode())
