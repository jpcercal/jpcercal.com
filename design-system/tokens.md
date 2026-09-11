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
| icon credits | `#ddd` | footer credit line |

Derived grays come from `color.adjust($fontColor, …)` in `assets/scss/`
(e.g. author meta at 50% lightness, locale switcher borders at 60%).

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
