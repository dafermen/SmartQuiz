import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const rootDir = path.resolve(process.cwd());
const outputDir = path.join(rootDir, "public", "docs");
const assetDir = path.join(outputDir, "assets");
const sourceImageDir = path.join(rootDir, "docs", "images");
const outputImageDir = path.join(outputDir, "images");

const docs = [
  { section: "Producto", title: "Inicio", source: "README.md", slug: "index" },
  { section: "Producto", title: "Guia de usuario", source: "docs/USER_GUIDE.md", slug: "user-guide" },
  { section: "Producto", title: "Solucion de problemas", source: "docs/TROUBLESHOOTING.md", slug: "troubleshooting" },
  { section: "Calidad", title: "Guia QA", source: "docs/QA_GUIDE.md", slug: "qa-guide" },
  { section: "Arquitectura", title: "Arquitectura", source: "docs/ARCHITECTURE.md", slug: "architecture" },
  { section: "Arquitectura", title: "Mapa de codigo", source: "docs/CODE_MAP.md", slug: "code-map" },
  { section: "Arquitectura", title: "API local", source: "docs/API.md", slug: "api" },
  { section: "Desarrollo", title: "Desarrollo", source: "docs/DEVELOPMENT.md", slug: "development" },
  { section: "Desarrollo", title: "Guia junior", source: "docs/JUNIOR_DEVELOPER_GUIDE.md", slug: "junior-developer-guide" },
  { section: "Desarrollo", title: "Pruebas", source: "docs/TESTING.md", slug: "testing" },
  { section: "Entrega", title: "Despliegue", source: "docs/DEPLOYMENT.md", slug: "deployment" },
  { section: "Entrega", title: "Flujo GitHub", source: "docs/GITHUB_WORKFLOW.md", slug: "github-workflow" },
  { section: "Entrega", title: "Operaciones", source: "docs/OPERATIONS.md", slug: "operations" },
  { section: "Gobierno", title: "Estado actual", source: "CURRENT_STATUS.md", slug: "current-status" },
  { section: "Gobierno", title: "Historial", source: "CHANGELOG.md", slug: "changelog" },
  { section: "Gobierno", title: "Contribuir", source: "CONTRIBUTING.md", slug: "contributing" },
  { section: "Gobierno", title: "Seguridad", source: "docs/SECURITY.md", slug: "security" },
  { section: "Gobierno", title: "Agentes Codex", source: "AGENTS.md", slug: "agents" },
  { section: "Gobierno", title: "Licencias de terceros", source: "THIRD_PARTY_LICENSES.md", slug: "third-party-licenses" },
  { section: "Decisiones", title: "ADR 0001", source: "docs/adr/0001-local-first-smartquiz.md", slug: "adr-0001-local-first-smartquiz" },
  { section: "Decisiones", title: "ADR 0002", source: "docs/adr/0002-optional-cloud-sync.md", slug: "adr-0002-optional-cloud-sync" }
];

const sourceToSlug = new Map(docs.map((doc) => [normalizePath(doc.source).toLowerCase(), doc.slug]));
const baseNameToSlug = new Map(docs.map((doc) => [path.basename(doc.source).toLowerCase(), doc.slug]));

function normalizePath(value) {
  return value.replaceAll("\\", "/").replace(/^\.\//, "");
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80) || "section";
}

function pageHref(slug) {
  return slug === "index" ? "./" : `./${slug}.html`;
}

function normalizeLink(href) {
  if (!href || href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("#")) {
    return href;
  }

  const [target, hash = ""] = href.split("#");
  const normalized = decodeURIComponent(normalizePath(target));
  const directSlug = sourceToSlug.get(normalized.toLowerCase()) || baseNameToSlug.get(path.basename(normalized).toLowerCase());

  if (directSlug) {
    return `${pageHref(directSlug)}${hash ? `#${slugify(hash)}` : ""}`;
  }

  return href;
}

function normalizeImageLink(href) {
  const normalized = normalizePath(href);

  if (normalized.startsWith("docs/images/")) {
    return `./images/${normalized.slice("docs/images/".length)}`;
  }

  if (normalized.startsWith("images/")) {
    return `./${normalized}`;
  }

  return href;
}

