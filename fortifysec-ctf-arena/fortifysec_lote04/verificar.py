from pathlib import Path
import subprocess,json,sys
r=Path(__file__).resolve().parent;m=json.loads((r/'manifest.private.json').read_text());errors=[]
for x in m:
 p=r/x['id']/'private'/'solve.py';q=subprocess.run([sys.executable,str(p)],capture_output=True,text=True)
 if q.returncode or q.stdout.strip()!=x['flag']:errors.append((x['id'],q.stderr,q.stdout))
 print(x['id'], 'OK' if not errors or errors[-1][0]!=x['id'] else 'FALHOU')
print(f'Verificados {len(m)-len(errors)}/{len(m)} desafios')
if errors:raise SystemExit(1)
