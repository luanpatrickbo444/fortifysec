/* FortifySec Arena 2.0 — non-invasive enhancements to CTFd public theme. */
(() => {
  'use strict';
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  const isAdmin = path === '/admin' || path.startsWith('/admin/');
  if (isAdmin) return;
  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const link = (label, href, cls) => {
    const a = el('a', cls, label);
    a.href = href;
    return a;
  };
  const appendText = (parent, tag, className, value) => parent.appendChild(el(tag, className, value));
  function insertHome() {
    const main = document.querySelector('main .container, main.container, main, .container');
    if (!main || document.querySelector('.fs-hero')) return;
    const hero = el('section', 'fs-hero');
    appendText(hero, 'div', 'fs-kicker', 'FORTIFYSEC // CAPTURE THE FLAG');
    const h = el('h1');
    h.appendChild(document.createTextNode('CTF '));
    h.appendChild(el('span', '', 'ARENA 2026'));
    hero.appendChild(h);
    appendText(hero, 'p', '', 'Explore desafios reais de segurança cibernética, encontre flags e dispute o topo do ranking. Participe individualmente ou em equipe.');
    const actions = el('div', 'fs-actions');
    actions.appendChild(link('Explorar desafios', '/challenges', 'fs-button fs-button-primary'));
    actions.appendChild(link('Ver ranking', '/scoreboard', 'fs-button fs-button-secondary'));
    actions.appendChild(link('Criar conta', '/register', 'fs-button fs-button-secondary'));
    hero.appendChild(actions);
    const prizes = el('div', 'fs-prizes');
    [['1º lugar','R$ 3.000'],['2º lugar','R$ 1.500'],['3º lugar','R$ 500']].forEach(([place, amount]) => {
      const box = el('div', 'fs-prize');
      appendText(box, 'span', '', place);
      appendText(box, 'strong', '', amount);
      prizes.appendChild(box);
    });
    const heading = el('h2', 'fs-section-title', 'Acesse a arena');
    const quick = el('div', 'fs-quicklinks');
    [['Desafios','/challenges','Criptografia, Web, OSINT, Forense e mais'],['Classificação','/scoreboard','Acompanhe as equipes e pontuações'],['Minha equipe','/team','Gerencie sua participação']].forEach(([name, href, detail]) => {
      const a = link(name, href, 'fs-quicklink');
      appendText(a, 'small', '', detail);
      quick.appendChild(a);
    });
    main.prepend(quick);
    main.prepend(heading);
    main.prepend(prizes);
    main.prepend(hero);
  }
  function podium() {
    // Only read existing public scoreboard rows; never fabricate scores.
    const table = document.querySelector('table');
    if (!table || document.querySelector('.fs-podium')) return;
    const rows = [...table.querySelectorAll('tbody tr')].filter(row => row.querySelectorAll('td').length >= 2).slice(0, 3);
    if (!rows.length) return;
    const grid = el('section', 'fs-podium');
    grid.setAttribute('aria-label', 'Destaques do ranking');
    rows.forEach((row, i) => {
      const cells = [...row.querySelectorAll('td')];
      const card = el('div', 'fs-podium-item');
      appendText(card, 'div', 'fs-podium-rank', `${i + 1}º LUGAR`);
      appendText(card, 'div', 'fs-podium-name', (cells[1] || cells[0]).textContent.trim());
      appendText(card, 'div', 'fs-podium-score', cells[cells.length - 1].textContent.trim());
      grid.appendChild(card);
    });
    table.parentElement.insertBefore(grid, table);
  }
  function init() {
    if (path === '/') insertHome();
    if (path === '/scoreboard') podium();
    if (path === '/login' || path === '/register') document.body.classList.add('fs-auth');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();
