/* FortifySec CTF Arena 2027 - Traducoes da interface */
(function () {
  "use strict";

  const translations = {
    "Search for matching teams": "Pesquisar equipes...",
    "Search for matching users": "Pesquisar competidores...",
    "Search for matching usernames": "Pesquisar competidores...",
    "Team": "Equipe",
    "Teams": "Equipes",
    "User": "Competidor",
    "Users": "Competidores",
    "Website": "Site",
    "Affiliation": "Instituição",
    "Country": "País",
    "Name": "Nome",
    "Submit": "Enviar",
    "Search": "Pesquisar",
    "No results found": "Nenhum resultado encontrado"
  };

  function translate() {
    if (!["/users", "/teams"].includes(location.pathname)) return;

    document.querySelectorAll("input[placeholder]").forEach(input => {
      const original = input.getAttribute("placeholder");
      if (translations[original]) {
        input.setAttribute("placeholder", translations[original]);
      }
    });

    document.querySelectorAll("th, option, button").forEach(el => {
      if (el.children.length) return;
      const original = el.textContent.trim();
      if (translations[original]) {
        el.textContent = translations[original];
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", translate);
  } else {
    translate();
  }

  new MutationObserver(translate).observe(document.documentElement, {
    childList: true,
    subtree: true
  });
})();
