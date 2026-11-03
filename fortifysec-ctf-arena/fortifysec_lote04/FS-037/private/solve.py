from pathlib import Path
p=Path(__file__).resolve().parent.parent/'public';s=(p/'telemetry.txt').read_text();print(bytes.fromhex(''.join(s[j+1]+s[j] for j in range(0,len(s),2))).decode())
