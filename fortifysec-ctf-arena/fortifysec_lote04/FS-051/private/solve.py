from pathlib import Path
p=Path(__file__).resolve().parent.parent/'public';b=(p/'checkpoint').read_bytes();target=bytes([45,36,57,63,34,45,50,16,45,56,91,94,90,52,82,10,9,91,8,95,95,13,91,90,89,8,82,15,89,94,88,9,22]);key=107;assert target in b;print(bytes(x^key for x in target).decode())
