// Incident reconstruction exercise; no live target.
const sessionSalt = "session-59-2027";
const tokenBlob = "NSohJyApN1Zzah0HCW1SSgRLEg1ZWUhQDBVXBQIOQgYO";
function reconstruct(blob, salt) {
  const bytes = Uint8Array.from(atob(blob), c => c.charCodeAt(0));
  return String.fromCharCode(...bytes.map((v, i) => v ^ salt.charCodeAt(i % salt.length)));
}
console.log('Client-side artifact present');
