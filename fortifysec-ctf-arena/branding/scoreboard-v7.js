/* FortifySec Ranking V7. Reads the scoreboard rendered by CTFd; never alters scoring. */
(() => {
  if (window.location.pathname.replace(/\/$/, '') !== '/scoreboard') return;
  document.body.classList.add('fs-ranking-v7');
  const medals = ['🥇', '🥈', '🥉'];
  const places = ['1º lugar', '2º lugar', '3º lugar'];
  let lastSignature = '';
  let scheduled = false;
  const plain = (node) => (node?.textContent || '').trim().replace(/\s+/g, ' ');
  function findTable() {
    const candidates = Array.from(document.querySelectorAll('table'));
    return candidates.find(t => t.querySelector('tbody tr td') &&
      (t.closest('#scoreboard') || t.id.toLowerCase().includes('score') ||
       t.closest('.container') || t.closest('main'))) || null;
  }
  function getRows(table) {
    return Array.from(table.querySelectorAll('tbody tr')).filter(tr =>
      tr.querySelectorAll('td').length >= 2 && plain(tr).length > 0);
  }
  function render() {
    scheduled = false;
    const table = findTable();
    if (!table) return;
    const rows = getRows(table);
    if (!rows.length) return;
    const signature = rows.slice(0, 3).map(r => plain(r)).join('|');
    if (signature === lastSignature && document.querySelector('#fs-rank-v7')) return;
    lastSignature = signature;
    document.querySelector('#fs-rank-v7')?.remove();
    const wrap = document.createElement('section');
    wrap.id = 'fs-rank-v7';
    wrap.className = 'fs-rank-wrap';
    wrap.setAttribute('aria-label', 'Pódio FortifySec');
    const intro = document.createElement('div');
    intro.className = 'fs-rank-intro';
    intro.innerHTML = '<div class="fs-rank-eyebrow">FORTIFYSEC // CTF ARENA 2026</div><h2 class="fs-rank-title">HALL DA FAMA</h2><p class="fs-rank-sub">Classificação baseada na pontuação exibida pelo CTFd.</p>';
    wrap.appendChild(intro);
    const podium = document.createElement('div');
    podium.className = 'fs-podium';
    // The displayed table is already sorted by the native CTFd scoreboard.
    rows.slice(0, 3).forEach((row, i) => {
      const cells = Array.from(row.querySelectorAll('td'));
      // CTFd normally renders rank | player/team | score.
      const nameCell = cells.length >= 3 ? cells[1] : cells[0];
      const scoreCell = cells[cells.length - 1];
      const card = document.createElement('article');
      card.className = 'fs-podium-card' + (i === 0 ? ' fs-first' : '');
      const medal = document.createElement('span'); medal.className = 'fs-medal'; medal.textContent = medals[i];
      const place = document.createElement('div'); place.className = 'fs-place'; place.textContent = places[i];
      const player = document.createElement('div'); player.className = 'fs-player';
      const anchor = nameCell.querySelector('a[href]');
      if (anchor) {
        const link = document.createElement('a');
        link.href = anchor.getAttribute('href');
        link.textContent = plain(anchor);
        player.appendChild(link);
      } else player.textContent = plain(nameCell) || 'Competidor';
      const score = document.createElement('div'); score.className = 'fs-score';
      score.appendChild(document.createTextNode(plain(scoreCell) || '0'));
      const unit = document.createElement('small'); unit.textContent = 'PTS'; score.appendChild(unit);
      card.append(medal, place, player, score); podium.appendChild(card);
    });
    wrap.appendChild(podium);
    table.parentNode.insertBefore(wrap, table);
  }
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    window.setTimeout(render, 120);
  }
  const observer = new MutationObserver((mutations) => {
    if (mutations.some(m => !m.target.closest?.('#fs-rank-v7'))) schedule();
  });
  observer.observe(document.body, {childList:true, subtree:true, characterData:true});
  schedule();
})();
