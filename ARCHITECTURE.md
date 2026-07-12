# ARCHITECTURE.md — Kaapi (App-1)

A **static marketing website** (plain HTML + CSS, zero build step) for a fictional specialty-coffee roaster.
Served by **GitHub Pages** straight from `main` (under `/App-1/`). There is no server, no framework, no
bundler — the files in the repo root *are* the deployed site. Optimise for simplicity; do not add tooling.

## Codemap
- **Pages (repo root)** — each is a complete, standalone HTML document:
  - `index.html` — landing (hero + sections)
  - `beans.html` — single-origin beans grid
  - `brewing.html` — brewing guide
  - `story.html` — brand story + testimonials
  - `contact.html` — contact page
  - `locations.html` — cafe locations grid
- **`styles.css`** — the single source of visual truth: design tokens (colour/type/spacing) + reusable
  component classes (`.nav-links`, `.footer-nav`, `.btn`, `.card`, `.section`, `.grid`, `.loc-card`).
- **`.octo/DESIGN_SYSTEM.md`** — the durable design language (palette, fonts, component rules). The prose
  companion to `styles.css`.
- **`e2e/`** — the Playwright test suite, one spec per page. `playwright.config.js` starts a static file
  server (`python3 -m http.server 8080`) so the suite is self-contained.
- **`README.md`** — human overview + UI conventions. `LICENSE` — MIT.

## Page anatomy (every page follows this)
1. `<head>` — links `styles.css`, sets the page `<title>`.
2. **Header nav** — `<header>…<nav class="nav-links">` with links to every page (+ a hero/section below).
3. Page content — built from `styles.css` component classes.
4. **Footer** — `<nav class="footer-nav">` repeating the page links.

## Invariants & boundaries (the must-nots)
- **No build step, ever.** Do not introduce React/Vue, a bundler, TypeScript, or a package that requires
  compilation. It's static files served as-is.
- **The nav is duplicated, not shared.** Header + footer nav are copy-pasted into each page. Adding/removing
  a page means editing the nav block on **all** pages, matching the existing markup exactly.
- **All styling goes through `styles.css` + `.octo/DESIGN_SYSTEM.md`.** No inline design systems, no
  invented palettes, no emoji/raster icons (inline SVG only).
- **Tests are the gate.** `npx playwright test` (never `npm test`). Every page has a matching
  `e2e/<page>.spec.js`; a PR must be green with a demo video before review.
- **Relative asset paths only** (the site lives under `/App-1/` on Pages).

## Change recipes
- *Add a page* → create `<page>.html` from an existing page's skeleton → add its nav link to **all** pages
  (header + footer) → write `e2e/<page>.spec.js` → `npx playwright test` green → PR.
- *Add a component/section* → add the markup using existing `styles.css` classes; add new classes to
  `styles.css` only if none fit → extend the relevant page's spec.
