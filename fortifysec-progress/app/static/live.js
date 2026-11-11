/* Poll lightweight version endpoint; refresh only when data changes. */
(() => {
  let current = null;
  let pending = false;
  const status = document.createElement('span');
  status.className = 'live-indicator';
  status.textContent = '● AO VIVO';
  const bar = document.querySelector('.topright');
  if (bar) bar.prepend(status);
  async function check() {
    if (pending || document.hidden) return;
    pending = true;
    try {
      const r = await fetch('/api/progress/version', {cache:'no-store'});
      if (!r.ok) throw new Error('offline');
      const payload = await r.json();
      status.textContent = '● AO VIVO';
      status.classList.remove('offline');
      if (current !== null && current !== payload.version) {
        window.location.reload();
        return;
      }
      current = payload.version;
    } catch (_) {
      status.textContent = '● AGUARDANDO SYNC';
      status.classList.add('offline');
    } finally { pending = false; }
  }
  check();
  setInterval(check, 10000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) check(); });
})();
