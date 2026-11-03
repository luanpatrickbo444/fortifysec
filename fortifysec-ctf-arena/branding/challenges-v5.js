/* Progressive enhancement. Never replaces CTFd click handlers. */
(() => {
  'use strict';
  if (!/^\/challenges\/?$/.test(location.pathname)) return;
  document.body.classList.add('fortify-challenges');
  function enhance() {
    document.querySelectorAll('.challenge-button').forEach(card => {
      if (card.querySelector('.fortify-meta')) return;
      const raw = card.querySelector('.challenge-value')?.textContent || '';
      const points = parseInt(raw.replace(/[^\d]/g, ''), 10);
      const solved = card.classList.contains('solved-challenge') || card.classList.contains('fortify-solved') || card.getAttribute('data-solved') === 'true';
      const meta = document.createElement('span'); meta.className = 'fortify-meta';
      if (Number.isFinite(points)) {
        const difficulty = points <= 150 ? 'easy' : points <= 350 ? 'medium' : 'hard';
        const pill = document.createElement('span'); pill.className = 'fortify-pill ' + difficulty;
        pill.textContent = ({easy:'Iniciante',medium:'Intermediário',hard:'Avançado'})[difficulty] + ' · estimado';
        meta.appendChild(pill);
      }
      if (solved) { const pill = document.createElement('span'); pill.className = 'fortify-pill solved'; pill.textContent = '✓ Resolvido'; meta.appendChild(pill); }
      if (meta.childNodes.length) card.appendChild(meta);
    });
  }
  enhance();
  let scheduled = false;
  const observer = new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => { scheduled = false; enhance(); });
  });
  observer.observe(document.body, {childList:true,subtree:true});
})();
