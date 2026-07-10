# Kaapi — small-batch specialty coffee

Marketing site for **Kaapi**, a fictional specialty-coffee roaster: single-origin beans from the
hills of Chikmagalur (South India), roasted in small batches and shipped fresh.

## What this is
A **static website** (plain HTML + CSS, no build step) deployed on **GitHub Pages** — it serves
`index.html` from the repo root and redeploys automatically on every push to `main`.

- **Live site:** https://mayank-7851.github.io/App-1/
- **Design system:** `styles.css` (tokens) + [`.octo/DESIGN_SYSTEM.md`](.octo/DESIGN_SYSTEM.md) — warm
  editorial palette (cream / espresso / gold), Fraunces (serif display) + Inter (body). **Build all UI
  to these tokens** so the site stays consistent.

## Structure
- `index.html` — the landing page (nav + hero scaffolded; other sections added via tickets).
- `styles.css` — the design system + reusable classes (`.nav`, `.btn`, `.card`, `.section`, `.grid` …).
- `.octo/DESIGN_SYSTEM.md` — the durable design-system reference.

## Conventions for new UI
- Reuse the CSS tokens and utility classes in `styles.css`; add new component styles there in the same style.
- Keep it a single static page unless a ticket says otherwise; use relative asset paths (project Pages
  serves under `/App-1/`).
- Icons: inline SVG, thin stroke — never emoji or raster images.
