from pathlib import Path
p=Path(__file__).resolve().parent.parent/'public';b=(p/'checkpoint').read_bytes();target=bytes([198,207,210,212,201,198,217,251,198,211,176,181,180,223,227,181,230,179,227,226,183,178,178,230,181,177,230,185,176,225,225,180,253]);key=128;assert target in b;print(bytes(x^key for x in target).decode())