function renderInline(value) {
  let html = escapeHtml(value);

  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_match, label, href) => {
    const normalizedHref = normalizeImageLink(href.trim());
    return `<img class="doc-image" src="${escapeHtml(normalizedHref)}" alt="${label}" loading="lazy" decoding="async" />`;
  });
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label, href) => {
    const normalizedHref = normalizeLink(href.trim());
    const external = /^https?:\/\//.test(normalizedHref) ? ' target="_blank" rel="noreferrer"' : "";
    return `<a href="${escapeHtml(normalizedHref)}"${external}>${label}</a>`;
  });

  return html;
}

function isTableDivider(line) {
  return /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line);
}

function splitTableRow(line) {
  return line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim());
}

function renderMarkdown(markdown) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const html = [];
  const toc = [];
  let paragraph = [];
  let listType = null;
  let inCode = false;
  let codeLines = [];

  const flushParagraph = () => {
    if (paragraph.length) {
      html.push(`<p>${renderInline(paragraph.join(" "))}</p>`);
      paragraph = [];
    }
  };

  const closeList = () => {
    if (listType) {
      html.push(`</${listType}>`);
      listType = null;
    }
  };

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];

    if (line.trim().startsWith("```")) {
      if (inCode) {
        html.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
        inCode = false;
        codeLines = [];
      } else {
        flushParagraph();
        closeList();
        inCode = true;
      }
      continue;
    }

    if (inCode) {
      codeLines.push(line);
      continue;
    }

    if (!line.trim()) {
      flushParagraph();
      closeList();
      continue;
    }

    const heading = /^(#{1,4})\s+(.+)$/.exec(line);
    if (heading) {
      flushParagraph();
      closeList();
      const level = heading[1].length;
      const text = heading[2].replace(/#+\s*$/, "").trim();
      const id = slugify(text);
      if (level <= 3) {
        toc.push({ id, text, level });
      }
      html.push(`<h${level} id="${id}">${renderInline(text)}</h${level}>`);
      continue;
    }

    if (line.includes("|") && lines[index + 1] && isTableDivider(lines[index + 1])) {
      flushParagraph();
      closeList();
      const headers = splitTableRow(line);
      index += 2;
      const rows = [];
      while (index < lines.length && lines[index].includes("|")) {
        rows.push(splitTableRow(lines[index]));
        index += 1;
      }
      index -= 1;
      html.push("<div class=\"table-wrap\"><table><thead><tr>");
      html.push(headers.map((cell) => `<th>${renderInline(cell)}</th>`).join(""));
      html.push("</tr></thead><tbody>");
      for (const row of rows) {
        html.push("<tr>");
        html.push(row.map((cell) => `<td>${renderInline(cell)}</td>`).join(""));
        html.push("</tr>");
      }
      html.push("</tbody></table></div>");
      continue;
    }

    const unordered = /^\s*[-*]\s+(.+)$/.exec(line);
    const ordered = /^\s*\d+\.\s+(.+)$/.exec(line);
    if (unordered || ordered) {
      flushParagraph();
      const nextType = unordered ? "ul" : "ol";
      if (listType !== nextType) {
        closeList();
        listType = nextType;
        html.push(`<${listType}>`);
      }
      html.push(`<li>${renderInline((unordered || ordered)[1])}</li>`);
      continue;
    }

    if (/^>\s+/.test(line)) {
      flushParagraph();
      closeList();
      html.push(`<blockquote>${renderInline(line.replace(/^>\s+/, ""))}</blockquote>`);
      continue;
    }

    paragraph.push(line.trim());
  }

  flushParagraph();
  closeList();

  if (inCode) {
    html.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
  }

  return { body: html.join("\n"), toc };
}

function groupDocs() {
  const sections = [];
  for (const doc of docs) {
    let section = sections.find((item) => item.name === doc.section);
    if (!section) {
      section = { name: doc.section, docs: [] };
      sections.push(section);
    }
    section.docs.push(doc);
  }
  return sections;
}

function renderSidebar(activeSlug) {
  return groupDocs().map((section) => `
    <section class="docs-sidebar-section">
      <h2>${escapeHtml(section.name)}</h2>
      <ul>
        ${section.docs.map((doc) => `<li><a class="${doc.slug === activeSlug ? "active" : ""}" href="${pageHref(doc.slug)}">${escapeHtml(doc.title)}</a></li>`).join("")}
      </ul>
    </section>`).join("\n");
}

function renderToc(toc) {
  if (!toc.length) {
    return '<p class="empty-toc">Sin secciones internas.</p>';
  }

  return `<ol>${toc.map((item) => `<li class="toc-level-${item.level}"><a href="#${item.id}">${escapeHtml(item.text)}</a></li>`).join("")}</ol>`;
}

