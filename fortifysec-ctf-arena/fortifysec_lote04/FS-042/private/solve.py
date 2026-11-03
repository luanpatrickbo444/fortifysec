import struct
from pathlib import Path
p=Path(__file__).resolve().parent.parent/'public';b=(p/'evidence.png').read_bytes();pos=8
while pos<len(b):
 n=struct.unpack('>I',b[pos:pos+4])[0];typ=b[pos+4:pos+8];d=b[pos+8:pos+8+n];pos+=12+n
 if typ==b'tEXt':print(d.split(b'\0',1)[1].decode())
