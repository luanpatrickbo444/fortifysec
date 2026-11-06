import { createHmac,timingSafeEqual } from 'node:crypto';import { cookies } from 'next/headers';
const secret=()=>{const s=process.env.ACADEMY_SESSION_SECRET;if(!s||s.length<32)throw Error('ACADEMY_SESSION_SECRET deve ter pelo menos 32 caracteres');return s};
export function token(){const expiry=Date.now()+8*60*60*1000;const value=String(expiry);return value+'.'+createHmac('sha256',secret()).update(value).digest('hex')}
export async function isAdmin(){const v=(await cookies()).get('fs_admin')?.value;if(!v)return false;const [exp,sig]=v.split('.');if(!exp||!sig||!/^\d+$/.test(exp)||Number(exp)<Date.now())return false;const expected=createHmac('sha256',secret()).update(exp).digest('hex');return sig.length===expected.length&&timingSafeEqual(Buffer.from(sig),Buffer.from(expected))}
