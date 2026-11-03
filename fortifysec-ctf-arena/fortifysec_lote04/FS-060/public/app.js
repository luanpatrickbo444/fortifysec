// Incident reconstruction exercise; no live target.
const sessionSalt = "session-60-2027";
const tokenBlob = "NSohJyApN1ZwYx0EAG0BSlFHQF4KDBgABhoFCAQFF1YO";
function reconstruct(blob, salt) {
  const bytes = Uint8Array.from(atob(blob), c => c.charCodeAt(0));
  return String.fromCharCode(...bytes.map((v, i) => v ^ salt.charCodeAt(i % salt.length)));
}
console.log('Client-side artifact present');
