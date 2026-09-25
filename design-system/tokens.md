---
title: Tokens
description: Color, typography and spacing tokens used across jpcercal.com.
draft: true
sitemap:
  disable: true
---

## Colors

| Token | Value | Usage |
|---|---|---|
| `$fontColor` | `rgba(0, 0, 0, 0.84)` | body text, headings, brand |
| `$colorGreen` | `#5CB85C` | success notifications, send button |
| `$colorRed` | `#D9534F` | error notifications |
| `$syntax-bg` | `#282c34` | code block background (One Dark) |
| `$syntax-edge` | `#191f2b` | code block border |

Derived grays come from `color.adjust($fontColor, …)` in `assets/scss/`
(e.g. author meta at 50% lightness, locale switcher borders at 60%).

## Dark theme

Dark mode is Medium Dark Mode Pro style (near-black warm canvas,
off-white ink) and changes **only** the color contract — layout, type and
spacing are identical. Tokens live in `assets/scss/themes.scss` as CSS
custom properties (`--color-*`); every module consumes `var(--…)` and
never raw colors (code blocks stay One Dark in both themes).

| Token | Light | Dark | Usage |
|---|---|---|---|
| `--color-canvas` | `#ffffff` | `#191919` | `body` background |
| `--color-surface` | `#ffffff` | `#242424` | search input fill, table head |
| `--color-ink` | `rgba(0,0,0,.84)` | `rgba(255,255,255,.92)` | body, brand, titles |
| `--color-ink-soft` | `+20% lightness` | `rgba(255,255,255,.68)` | blockquote text, counters |
| `--color-muted` | `+50% lightness` | `rgba(255,255,255,.60)` | author meta, dates, tags |
| `--color-faint` | `+60% lightness` | `rgba(255,255,255,.45)` | brand `</>`, locale borders |
| `--color-border` | `#eee` | `#2e2e2e` | header rule, cards, inputs |
| `--color-code-bg` / `--color-code-fg` | `#f8f9fa` / `#bd4147` | `#2a2a2a` / `#e8a0a7` | inline `<code>` only |
| `--color-credit` | `#ddd` | `rgba(255,255,255,.40)` | footer credit line |

Activation: `data-theme` on `<html>` (stored `localStorage` choice, else
OS `prefers-color-scheme`, else light). An inline script in
`layouts/partials/head-assets.html` resolves it before CSS paints (no
flash); `assets/js/theme.js` wires the header toggle (`themeToggle`
i18n key), persists the choice and follows OS changes until one is
stored. No-JS visitors get the OS theme via a `prefers-color-scheme`
fallback; print always renders light.

## Post cover colors and PNG references

Post covers are standalone SVG assets, so their colors are set in each file
rather than read from CSS variables. Keep the light `index.svg` and dark
`index.dark.svg` shapes identical. The light circle uses `#f8f9fa` (the
site's light code surface), and the dark circle uses `#242424`
(`--color-surface` in dark mode). Adapt the icon colors to each surface while
keeping the reference recognizable and legible against the site's white and
near-black reading canvases.

For a supplied PNG reference, use [PNGToSVG](https://github.com/mayuso/PNGToSVG)
to make a vector starting point (`pngtosvg image.png`). `pngtosvg` is expected
to be installed on the system. If it is unavailable, tell the user how to
install it with `cargo install pngtosvg --version 0.6.2 --locked`; never
install it yourself. Inspect its SVG at 512 px and the card's 60 px size.
Isolate the useful subject, remove unwanted whitespace and text, and simplify
traced pixel edges before putting it into the cover pair.

## Typography

| Token | Value | Usage |
|---|---|---|
| body | `PT Serif 400, 16px, 1.2em` | article and UI text |
| headings | `Fjalla One` | `h1` 28px → `h6` 18px (`font-size-h1…h6` utilities match) |
| condensed | `Barlow Condensed 400/500` | author names, meta, search info |
| mono | `Fira Mono 400/500/700` | code fences and inline code |

Fonts load from Google Fonts with `display=swap` + `preconnect`
(see `layouts/partials/head-assets.html`).

## Spacing

Layout grid is Tailwind v4 with Bootstrap 5 breakpoints
(`sm 576px`, `md 768px`, `lg 992px`) plus an exact-value grid-compat layer
in `assets/css/vendor.css` (`.row`, `.col*`, `.offset-*`).

Content rhythm follows Bootstrap reboot parity inside `.article-content`:
paragraphs, lists, quotes and code blocks get `1rem` bottom margin,
headings `0.5rem` (see `assets/scss/article.scss`).
