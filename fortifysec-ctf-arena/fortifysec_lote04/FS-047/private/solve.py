import struct,base64
from pathlib import Path
p=Path(__file__).resolve().parent.parent/'public';b=(p/'capture.pcap').read_bytes();pos=24;parts={}
while pos<len(b):
 sec,usec,n,orig=struct.unpack('<IIII',b[pos:pos+16]);pos+=16;frame=b[pos:pos+n];pos+=n;payload=frame[14+20+8:];seq,data=payload.split(b'|',1);parts[int(seq)]=base64.b64decode(data)
print(b''.join(parts[j] for j in sorted(parts)).decode())
