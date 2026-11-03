from pathlib import Path
p=Path(__file__).resolve().parent.parent/'public';b=(p/'checkpoint').read_bytes();target=bytes([52,61,32,38,59,52,43,9,52,33,66,71,64,45,68,20,69,17,70,74,70,65,22,64,17,16,17,17,23,75,74,66,15]);key=114;assert target in b;print(bytes(x^key for x in target).decode())
