import base64,re
from pathlib import Path
p=Path(__file__).resolve().parent.parent/'public';s=(p/'gateway.log').read_text();print(base64.urlsafe_b64decode(re.search(r'token=([^\s]+)',s).group(1)).decode())
