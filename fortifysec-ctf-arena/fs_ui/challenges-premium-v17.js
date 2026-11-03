/* FortifySec Challenges V17 — progressive enhancement, native CTFd behavior preserved */
(function () {
  'use strict';
  if (location.pathname.replace(/\/$/, '') !== '/challenges') return;
  function init() {
    if (document.querySelector('.fs17-shell')) return;
    document.body.classList.add('fs-challenges-v17');
    var board = document.querySelector('#challenges-board');
    if (!board) return;
    var hero = document.createElement('section');
    hero.className = 'fs17-shell';
    hero.innerHTML = '<div class="fs17-hero"><div class="fs17-kicker">◆ FORTIFYSEC CTF ARENA 2027</div><h1>DESAFIOS<span style="color:#ff3157">.</span></h1><p>EXPLORE · RESOLVA · CONQUISTE</p></div>' +
      '<div class="fs17-stats"><div class="fs17-stat"><span class="fs17-stat-icon">⚑</span><div><strong id="fs17-total">0</strong><small>Desafios disponíveis</small></div></div><div class="fs17-stat"><span class="fs17-stat-icon">◈</span><div><strong id="fs17-categories">0</strong><small>Categorias</small></div></div><div class="fs17-stat"><span class="fs17-stat-icon">✦</span><div><strong id="fs17-points">0</strong><small>Pontos disponíveis</small></div></div></div>' +
      '<div class="fs17-toolbar"><input id="fs17-search" aria-label="Buscar desafios" placeholder="⌕  Buscar desafio pelo nome..."><select id="fs17-category" aria-label="Filtrar categoria"><option value="">Todas as categorias</option></select><select id="fs17-sort" aria-label="Ordenar desafios"><option value="default">Ordem original</option><option value="points-up">Menor pontuação</option><option value="points-down">Maior pontuação</option><option value="name">Nome A–Z</option></select></div>';
    board.parentNode.insertBefore(hero, board);
    /* Hide only the original page hero, not the native challenge board. */
    var jumbo = document.querySelector('.jumbotron');
    if (jumbo && !jumbo.contains(board)) jumbo.style.display = 'none';
    var search = document.getElementById('fs17-search');
    var category = document.getElementById('fs17-category');
    var sort = document.getElementById('fs17-sort');
    var original = new WeakMap();
    function getCategory(btn) {
      var node = btn.closest('.row');
      var prev = node;
      while (prev) {
        var heading = prev.querySelector && prev.querySelector('.category-header');
        if (heading) return heading.textContent.trim();
        prev = prev.previousElementSibling;
      }
      var block = btn.closest('[data-category]');
      return block ? block.getAttribute('data-category') : '';
    }
    function update() {
      var buttons = Array.from(board.querySelectorAll('.challenge-button'));
      var cats = new Set();
      var total = 0;
      buttons.forEach(function (b, i) {
        if (!original.has(b)) original.set(b, i);
        var c = getCategory(b);
        if (c) cats.add(c);
        var val = b.querySelector('.challenge-value');
        var pts = val ? parseInt(val.textContent.replace(/[^\d]/g, ''), 10) || 0 : 0;
        total += pts;
        b.dataset.fsIcon = /crypto|criptografia/i.test(c) ? '🔐' : /web/i.test(c) ? '🌐' : /forensic|forense/i.test(c) ? '🔎' : /network|rede/i.test(c) ? '📡' : /reverse|reversa/i.test(c) ? '⚙️' : /pwn|exploit/i.test(c) ? '🛡️' : /osint/i.test(c) ? '🧭' : '⚑';
      });
      document.getElementById('fs17-total').textContent = buttons.length.toLocaleString('pt-BR');
      document.getElementById('fs17-categories').textContent = cats.size.toLocaleString('pt-BR');
      document.getElementById('fs17-points').textContent = total.toLocaleString('pt-BR');
      var selected = category.value;
      category.innerHTML = '<option value="">Todas as categorias</option>';
      Array.from(cats).sort().forEach(function (c) { var o = document.createElement('option'); o.value = c; o.textContent = c; category.appendChild(o); });
      category.value = selected;
      var term = search.value.toLocaleLowerCase('pt-BR').trim();
      buttons.forEach(function (b) {
        var c = getCategory(b);
        var matches = (!term || b.textContent.toLocaleLowerCase('pt-BR').includes(term)) && (!category.value || c === category.value);
        var cell = b.closest('[class*="col-"]') || b;
        cell.classList.toggle('fs17-card-hidden', !matches);
      });
      var mode = sort.value;
      if (mode !== 'default') {
        var rows = new Set(buttons.map(function (b) { return b.closest('.row'); }).filter(Boolean));
        rows.forEach(function (r) {
          var cells = Array.from(r.children).filter(function (el) { return el.querySelector('.challenge-button'); });
          cells.sort(function (a, b) {
            var x = a.querySelector('.challenge-button'); var y = b.querySelector('.challenge-button');
            var xp = parseInt((x.querySelector('.challenge-value') || {}).textContent, 10) || 0;
            var yp = parseInt((y.querySelector('.challenge-value') || {}).textContent, 10) || 0;
            if (mode === 'points-up') return xp - yp;
            if (mode === 'points-down') return yp - xp;
            return (x.querySelector('.challenge-name') || x).textContent.localeCompare((y.querySelector('.challenge-name') || y).textContent, 'pt-BR');
          });
          cells.forEach(function (el) { r.appendChild(el); });
        });
      }
    }
    search.addEventListener('input', update);
    category.addEventListener('change', update);
    sort.addEventListener('change', update);
    var queued = false;
    var observer = new MutationObserver(function (mutations) {
      if (!mutations.some(function (m) { return m.type === 'childList' && (m.addedNodes.length || m.removedNodes.length); })) return;
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () { queued = false; observer.disconnect(); update(); observer.observe(board, {childList:true,subtree:true}); });
    });
    update();
    observer.observe(board, {childList:true,subtree:true});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
