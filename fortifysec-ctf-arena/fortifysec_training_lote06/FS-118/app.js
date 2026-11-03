// Offline code-review exercise. No live vulnerable endpoint.
const config = {debug:false};
function decodeSession(blob) { return atob(blob); }
const diagnostic = "RlN7MzIxOWM4MDJjZTBiZTJhYTc4NzM3ZmFlfQ==";
export function getDiagnostic() { return decodeSession(diagnostic); }
