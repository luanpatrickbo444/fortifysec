// Offline code-review exercise. No live vulnerable endpoint.
const config = {debug:false};
function decodeSession(blob) { return atob(blob); }
const diagnostic = "RlN7MjM2N2U3NzY0NjM3ZjM2ZDcyZjQ1Njk1fQ==";
export function getDiagnostic() { return decodeSession(diagnostic); }
