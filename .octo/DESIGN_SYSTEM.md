# Kaapi — Design System

Warm, editorial, premium specialty-coffee brand. **All generated UI must build to this** (tokens live in
`styles.css`). Reuse the classes below; add new component styles in `styles.css` in the same style.

## Brand
- **Name:** Kaapi (South-Indian filter-coffee spelling). Logo = the wordmark in Fraunces + a small gold dot.
- **Voice:** warm, confident, artisanal. Short editorial lines, not marketing hype.

## Color (CSS vars in :root)
| Token | Hex | Use |
|---|---|---|
| `--cream` | `#f7f1e6` | page background |
| `--paper` | `#fffdf8` | cards / surfaces |
| `--espresso` | `#2b1e15` | primary text, dark buttons |
| `--coffee` | `#6b4a34` | secondary brown, links |
| `--crema` | `#e7d6bb` | soft tan fills / pills |
| `--gold` | `#c1873b` | **primary accent** (eyebrows, dots, hovers) |
| `--terracotta` | `#b5502f` | secondary accent (sparingly) |
| `--muted` | `#8a7868` | muted text |
| `--line` | `#e8ddc9` | borders |

## Typography
- **Display / headings / brand:** `Fraunces` (serif), weights 500–600. Tight leading, `-0.01em` tracking.
- **Body / UI:** `Inter` (sans). Body 16px/1.6.
- **Eyebrow:** Inter 12px, 700, uppercase, `.16em` tracking, in `--gold` (class `.eyebrow`).
- Scale: h1 `clamp(38–68px)`, h2 `clamp(26–40px)`, h3 20px.

## Shape & space
- Radius: `--r-sm` 8px, `--r` 12px, `--r-lg` 18px; pills use `999px`.
- Spacing: 8px scale. Section padding 80px vertical. Container `--maxw` 1120px (`.wrap`).
- Shadow: soft warm — `--shadow`.

## Components (classes in styles.css)
- **Nav:** `.nav` (sticky, blurred cream) + `.brand` (wordmark + gold `.dot`) + `.nav-links`.
- **Buttons:** `.btn` + `.btn-primary` (espresso fill) / `.btn-ghost` (outline). Pill-shaped.
- **Cards:** `.card` (paper, soft border + shadow, radius-lg). `.pill` for tags.
- **Sections:** `.section` (80px pad), `.wrap` container, `.grid` + `.g3` (3-up, stacks on mobile).
- **Utilities:** `.center`, `.muted`, `.eyebrow`.

## Rules
- Reuse tokens/classes; never hard-code off-palette colors or introduce a new font.
- Icons = inline SVG, ~1.7px stroke, monochrome `currentColor`. **Never emoji or raster/stock images.**
- Always design responsive (mobile stacks); keep generous whitespace and clear hierarchy.
