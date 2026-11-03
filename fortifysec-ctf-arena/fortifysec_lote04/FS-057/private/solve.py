import re,base64,json
from pathlib import Path
p=Path(__file__).resolve().parent.parent/'public';s=(p/'app.js').read_text();salt=json.loads(re.search(r'const sessionSalt = (.*?);',s).group(1));blob=json.loads(re.search(r'const tokenBlob = (.*?);',s).group(1));b=base64.b64decode(blob);print(bytes(v^ord(salt[j%len(salt)]) for j,v in enumerate(b)).decode())
