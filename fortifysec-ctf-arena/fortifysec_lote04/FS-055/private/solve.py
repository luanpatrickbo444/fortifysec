from pathlib import Path
p=Path(__file__).resolve().parent.parent/'public';b=(p/'checkpoint').read_bytes();target=bytes([193,200,213,211,206,193,222,252,193,212,183,178,178,216,182,179,226,178,179,179,180,176,226,225,226,183,228,180,225,228,182,183,250]);key=135;assert target in b;print(bytes(x^key for x in target).decode())
