(function () {
  "use strict";

  if (window.location.pathname !== "/teams") return;

  function initialize() {
    const main = document.querySelector("main");
    if (!main || document.querySelector(".fs-teams-premium")) return;

    const title = Array.from(document.querySelectorAll("h1"))
      .find(el => /^(Equipes|Teams)$/i.test(el.textContent.trim()));

    if (!title) return;

    const hero = document.createElement("section");
    hero.className = "fs-teams-premium";

    hero.innerHTML = `
      <div class="fs-teams-eyebrow">FORTIFYSEC / CTF ARENA 2027</div>
      <h2 class="fs-teams-heading">Equipes da <span>Arena.</span></h2>
      <p class="fs-teams-description">
        Conheça os times que fazem parte da competição.
        Explore os participantes e acompanhe a comunidade
        de talentos em segurança cibernética.
      </p>

      <div class="fs-teams-stats">
        <div class="fs-teams-stat">
          <div class="fs-teams-stat-label">Equipes exibidas</div>
          <div class="fs-teams-stat-value" id="fs-teams-visible">0</div>
        </div>

        <div class="fs-teams-stat">
          <div class="fs-teams-stat-label">Equipes na listagem</div>
          <div class="fs-teams-stat-value" id="fs-teams-total">0</div>
        </div>

        <div class="fs-teams-stat">
          <div class="fs-teams-stat-label">Competição</div>
          <div class="fs-teams-stat-value" style="font-size:20px">2027</div>
        </div>
      </div>
    `;

    const headingContainer = title.closest(".jumbotron");
    if (headingContainer) {
      headingContainer.style.display = "none";
    } else {
      title.style.display = "none";
    }

    const target = main.querySelector(".container");
    if (target) {
      target.parentNode.insertBefore(hero, target);
    } else {
      main.prepend(hero);
    }

    const table = main.querySelector("table");

    if (!table) return;

    const section = document.createElement("div");
    section.className = "fs-teams-section";

    const sectionTitle = document.createElement("h3");
    sectionTitle.className = "fs-teams-section-title";
    sectionTitle.textContent = "Diretório de equipes";

    const subtitle = document.createElement("p");
    subtitle.className = "fs-teams-section-subtitle";
    subtitle.textContent = "Pesquise e descubra as equipes participantes.";

    const container = table.closest(".container");

    if (container) {
      container.classList.add("fs-teams-premium-container");
      container.style.maxWidth = "1160px";

      container.insertBefore(section, container.firstChild);
      section.appendChild(sectionTitle);
      section.appendChild(subtitle);

      while (section.nextSibling) {
        section.appendChild(section.nextSibling);
      }
    }

    const empty = document.createElement("div");
    empty.className = "fs-teams-empty";
    empty.hidden = true;
    empty.innerHTML = `
      <div class="fs-teams-empty-icon">◇</div>
      <h3>Nenhuma equipe exibida</h3>
      <p>A listagem ainda não apresenta equipes. Verifique os filtros e a configuração do CTFd.</p>
    `;

    table.parentNode.appendChild(empty);

    let lastState = "";

    function update() {
      const rows = Array.from(table.querySelectorAll("tbody tr"))
        .filter(row => row.querySelector("td"));

      const count = rows.length;

      const visible = rows.filter(row => {
        const style = getComputedStyle(row);
        return style.display !== "none" && style.visibility !== "hidden";
      }).length;

      const state = count + ":" + visible;
      if (state === lastState) return;
      lastState = state;

      document.getElementById("fs-teams-visible").textContent = visible;
      document.getElementById("fs-teams-total").textContent = count;

      empty.hidden = count !== 0;
    }

    const observer = new MutationObserver(update);
    observer.observe(table, {childList:true, subtree:true});

    update();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
  } else {
    initialize();
  }
})();
