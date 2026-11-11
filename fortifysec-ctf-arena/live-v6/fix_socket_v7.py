from pathlib import Path
import ast

p = Path("/opt/CTFd/CTFd/plugins/fortifysec_labs/__init__.py")
s = p.read_text()

old = "/run/fortifysec-labs/homolog-proxy.sock"
new = "/run/fortifysec-labs-host/homolog-proxy.sock"

if old in s:
    s = s.replace(old, new)
elif new not in s:
    raise SystemExit("Socket não encontrado. Build interrompido.")

ast.parse(s)
p.write_text(s)

print("Socket FortifySec corrigido.")
