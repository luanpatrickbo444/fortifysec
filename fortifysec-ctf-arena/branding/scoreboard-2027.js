/* FortifySec 2027: enhances the native CTFd scoreboard without changing scores. */
(() => {
  if (location.pathname.replace(/\/$/, '') !== '/scoreboard') return;
  document.body.classList.add('fs27-scoreboard');
  const text = el => (el?.textContent || '').trim().replace(/\s+/g, ' ');
  const escape = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let scheduled = false, last = '';
  function render() {
    scheduled = false;
    const main = document.querySelector('main') || document.body;
    const tables = [...main.querySelectorAll('table')].filter(t => !t.closest('.fs27-dashboard'));
    const table = tables.find(t => t.querySelector('tbody')) || null;
    const rows = table ? [...table.querySelectorAll('tbody tr')].filter(r => r.querySelectorAll('td').length >= 2) : [];
    const data = rows.map(r => {
      const cells = [...r.querySelectorAll('td')];
      const nameCell = cells.length >= 3 ? cells[1] : cells[0];
      const scoreCell = cells[cells.length - 1];
      const link = nameCell.querySelector('a[href]');
      return {name: text(link || nameCell), score: text(scoreCell), href: link?.getAttribute('href') || ''};
    }).filter(x => x.name);
    const signature = JSON.stringify(data);
    if (last === signature && document.querySelector('.fs27-dashboard')) return;
    last = signature;
    document.querySelector('.fs27-dashboard')?.remove();
    const dash = document.createElement('section');
    dash.className = 'fs27-dashboard';
    dash.setAttribute('aria-label', 'Painel de classificação FortifySec');
    const firstScore = data[0]?.score || '—';
    dash.innerHTML = `
      <div class="fs27-eyebrow">FORTIFYSEC // CTF ARENA 2027</div>
      <h2 class="fs27-title">HALL DA FAMA</h2>
      <p class="fs27-description">A classificação oficial da arena. Resolva desafios, conquiste pontos e leve sua equipe ao topo.</p>
      <div class="fs27-stats">
        <div class="fs27-stat"><span class="fs27-stat-label">Classificados</span><div class="fs27-stat-value">${data.length}</div></div>
        <div class="fs27-stat"><span class="fs27-stat-label">Líder atual</span><div class="fs27-stat-value">${escape(data[0]?.name || 'Aguardando')}</div></div>
        <div class="fs27-stat"><span class="fs27-stat-label">Maior pontuação</span><div class="fs27-stat-value">${escape(firstScore)} PTS</div></div>
      </div>
      <div class="fs27-prizes"><span>🥇 1º · R$ 3.000</span><span>🥈 2º · R$ 1.500</span><span>🥉 3º · R$ 500</span></div>`;
    if (!data.length) {
      const empty = document.createElement('div');
      empty.className = 'fs27-empty';
      empty.innerHTML = '<div class="fs27-empty-icon">🏆</div><h3>A disputa está prestes a começar</h3><p>Ainda não há participantes com pontuação na classificação. Seja o primeiro a resolver um desafio e conquistar seu lugar no ranking.</p><a class="fs27-action" href="/challenges">Explorar desafios</a>';
      dash.append(empty);
    } else {
      const heading = document.createElement('h3'); heading.className = 'fs27-section-title'; heading.textContent = 'Pódio da arena'; dash.append(heading);
      const podium = document.createElement('div'); podium.className = 'fs27-podium';
      data.slice(0,3).forEach((p,i) => {
        const card = document.createElement('article'); card.className = 'fs27-podium-card' + (i === 0 ? ' fs27-first' : '');
        const medal = document.createElement('span'); medal.className = 'fs27-medal'; medal.textContent = ['🥇','🥈','🥉'][i];
        const place = document.createElement('div'); place.className = 'fs27-place'; place.textContent = `${i+1}º lugar`;
        const name = document.createElement('div'); name.className = 'fs27-name';
        if (p.href && /^\/(?!\/)/.test(p.href)) {const a=document.createElement('a');a.href=p.href;a.textContent=p.name;name.append(a)} else name.textContent=p.name;
        const score = document.createElement('div'); score.className='fs27-score'; score.textContent=p.score;
        const unit=document.createElement('small');unit.textContent='PTS';score.append(unit);
        card.append(medal,place,name,score);podium.append(card);
      });
      dash.append(podium);
      const label = document.createElement('h3');label.className='fs27-section-title';label.textContent='Classificação geral';dash.append(label);
    }
    const target = table || main.querySelector('.jumbotron')?.nextElementSibling || main.firstElementChild;
    if (target?.parentNode) target.parentNode.insertBefore(dash, target);
    else main.prepend(dash);
    // Hide only the original empty-state text, without touching data or the table.
    [...main.querySelectorAll('h2,h3,h4,p,div')].filter(e => e.children.length === 0 && /^Scoreboard is empty$/i.test(text(e))).forEach(e => {e.style.display = 'none';});
  }
  function schedule(){if(scheduled)return;scheduled=true;setTimeout(render,180)}
  const observer=new MutationObserver(ms=>{if(ms.some(m=>!m.target.closest?.('.fs27-dashboard')))schedule()});
  observer.observe(document.body,{subtree:true,childList:true,characterData:true});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule);else schedule();
})();
