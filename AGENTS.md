# AGENTS.md — Kaapi (App-1)

Static marketing site for **Kaapi**, a fictional specialty-coffee roaster. Plain **HTML + CSS, no build
step**, deployed on **GitHub Pages** from `main` (served under `/App-1/`). This file is the lean map read
into every agent's context — deeper detail lives in `ARCHITECTURE.md` and `.octo/DESIGN_SYSTEM.md`, pull them
on demand.

## Commands (use these EXACTLY)
- **Test (the gate): `npx playwright test`** — the e2e suite is self-contained (its `webServer` serves the
  site on :8080). ⚠️ **Do NOT run `npm test`** — the `package.json` `test` script is a broken stub
  (`echo "Error: no test specified" && exit 1`).
- First run in a fresh clone: `npm i -D @playwright/test && npx playwright install chromium`.
- No build, no lint, no bundler. Open the HTML files directly or via the Playwright `webServer`.

## Where things live
- `index.html` — landing page. `beans.html` · `brewing.html` · `story.html` · `contact.html` ·
  `locations.html` — one self-contained page each (no templating/includes).
- `styles.css` — the design system: CSS tokens + reusable classes (`.nav-links`, `.btn`, `.card`,
  `.section`, `.grid`, `.loc-card`, `.footer-nav`). Add new component styles here, in the same style.
- `.octo/DESIGN_SYSTEM.md` — the durable design reference (warm editorial palette cream/espresso/gold,
  **Fraunces** display + **Inter** body). Build all UI to these tokens.
- `e2e/` — Playwright specs, **one per page** (`beans.spec.js`, `locations.spec.js`, …). Each `goto`s
  `http://localhost:8080/<page>.html` and asserts on page-specific classes.
- `playwright.config.js` — testDir `./e2e`, `webServer` = `python3 -m http.server 8080`, video on.

## Must-knows (read before editing)
1. **The header + footer nav is hand-duplicated on EVERY page** (`<nav class="nav-links">` / `.footer-nav`).
   There is no shared include. **Adding a page ⇒ add its link to the nav in all pages** — and match the exact
   existing markup so the edit lands (this is the #1 source of "edit failed / nav link missing" failures).
2. **Every new page needs its own `e2e/<page>.spec.js`** following the existing shape, and must pass
   `npx playwright test` before you open a PR. Never ship red.
3. **Reuse `styles.css` tokens + classes**; never invent a look. Icons = inline SVG, thin stroke —
   never emoji or raster.
4. Keep pages static + single-file; relative asset paths (Pages serves under `/App-1/`).

See `ARCHITECTURE.md` for the codemap, invariants, and page anatomy.
