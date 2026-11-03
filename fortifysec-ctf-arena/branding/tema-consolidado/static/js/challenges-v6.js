/* FortifySec V6: non-destructive visual labels, native CTFd handlers retained. */
(() => {
  'use strict';
  if (!/^\/challenges\/?$/.test(location.pathname)) return;
  document.body.classList.add('fortify-challenges');
  const categories = [
    [/cript|crypto/i, ['🔐', 'Criptografia']],
    [/osint/i, ['🔎', 'OSINT']],
    [/foren|forensic/i, ['🧪', 'Forense']],
    [/revers/i, ['🧩', 'Engenharia reversa']],
    [/pwn|binary exploit/i, ['⚡', 'Pwn']],
    [/web/i, ['🌐', 'Web']],
    [/rede|network/i, ['📡', 'Redes']],
    [/misc/i, ['🛠️', 'Misc']],
  ];
  function categoryOf(card) {
    const section = card.closest('[data-category], .category-challenges, .challenge-category, section');
    const explicit = section?.getAttribute('data-category');
    if (explicit) return explicit;
    let node = card.parentElement;
    for (let i = 0; node && i < 5; i++, node = node.parentElement) {
      const heading = node.querySelector(':scope > h2, :scope > h3, :scope > h4, :scope > .category-header, :scope > .category-name');
      if (heading) return heading.textContent.trim();
    }
    let prev = card.closest('.row, .col, .category-challenges')?.previousElementSibling;
    if (prev?.matches('h2,h3,h4')) return prev.textContent.trim();
    const headings = [...document.querySelectorAll('h2,h3,h4')].filter(h => h.getBoundingClientRect().top < card.getBoundingClientRect().top);
    return headings.length ? headings[headings.length - 1].textContent.trim() : 'CTF';
  }
  function enhance() {
    document.querySelectorAll('.challenge-button').forEach(card => {
      if (card.querySelector('.fortify-card-top')) return;
      const category = categoryOf(card);
      const [symbol, name] = categories.find(([re]) => re.test(category))?.[1] || ['🏴', category || 'CTF'];
      const top = document.createElement('span');
      top.className = 'fortify-card-top';
      const icon = document.createElement('span'); icon.className = 'fortify-card-icon'; icon.textContent = symbol; icon.setAttribute('aria-hidden', 'true');
      const label = document.createElement('span'); label.className = 'fortify-card-category'; label.textContent = name;
      top.append(icon, label);
      card.prepend(top);
    });
  }
  enhance();
  let scheduled = false;
  new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {scheduled = false; enhance();});
  }).observe(document.body, {childList:true, subtree:true});
})();
