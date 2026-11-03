(function () {
  "use strict";

  const dictionary = {
    "Users": "Competidores",
    "Teams": "Equipes",
    "Scoreboard": "Ranking",
    "Challenges": "Desafios",
    "Notifications": "Notificações",
    "Team": "Minha equipe",
    "Profile": "Perfil",
    "Settings": "Configurações",
    "Admin Panel": "Administração",
    "Admin": "Administração",
    "Logout": "Sair",
    "Login": "Entrar",
    "Register": "Criar conta",
    "Join Team": "Entrar em uma equipe",
    "Create Team": "Criar equipe",
    "Welcome to FortifySec CTF Arena 2027!":
      "Bem-vindo à FortifySec CTF Arena 2027!",
    "In order to participate you must either join or create a team.":
      "Para participar da competição, entre em uma equipe existente ou crie a sua.",
    "Search for matching teams": "Pesquisar equipes...",
    "Search for matching users": "Pesquisar competidores...",
    "Search for matching usernames": "Pesquisar competidores...",
    "Website": "Site",
    "Affiliation": "Instituição",
    "Country": "País",
    "Name": "Nome",
    "Submit": "Enviar",
    "Cancel": "Cancelar",
    "Save": "Salvar",
    "Password": "Senha",
    "Confirm Password": "Confirmar senha",
    "Email": "E-mail"
  };

  function translateText(root) {
    const selectors = [
      "nav a", "nav button",
      "main h1", "main h2", "main h3",
      "main p", "main a.btn", "main button",
      "main label", "main th", "main option"
    ].join(",");

    root.querySelectorAll(selectors).forEach(el => {
      if (el.children.length > 0) return;

      const current = el.textContent.trim();
      const translated = dictionary[current];

      if (translated && current !== translated) {
        el.textContent = translated;
      }
    });

    root.querySelectorAll("input[placeholder]").forEach(el => {
      const current = el.getAttribute("placeholder");
      if (dictionary[current]) {
        el.setAttribute("placeholder", dictionary[current]);
      }
    });
  }

  function customizeTeamPage() {
    if (location.pathname !== "/team") return;

    document.body.classList.add("fs-v10-team");

    const main = document.querySelector("main");
    if (!main) return;

    if (!main.querySelector(".fs-v10-team-hero")) {
      const hero = document.createElement("section");
      hero.className = "fs-v10-team-hero";

      hero.innerHTML = `
        <div class="fs-v10-eyebrow">
          FORTIFYSEC / CTF ARENA 2027
        </div>
        <h1>Construa sua equipe.</h1>
        <p>
          Una talentos, compartilhe conhecimentos e prepare-se
          para enfrentar os desafios da arena.
          Cada equipe poderá reunir até 4 participantes.
        </p>
      `;

      main.prepend(hero);
    }
  }

  function initialize() {
    translateText(document);
    customizeTeamPage();

    const observer = new MutationObserver(() => {
      translateText(document);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
  } else {
    initialize();
  }
})();