function renderPage(doc, rendered, index, searchIndex) {
  const previous = docs[index - 1];
  const next = docs[index + 1];
  const title = `${doc.title} | SmartQuiz Docs`;
  const searchData = JSON.stringify(searchIndex).replace(/</g, "\\u003c");

  return `<!doctype html>
<html lang="es" data-theme="light">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="Documentacion navegable de SmartQuiz." />
  <link rel="stylesheet" href="./assets/docs.css" />
  <script>window.SMARTQUIZ_DOCS_INDEX = ${searchData};</script>
  <script defer src="./assets/docs.js"></script>
</head>
<body>
  <a class="skip-link" href="#contenido">Saltar al contenido</a>
  <header class="docs-topbar">
    <a class="brand" href="./" aria-label="SmartQuiz Docs">
      <span class="brand-mark">SQ</span>
      <span><strong>SmartQuiz</strong><small>Documentacion</small></span>
    </a>
    <nav aria-label="Navegacion superior">
      <a href="./">Documentacion</a>
      <a href="./user-guide.html">Producto</a>
      <a href="./architecture.html">Arquitectura</a>
      <a href="./current-status.html">Estado</a>
    </nav>
    <div class="top-actions">
      <label class="search-label" for="docs-search">Buscar</label>
      <input id="docs-search" type="search" placeholder="Buscar docs" autocomplete="off" />
      <button id="theme-toggle" type="button" aria-label="Cambiar tema">Tema</button>
      <a class="back-app" href="/">Volver a la app</a>
    </div>
  </header>

  <div class="docs-shell">
    <aside class="docs-sidebar" id="docs-sidebar" aria-label="Documentos">
      <a class="mobile-back" href="/">Volver a la aplicacion</a>
${renderSidebar(doc.slug)}
    </aside>

    <main id="contenido" class="docs-main" tabindex="-1">
      <button class="sidebar-toggle" type="button" aria-controls="docs-sidebar" aria-expanded="false">Menu de docs</button>
      <div id="search-results" class="search-results" hidden></div>
      <p class="eyebrow">${escapeHtml(doc.section)}</p>
      <article class="markdown-body">
        ${rendered.body}
      </article>
      <nav class="pager" aria-label="Paginas cercanas">
        ${previous ? `<a href="${pageHref(previous.slug)}"><span>Anterior</span>${escapeHtml(previous.title)}</a>` : '<span></span>'}
        ${next ? `<a href="${pageHref(next.slug)}"><span>Siguiente</span>${escapeHtml(next.title)}</a>` : '<span></span>'}
      </nav>
    </main>

    <aside class="docs-toc" aria-label="En esta pagina">
      <a class="desktop-back" href="/">Volver a la aplicacion</a>
      <h2>En esta pagina</h2>
      ${renderToc(rendered.toc)}
    </aside>
  </div>
</body>
</html>`;
}

