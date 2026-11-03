/* Progressive enhancement: never replaces CTFd challenge markup or click handlers. */
(() => {
  'use strict';
  const board = document.querySelector('#challenges-board, .challenges-board');
  if (!board) return;
  function enhance() {
    board.querySelectorAll('.challenge-button').forEach(card => {
      if (card.querySelector('.fortify-challenge-meta')) return;
      const valueNode = card.querySelector('.challenge-value');
      const valueText = valueNode ? valueNode.textContent : '';
      const value = Number((valueText || '').replace(/[^0-9]/g, ''));
      const name = (card.querySelector('.challenge-name')?.textContent || '').toLowerCase();
      const explicit = card.getAttribute('data-difficulty') || '';
      const hint = (explicit + ' ' + name).toLowerCase();
      let level = /\b(hard|dificil|difícil|expert)\b/.test(hint) ? 'hard' : /\b(medium|medio|médio|intermediario|intermediário)\b/.test(hint) ? 'medium' : /\b(easy|facil|fácil|beginner|iniciante)\b/.test(hint) ? 'easy' : '';
      // Points are a heuristic, not an authoritative difficulty field.
      if (!level && Number.isFinite(value) && value > 0) level = value <= 150 ? 'easy' : value <= 350 ? 'medium' : 'hard';
      const solved = card.classList.contains('solved-challenge') || card.classList.contains('fortify-solved') || card.getAttribute('data-solved') === 'true';
      const meta = document.createElement('span'); meta.className = 'fortify-challenge-meta';
      if (level) {
        const tag = document.createElement('span'); tag.className='fortify-challenge-pill'; tag.dataset.level=level;
        tag.textContent = ({easy:'Iniciante',medium:'Intermediário',hard:'Avançado'})[level] + (explicit || /\b(hard|dificil|difícil|expert|medium|medio|médio|intermediario|intermediário|easy|facil|fácil|beginner|iniciante)\b/.test(name) ? '' : ' · estimado');
        meta.appendChild(tag);
      }
      if (solved) { const tag=document.createElement('span');tag.className='fortify-challenge-pill';tag.dataset.level='solved';tag.textContent='✓ Resolvido';meta.appendChild(tag); }
      if (meta.childNodes.length) card.appendChild(meta);
    });
  }
  enhance();
  const observer = new MutationObserver(() => { observer.disconnect(); enhance(); observer.observe(board, {childList:true,subtree:true}); });
  observer.observe(board, {childList:true,subtree:true});
})();
