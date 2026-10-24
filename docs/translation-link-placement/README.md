# Where to put the "Read this article in" translation link

Status: **proposal, no site code changed.** Mockup: `mockup.html?v=old|a|b|c[&t=dark]`
(static approximation of the site tokens/fonts; screenshots next to it).

## Problem

`layouts/partials/i18n-list.html` renders an `<h2>` + `<ul>` between the share
buttons and `.article-content` (`layouts/posts/single.html:80`). Issues:

- It sits in the reading column, so it reads like article content and pushes the
  text down.
- An `<h2>` before the article body adds a bogus heading to the document outline
  and screen-reader heading navigation (it comes after the `<h1>` but is not part of
  the article).
- The label is in the *current* language, but the person who needs the link is
  the one who cannot comfortably read it.
- The link text is the whole translated title, which wraps to 3+ lines at 500px.
- Related, independent defect: the header `PT | EN` switcher on a post links to the
  other locale's **home page**, not the translated article (`navbar.html` lines
  30–35, and the navbar is `partialCached` per language, so it cannot know the page).

Constraint: `bin/check-bilingual.py` requires an `<a>` to the other-language URL on
every rendered article page, plus reciprocal `hreflang` alternates (these stay
untouched). All three variants satisfy it.

| | Before | A | B | C |
|---|---|---|---|---|
| Desktop | `old-desktop.png` | `a-desktop.png` | `b-desktop.png` | `c-desktop.png` |
| 500px | `old-mobile.png` | `a-mobile.png` | `b-mobile.png` (+`-dark`) | `c-mobile.png` (+`-dark`) |

## Variant A — Make the existing header switcher translation-aware (remove the box)

No new UI: on translated posts the header `PT | EN` item for the other language
links to the translated article (fallback: locale home, as today).

- Change: `navbar.html` takes the page context; replace `partialCached ... .Site.Language.Lang`
  with a per-page call (or cache key `.Translations`/`.RelPermalink`); delete
  `i18n-list.html` call and the `translations` i18n key. Add `hreflang`/`lang` on the link.
- Pros: zero extra pixels, zero reading-flow impact, fixes the "switch dumps me on home"
  defect everywhere, consistent with where users already look for language.
- Cons: least discoverable for someone who landed on the wrong language (`PT` is a small
  grey control, and at 500px it is only two letters); no title preview; navbar loses
  per-language caching (a small build-time cost, 152 pages).
- Effort: small. Risk: low.

## Variant B — Compact language chip in the byline row (recommended)

A pill (same look as the pagination/theme-toggle track: 1px `--color-ink-soft` border,
fully rounded, `--color-canvas` fill) with a globe icon and the label **in the target
language** — "Ler em Português" / "Read in English" — right-aligned on the author row on
desktop, wrapping to its own line under the byline at ≤500px.

- Change: replace `i18n-list.html` with a chip partial rendered inside the article
  `<header>`; label from new i18n keys (`readIn` per language) rendered with
  `lang="pt"`/`hreflang="pt"`; full translated title goes into `title` (and
  `aria-label="Ler em Português: <title>"` — the visible text is a prefix of the
  accessible name, which is what WCAG 2.5.3 requires); no heading element; loops over
  `.Translations` so a third language works. Byline layout is float-based
  (`float-left`), so this needs a small flex wrapper in `single.html` + `article.scss`.
- Pros: visible without scrolling on every viewport, outside the text column and outline,
  one short line instead of a 3-line title, target-language label is understood by
  the one who needs it, reuses the existing pill language, ≥32px tall (WCAG 2.2 target
  size minimum is 24px; can be raised to 44px like pagination).
- Cons: touches the byline layout; adds a decorative icon (inline SVG, no request);
  slightly more noticeable than A.
- Effort: small–medium. Risk: low (check-bilingual and e2e translation navigation tests
  keep passing since the link stays an `<a>` to the other URL; the e2e selector for the old
  box needs updating).

## Variant C — Slim "also available in" bar under the header, outside `<article>`

A full-width strip below the navbar (`<nav aria-label="Translations">`, subtle
`--color-surface` background, bottom border): globe + "Also available in" + `Português:
<translated title>` (single line, `text-overflow: ellipsis`).

- Change: render from `single.html` between navbar and `<article>`; new i18n key for the
  lead-in; same `lang`/`hreflang`.
- Pros: unmistakably *not* part of the article, most discoverable (first thing under
  the header, wording explains itself), shows the translated title so the user knows it
  is the same article, scales to several languages.
- Cons: adds a persistent full-width strip to every translated article (76 of 76), a
  second horizontal line next to the header border, moves content down ~38px
  (the current box moves it ~110px+ at 500px), truncated title at 500px; lead-in is in the
  *current* language unless it is also localised per target.
- Effort: small. Risk: low.

Rejected: end-of-article "also available in" card (nobody who landed in the wrong
language scrolls 9 minutes to find it); floating/sticky button (covers content, needs
JS or fights the fixed 500px layout); automatic redirect by `Accept-Language`
(breaks shared links and crawlers).

## Recommendation

**B**, optionally shipped together with **A**: B gives the discoverable, target-language
entry point; A separately fixes the header switcher so that it stops sending readers to
the home page. If you want zero new UI, A alone. C if you prefer a visible banner over a
chip in the byline.

## Next step

Pick a variant; implementation = new partial + `single.html` + `article.scss` + i18n keys,
update the e2e selector for the old `Read this article in` heading, run `check-artifact.sh`
(bilingual gate), `lint`, `validate:html`, `e2e`, and regenerate visual snapshots locally.
