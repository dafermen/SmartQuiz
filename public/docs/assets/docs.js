(() => {
  const root = document.documentElement;
  const savedTheme = localStorage.getItem("smartquiz_docs_theme") || "light";
  root.dataset.theme = savedTheme;

  const themeToggle = document.getElementById("theme-toggle");
  themeToggle?.addEventListener("click", () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    localStorage.setItem("smartquiz_docs_theme", next);
  });

  const sidebarButton = document.querySelector(".sidebar-toggle");
  sidebarButton?.addEventListener("click", () => {
    const open = document.body.classList.toggle("sidebar-open");
    sidebarButton.setAttribute("aria-expanded", String(open));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      document.body.classList.remove("sidebar-open");
      sidebarButton?.setAttribute("aria-expanded", "false");
    }
  });

  const search = document.getElementById("docs-search");
  const results = document.getElementById("search-results");
  const index = window.SMARTQUIZ_DOCS_INDEX || [];

  search?.addEventListener("input", () => {
    const query = search.value.trim().toLowerCase();
    if (!query) {
      results.hidden = true;
      results.innerHTML = "";
      return;
    }

    const matches = index
      .map((item) => ({ ...item, score: (item.title + " " + item.section + " " + item.text).toLowerCase().includes(query) ? 1 : 0 }))
      .filter((item) => item.score > 0)
      .slice(0, 8);

    results.hidden = false;
    results.innerHTML = matches.length
      ? matches.map((item) => '<a href="' + item.href + '"><strong>' + item.title + '</strong><small>' + item.section + '</small></a>').join("")
      : '<p>No hay resultados para esta busqueda.</p>';
  });
})();