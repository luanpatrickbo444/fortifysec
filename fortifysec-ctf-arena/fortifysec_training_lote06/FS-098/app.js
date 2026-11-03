// Offline code-review exercise. No live vulnerable endpoint.
const config = {debug:false};
function decodeSession(blob) { return atob(blob); }
const diagnostic = "RlN7ZDNlZmFkMDJjOWM2Yzk0MWRiN2UyNmQyfQ==";
export function getDiagnostic() { return decodeSession(diagnostic); }