const css = `:root {
  --sq-primary: #0f9f8f;
  --sq-secondary: #162033;
  --sq-accent: #f4b84a;
  --sq-bg: #f5f7fb;
  --sq-surface: #ffffff;
  --sq-text: #162033;
  --sq-muted: #64748b;
  --sq-border: #d9e0ea;
  --sq-code: #102032;
  color-scheme: light;
}

html[data-theme="dark"] {
  --sq-bg: #101827;
  --sq-surface: #162033;
  --sq-text: #eef4f8;
  --sq-muted: #aebdca;
  --sq-border: #2c3b52;
  --sq-code: #0a111f;
  color-scheme: dark;
}

* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  background: var(--sq-bg);
  color: var(--sq-text);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  line-height: 1.65;
}
a { color: var(--sq-primary); text-decoration-thickness: 2px; text-underline-offset: 3px; }
a:focus-visible, button:focus-visible, input:focus-visible { outline: 3px solid var(--sq-accent); outline-offset: 3px; }
.skip-link { position: fixed; left: 1rem; top: -5rem; z-index: 100; background: var(--sq-secondary); color: white; padding: .75rem 1rem; border-radius: .5rem; }
.skip-link:focus { top: 1rem; }
.docs-topbar {
  position: sticky; top: 0; z-index: 40; min-height: 72px; display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 1rem;
  padding: .8rem clamp(1rem, 2vw, 2rem); border-bottom: 1px solid var(--sq-border); background: color-mix(in srgb, var(--sq-surface) 92%, transparent); backdrop-filter: blur(14px);
}
.brand { display: inline-flex; align-items: center; gap: .75rem; color: var(--sq-text); text-decoration: none; min-height: 44px; }
.brand-mark { display: inline-grid; place-items: center; width: 44px; height: 44px; border-radius: .5rem; background: var(--sq-secondary); color: var(--sq-accent); font-weight: 800; }
.brand small { display: block; color: var(--sq-muted); font-size: .78rem; }
.docs-topbar nav { display: flex; gap: .35rem; justify-content: center; flex-wrap: wrap; }
.docs-topbar nav a, .top-actions a, .top-actions button, .sidebar-toggle, .mobile-back, .desktop-back {
  min-height: 44px; display: inline-flex; align-items: center; justify-content: center; border-radius: .5rem; border: 1px solid var(--sq-border); padding: .55rem .8rem; background: var(--sq-surface); color: var(--sq-text); text-decoration: none; font-weight: 700; font-size: .92rem;
}
.docs-topbar nav a:hover, .top-actions a:hover, .top-actions button:hover, .sidebar-toggle:hover, .mobile-back:hover, .desktop-back:hover { border-color: var(--sq-primary); }
.top-actions { display: flex; align-items: center; gap: .5rem; }
.search-label { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0, 0, 0, 0); }
#docs-search { min-height: 44px; width: min(20vw, 220px); border: 1px solid var(--sq-border); border-radius: .5rem; background: var(--sq-surface); color: var(--sq-text); padding: .55rem .75rem; }
.back-app { background: var(--sq-secondary) !important; color: white !important; border-color: var(--sq-secondary) !important; }
.docs-shell { display: grid; grid-template-columns: minmax(220px, 280px) minmax(0, 1fr) minmax(190px, 240px); gap: clamp(1rem, 2.2vw, 2rem); max-width: 1440px; margin: 0 auto; padding: 1.5rem clamp(1rem, 2vw, 2rem) 3rem; }
.docs-sidebar, .docs-toc { position: sticky; top: 96px; align-self: start; max-height: calc(100vh - 112px); overflow: auto; }
.docs-sidebar-section { margin-bottom: 1.15rem; }
.docs-sidebar h2, .docs-toc h2 { margin: 0 0 .4rem; color: var(--sq-muted); font-size: .78rem; letter-spacing: .08em; text-transform: uppercase; }
.docs-sidebar ul, .docs-toc ol { list-style: none; padding: 0; margin: 0; }
.docs-sidebar a, .docs-toc a { display: block; padding: .45rem .6rem; border-radius: .45rem; color: var(--sq-text); text-decoration: none; font-size: .94rem; }
.docs-sidebar a.active { background: var(--sq-primary); color: white; font-weight: 800; }
.docs-toc { font-size: .92rem; }
.toc-level-3 { padding-left: .85rem; }
.toc-level-4 { padding-left: 1.4rem; }
.desktop-back { width: 100%; margin-bottom: 1rem; }
.mobile-back { display: none; margin-bottom: 1rem; }
.docs-main { min-width: 0; }
.sidebar-toggle { display: none; margin-bottom: 1rem; }
.eyebrow { margin: 0 0 .35rem; color: var(--sq-primary); font-size: .82rem; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }
.markdown-body { background: var(--sq-surface); border: 1px solid var(--sq-border); border-radius: .5rem; padding: clamp(1.2rem, 3vw, 2.4rem); box-shadow: 0 18px 45px rgba(22, 32, 51, .07); }
.markdown-body h1 { margin-top: 0; font-size: clamp(2rem, 4vw, 3.1rem); line-height: 1.1; }
.markdown-body h2 { margin-top: 2rem; padding-top: .5rem; border-top: 1px solid var(--sq-border); font-size: 1.45rem; }
.markdown-body h3 { margin-top: 1.5rem; font-size: 1.12rem; }
.markdown-body p, .markdown-body li { color: color-mix(in srgb, var(--sq-text) 86%, var(--sq-muted)); }
.markdown-body code { background: color-mix(in srgb, var(--sq-primary) 12%, transparent); border-radius: .35rem; padding: .12rem .32rem; font-size: .92em; }
.markdown-body pre { overflow: auto; background: var(--sq-code); color: #f8fafc; border-radius: .5rem; padding: 1rem; }
.markdown-body pre code { background: transparent; color: inherit; padding: 0; }
.markdown-body p:has(> .doc-image) { margin: 1.25rem 0 1.75rem; }
.doc-image { display: block; width: 100%; height: auto; border: 1px solid var(--sq-border); border-radius: .5rem; background: var(--sq-bg); box-shadow: 0 14px 34px rgba(22, 32, 51, .12); }
blockquote { border-left: 4px solid var(--sq-accent); margin: 1.2rem 0; padding: .2rem 1rem; color: var(--sq-muted); background: color-mix(in srgb, var(--sq-accent) 12%, transparent); }
.table-wrap { overflow-x: auto; margin: 1rem 0; border: 1px solid var(--sq-border); border-radius: .5rem; }
table { width: 100%; border-collapse: collapse; min-width: 620px; }
th, td { padding: .65rem .75rem; border-bottom: 1px solid var(--sq-border); text-align: left; vertical-align: top; }
th { background: color-mix(in srgb, var(--sq-primary) 12%, transparent); }
.search-results { border: 1px solid var(--sq-border); background: var(--sq-surface); border-radius: .5rem; padding: .75rem; margin-bottom: 1rem; }
.search-results a { display: block; padding: .6rem; border-radius: .45rem; text-decoration: none; color: var(--sq-text); }
.search-results a:hover { background: color-mix(in srgb, var(--sq-primary) 10%, transparent); }
.search-results small { display: block; color: var(--sq-muted); }
.pager { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem; }
.pager a { min-height: 72px; border: 1px solid var(--sq-border); border-radius: .5rem; background: var(--sq-surface); padding: .8rem; color: var(--sq-text); text-decoration: none; font-weight: 800; }
.pager a:last-child { text-align: right; }
.pager span { display: block; color: var(--sq-muted); font-size: .8rem; font-weight: 700; }
@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } *, *::before, *::after { transition: none !important; } }
@media (max-width: 980px) {
  .docs-topbar { grid-template-columns: 1fr; align-items: stretch; }
  .docs-topbar nav { justify-content: flex-start; overflow-x: auto; padding-bottom: .2rem; }
  .top-actions { flex-wrap: wrap; }
  #docs-search { width: min(100%, 360px); flex: 1 1 180px; }
  .docs-shell { grid-template-columns: 1fr; }
  .docs-sidebar { position: fixed; inset: 0 auto 0 0; width: min(86vw, 320px); max-height: none; padding: 1rem; background: var(--sq-surface); border-right: 1px solid var(--sq-border); transform: translateX(-105%); transition: transform .2s ease; z-index: 60; }
  body.sidebar-open .docs-sidebar { transform: translateX(0); }
  .docs-toc { position: static; max-height: none; }
  .desktop-back { display: none; }
  .mobile-back { display: flex; }
  .sidebar-toggle { display: inline-flex; }
}
@media (max-width: 640px) {
  .docs-topbar { position: static; }
  .markdown-body { padding: 1rem; }
  .markdown-body h1 { font-size: 2rem; }
  .pager { grid-template-columns: 1fr; }
}`;

