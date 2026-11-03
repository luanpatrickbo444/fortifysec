def inverse(data,op,k):
 if op=='xor':return bytes(x^k for x in data)
 if op=='rotate':return bytes(((x>>k)|(x<<(8-k)))&255 for x in data)
 if op=='reverse':return data[::-1]
 if op=='permute':return b''.join(data[i:i+7][::-1] for i in range(0,len(data),7))
 if op=='delta':
  out=[];prev=k
  for x in data:
   v=(x+prev)%256;out.append(v);prev=v
  return bytes(out)
 if op=='add':return bytes((x-k)%256 for x in data)
 if op=='interleave':
  a=data[:(len(data)+1)//2];b=data[(len(data)+1)//2:];out=bytearray()
  for i in range(len(b)):out.extend([a[i],b[i]])
  if len(a)>len(b):out.append(a[-1])
  return bytes(out)
 raise ValueError(op)