const js = `(() => {
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
})();`;

fs.mkdirSync(assetDir, { recursive: true });
if (fs.existsSync(sourceImageDir)) {
  fs.cpSync(sourceImageDir, outputImageDir, { recursive: true });
}

const renderedDocs = docs.map((doc) => {
  const sourcePath = path.join(rootDir, doc.source);
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Missing documentation source: ${doc.source}`);
  }
  const markdown = fs.readFileSync(sourcePath, "utf8");
  const rendered = renderMarkdown(markdown);
  return { doc, markdown, rendered };
});

const searchIndex = renderedDocs.map(({ doc, markdown }) => ({
  title: doc.title,
  section: doc.section,
  href: pageHref(doc.slug),
  text: markdown.replace(/```[\s\S]*?```/g, " ").replace(/[#>*`\-[\]()|]/g, " ").replace(/\s+/g, " ").trim().slice(0, 1200)
}));

renderedDocs.forEach(({ doc, rendered }, index) => {
  const filename = doc.slug === "index" ? "index.html" : `${doc.slug}.html`;
  fs.writeFileSync(path.join(outputDir, filename), renderPage(doc, rendered, index, searchIndex));
});

fs.writeFileSync(path.join(assetDir, "docs.css"), css);
fs.writeFileSync(path.join(assetDir, "docs.js"), js);

const generatedImageCount = fs.existsSync(sourceImageDir)
  ? fs.readdirSync(sourceImageDir).filter((filename) => filename.toLowerCase().endsWith(".png")).length
  : 0;
const generatedFiles = renderedDocs.length + 2 + generatedImageCount;
console.log(`SmartQuiz documentation site generated in public/docs (${generatedFiles} files).`);


