# Accessibility audit — jpcercal.com (top 10 issues)

Target: the live site `https://jpcercal.com` (PT) and `/en/`, which is built from
`origin/main` @ `0de494132`; template/CSS claims below were checked against that
same commit. Standard: WCAG 2.2 AA.
Tools: axe-core 4.x via Playwright (Chromium), DOM/computed-style probes, manual
keyboard tab-through, 320 px viewport, light + dark themes, PT + EN.
Pages: home, post (rich post `revisiting-the-layout-and-the-blog-project`), search
(with a real query), contact, authors, 404.

Raw data: `data/axe-*.json`, `data/audit-b.json`, `data/struct-*.json`.
Screenshots: `evidence/`. Scripts as run: `scripts/*.cjs` (need Playwright and
axe-core's `axe.min.js` next to the scripts' parent dir; `axe.min.js` is not
committed because it is 560 KB of third-party code — take it from `axe-core` on npm).
Reproduce any axe finding: open the page, inject axe, `await axe.run()`.

Ranking = (user impact × how many pages are affected) ÷ fix cost. No automated
tool proves accessibility; items 1, 2, 6, 7, 9 are manual/semantic findings axe only
partly catches. I did **not** test with a real screen reader (VoiceOver/NVDA);
screen-reader statements are derived from the accessibility tree/markup.

## Summary

| # | Issue | Severity | WCAG | Scope |
|---|-------|----------|------|-------|
| 1 | No `<main>` landmark and no skip link | High | 2.4.1, 1.3.1 | every page |
| 2 | Search input has no label; results are silent | High | 1.3.1, 3.3.2, 4.1.2, 4.1.3 | `/search/`, `/en/search/` |
| 3 | Secondary text fails contrast (3.03:1, 2.67:1) | High | 1.4.3 | home, lists, search, header |
| 4 | Links inside post text distinguished by colour only (2.8:1) | High | 1.4.1 | all posts |
| 5 | Language switch: weak semantics, `href="#"`, bare "PT"/"EN" | Medium | 4.1.2, 2.4.4, 3.1.2 | header, every page |
| 6 | Code blocks: line numbers in a layout table, read aloud | Medium | 1.3.1, 1.3.2 | posts with code |
| 7 | Code-block syntax and line-number colours fail contrast | Medium | 1.4.3 | posts with code |
| 8 | Targets under 24 px (brand, category, author, meta links) | Medium | 2.5.8 | home, lists, posts |
| 9 | Redundant image alt text + unannounced new-window links | Medium | 1.1.1, 2.4.4, 3.2.5 (advisory) | cards, share buttons |
| 10 | Heading/landmark structure: 404 levels, unnamed sections, `region` hits | Low–Medium | 1.3.1, 2.4.6 | 404, cards |

What passes (so nobody "fixes" it): `lang` on `<html>` is correct per locale; every
`<img>` has `alt`; the theme toggle has a name, state and live status, and is a real
`<button>`; keyboard order follows visual order; focus is visible on all 12 tabbed
stops checked (`focus-home-tab1-4.png`, `focus-toggle-crop.png`); wide tables scroll in
a labelled, focusable wrapper; `prefers-reduced-motion` is respected; no horizontal
page overflow at 320 px (`post-en-320.png`, `home-en-320.png`); dark theme has no
axe contrast failures outside code blocks.

---

## 1. No `<main>` landmark and no skip link — High

- **Where:** all pages (templates under `layouts/`: `index.html`, `posts/single.html`,
  `search/list.html`, `404.html`, … all wrap content in `<section class="container">`;
  `partials/head.html` + `navbar.html` emit no skip link).
- **Evidence:** axe `landmark-one-main` (1 node, `html`) on all 5 pages and `region`
  (12 nodes on home, 4 on post): `h1`, cards and share buttons live outside any
  landmark (`data/axe-home-en.json`, `data/axe-post-en.json`). `struct-*.json`:
  `skipCandidates` contains only the language links, `hasMain: false`. Repro: load
  `/en/`, press Tab once → focus goes to "Search for"; there are 5 tab stops (search,
  brand, theme toggle, 2 language links, GitHub corner) before the first post
  (`focus-home-tab1..4.png`).
- **Why:** keyboard and screen-reader users cannot jump to the content (rotor /
  "main" shortcut absent) and must tab through the header on every page load.
- **Fix:** wrap each template's content in `<main id="main">` and add, as the first
  child of `<body>` (in `head.html`'s caller or the shared start of each layout):
  ```html
  <a class="skip-link" href="#main">{{ i18n "skipToContent" }}</a>
  ```
  ```scss
  .skip-link { position:absolute; left:-9999px; }
  .skip-link:focus { left:8px; top:8px; z-index:100; background:var(--color-surface);
    color:var(--color-ink); padding:.5rem 1rem; outline:2px solid var(--color-ink); }
  ```
  Add `skipToContent` to `i18n/en.yaml` and `pt.yaml`. Keep `<header>`/`<footer>`
  as they are. Add `tabindex="-1"` to `main` so focus lands there in Safari.
- **Verify:** axe `landmark-one-main` and `region` clear; Tab → Enter on the skip
  link moves focus into main (add an e2e test).

## 2. Search input has no label; results are not announced — High

- **Where:** `layouts/search/list.html` (`<input id="search" … autofocus placeholder=…>`),
  `assets/js/search.js` (replaces `#search-results.innerHTML` silently).
- **Evidence:** `data/audit-b.json` → `search.labels: []`, `search.after.resultsEl:
  "DIV#search-results … role=null live=null"`. Screenshot `search-results.png`: no
  visible label; the instructions are a bullet list above the field, not associated
  to it. Repro: open `/en/search/`, type "layout" — nothing is announced; only the
  placeholder (which disappears on typing) names the field.
- **Why:** an input named only by its placeholder is announced inconsistently and
  has no persistent name; screen-reader users get no feedback that results (or
  "no results") appeared. `autofocus` additionally skips the page title/heading
  for SR users arriving on the page.
- **Fix:**
  ```html
  <form role="search" onsubmit="return false;">
    <label for="search" class="font-size-h6">{{ i18n "searchFor" }}</label>
    <ul id="search-hint" class="search-info">…</ul>
    <input id="search" type="search" aria-describedby="search-hint" autocomplete="off" …>
  </form>
  <div id="search-status" class="sr-only" role="status"></div>
  <div id="search-results" aria-live="off"></div>
  ```
  In `search.js`, after rendering write `"N results"` / `"No results"` (localised via
  `i18n.js`) into `#search-status`. Remove `autofocus` (or keep it only if the
  heading is still read first; prefer removal). Drop the mid-sentence “quotes” around
  the no-results message or keep it as plain text.
- **Verify:** axe `label` passes and the accessibility tree shows the input named
  "Search for"; Playwright asserts `#search-status` text after a query.

## 3. Secondary text fails colour contrast — High

- **Where:** post-card date/word count/reading time/category (`#949494` on `#fff` =
  **3.03:1**), inactive language link (`#9e9e9e` on `#fff` = **2.67:1**), search help
  list (3.03:1). Source: `--color-muted` = `adjust($fontColor, $lightness: 50%)` and
  `--color-locale-idle` = `…55%` in `assets/scss/themes.scss`.
- **Evidence:** axe `color-contrast` serious, 12 nodes on home EN/PT, 41 nodes in the
  dark-theme post scan and search page (`data/axe-home-*.json`,
  `data/audit-b.json`). Visible in `home-en-light.png` (grey "Oct 22, 2026 · 1371
  words", grey "Engineering", grey "Portuguese").
- **Why:** 4.5:1 is required for text this size (16 px regular); low-vision users and
  anyone in sunlight cannot read dates or the language option, and the inactive
  language link is a control.
- **Fix:** darken to ≥4.5:1 on white, e.g. `--color-muted: #595959` (7:1) and
  `--color-locale-idle: #5c5c5c` in light mode; verify the dark variants
  (`rgba(255,255,255,.6)`/`.55` on `#191919` ≈ 6–7:1, already fine). Prefer setting
  hex tokens over `adjust(...)` so the ratio is reviewable. Keep the "idle" language
  differentiated by weight/underline rather than lightness.
- **Verify:** axe `color-contrast` returns 0 on `/`, `/en/`, `/en/search/`; add a
  contrast check to the LHCI/axe step.

## 4. In-text links distinguished by colour only — High

- **Where:** post body links (`assets/scss/article.scss`, `.article-content a`:
  `color: var(--color-link); text-decoration: none; box-shadow: inset 0 -1px 0
  var(--color-link-line)`).
- **Evidence:** axe `link-in-text-block` serious, 12 nodes on the rich post (e.g.
  "Wordpress", "LAMP", "Docker"): link `#0969da` vs surrounding text `#292929` =
  **2.8:1**, need 3:1, and `data/audit-b.json` `post-misc.links` shows
  `td: "none"`. Repro: open the post, hover away — links read as slightly blue text.
- **Why:** users who cannot distinguish hue cannot find the links in a paragraph
  (WCAG 1.4.1). The 1px inset line is a faint background-colour effect, not a
  dependable text decoration.
- **Fix:** restore a real underline: `text-decoration: underline;
  text-decoration-thickness: .08em; text-underline-offset: .18em;` (the faint
  `box-shadow` can stay as hover polish). Alternatively, raise link/text contrast to
  ≥3:1 *and* keep a non-colour cue; underline is simpler and covers dark mode too.
- **Verify:** axe `link-in-text-block` clears; check dark theme.

## 5. Language switch: weak semantics — Medium

- **Where:** `layouts/partials/navbar.html` language list (`<a … aria-current="true"
  href="#">` for the current language; the mobile twin links are bare "PT"/"EN" with
  only a `title`; the whole `<nav aria-label="Language selection">` also contains
  the theme toggle and the status live region).
- **Evidence:** `struct-home-en.json` → `langSwitch`: links with `aria: null`; tab
  order in `data/audit-b.json` shows the active language as a focus stop with
  `href: "#"`. `focus-toggle-crop.png` shows the control.
- **Why:** `aria-current="true"` is valid but `"page"` is the expected value for the
  current-page link; `href="#"` reloads the page top and is an empty-looking link;
  "PT"/"EN" are announced as letters, with the title (not exposed by all SRs) as the
  only expansion; the language nav name misdescribes the theme button.
- **Fix:** current language → `<span aria-current="page">English</span>` (not a
  link); alternate language → `<a href=… hreflang="pt" lang="pt">` with visible text
  "Português" (set `lang` so SRs pronounce it) and, for the short form,
  `aria-label="Português"` + `abbr`/`aria-hidden` split, or use a single link whose
  text is resized with CSS instead of two DOM copies. Move the theme toggle and its
  `role=status` out of the language `<nav>` into a plain `<div>`.
- **Verify:** the accessibility tree lists one language link with a full name;
  `e2e/smoke.spec.js` translation tests still pass.

## 6. Code blocks: line numbers are a layout table and get read aloud — Medium

- **Where:** Hugo Chroma config `config.yaml` (`lineNos: true`,
  `lineNumbersInTable: true`) → every highlighted block is
  `<table class="lntable"><tr><td class="lntd">…<span class="lnt">1</span>…</td><td>
  <pre>…`.
- **Evidence:** `data/audit-b.json` → `post-misc.tables: 1`, `lnt: 13` on the rich post;
  `post-en-320.png`/`post-en-light.png`. A screen reader encounters "table, 1 row, 2
  columns", then the numbers 1…13, then the code.
- **Why:** the numbers are decoration; reading them before the code (and announcing a
  data table that is not data) slows and confuses SR users, and copy/paste includes
  numbers.
- **Fix:** switch to `lineNumbersInTable: false` (inline numbers) and make them
  non-selectable/non-readable via CSS counters (`.ln { user-select:none }` — or
  generate numbers with `counter-increment` on `.line::before`, which most screen
  readers skip), or set `role="presentation"` on the table via a render hook
  (`layouts/_default/_markup/render-codeblock.html`). Give the scrollable `<pre>` an
  accessible name/role (it has `tabindex=0`, `role=null`, `label=null` in
  `post-misc.pre`) e.g. `role="region" aria-label="Code"` — same pattern as
  `render-table.html`.
- **Verify:** accessibility tree no longer reports a table in code blocks.

## 7. Code colours fail contrast — Medium

- **Where:** `assets/scss/syntax-highlight.scss` (Chroma `onedark` verbatim on
  `#252930`).
- **Evidence:** axe `color-contrast` in post scans: line numbers `#55595f` = **2.08:1**,
  string/literal red `#bd4147` = **2.8:1** (`data/axe-post-en.json`,
  `data/audit-b.json` `axe-dark-post`: 4 nodes in dark theme, 12 in light). Axe
  reports it against the `text-shadow` colour; the foreground/background pair
  alone still falls under 4.5:1 for the line numbers.
- **Why:** code is the content on a technical blog; low-vision readers lose strings
  and numbers.
- **Fix:** keep the onedark look but override failing tokens: line numbers
  `#9aa0a6` (≈6.4:1 on `#252930`), `.chroma .s*`/`.l` red → `#e06c75` (≈4.9:1);
  verify each Chroma class used in the site's posts with axe or a contrast script.
- **Verify:** axe on the rich post returns no `color-contrast` nodes.

## 8. Small interactive targets — Medium

- **Where:** header brand link `jpcercal.com` **141×19 px**, post-card category
  `Engineering` **65×19**/96×34, post author link **112×22**
  (`data/audit-b.json` → `post-misc.small`; `tab-home` sizes).
- **Evidence:** measured bounding boxes above; the theme toggle (68×44) and search
  link (122×36) are fine.
- **Why:** WCAG 2.2 SC 2.5.8 requires ≥24×24 CSS px (or 24 px spacing) for
  standalone links; these are hard to hit on touch.
- **Fix:** add `min-height: 24px; display:inline-flex; align-items:center;
  padding-block: .25rem` (and `min-height:44px` on mobile) to `.brand`,
  `.post-card--category`, `.author a`, `.article-share-buttons a`; in-sentence links
  are exempt.
- **Verify:** Playwright asserts bounding boxes ≥24×24 for those selectors.

## 9. Redundant alt text and unannounced new-window links — Medium

- **Where:** `layouts/partials/post-card.html` (cover `<img alt="{{ .Title }}">`
  next to the `<h2><a>{{ .Title }}</a></h2>`); `layouts/posts/single.html` share links
  (`target="_blank"`, `title="Share on …"`, no `rel`, no new-tab notice).
- **Evidence:** `struct-home-en.json` `imgs.total: 21`, `emptyAlt: 0` (every card
  cover has a non-empty alt equal to the title, directly above the same title in
  the `<h2>` link); `post-misc.share`: three links with `target:_blank`, `rel:""`.
  (Not tested with a real screen reader; the duplication follows from the markup.)
- **Why:** duplicated announcements for each of the 10 cards per page; the cover is
  decorative, and the share links change context without warning (3.2.5/ G201,
  advisory) — users are surprised by a new tab, especially on touch/SR.
- **Fix:** cover images → `alt=""` (decorative); share links → add
  `rel="noopener noreferrer"` and append visually hidden text “(opens in a new
  window)” via i18n; keep the `alt="Share on Facebook"` text on the icon as the link
  name.
- **Verify:** SR/AT tree shows one name per card; share link names end with the
  new-window cue.

## 10. Heading and landmark structure — Low–Medium

- **Where:** `layouts/404.html` (`<h1>`, then `<h2>` "Suggestions", then 10
  `post-card`s each with their own `<h2>` — siblings of the label heading rather than
  children), `layouts/partials/post-card.html` (`<article><div class="flex">…
  <header>` repeated 10×), `<section class="container">` without an accessible name,
  `layouts/search/list.html` (`<h1>Search for</h1>` plus no heading for results).
- **Evidence:** `struct-home-en.json` landmark list: 10 repeated `header.flex-col`
  inside articles; 404 heading outline in `404-light.png`; axe `region`.
- **Why:** SR heading navigation shows the 404 suggestions as 11 equal-level h2s;
  nothing says that the 10 posts belong to "Suggestions".
- **Fix:** give the card heading level a parameter (`dict "headingLevel" 3`) on 404
  so cards render `<h3>`; replace `<section class="container">` by `<main
  id="main" class="container">` (ties in with #1); use `<section
  aria-labelledby="…">` only where a visible heading exists; optionally add
  `<h2 class="sr-only">Results</h2>` to the search results container.
- **Verify:** heading outline: 404 = h1 → h2 → 10×h3; axe `heading-order` and
  `region` pass.

---

## Suggested fix order

1. #1 + #10 (one template pass, `<main>` + skip link).
2. #3 + #4 + #7 (token/CSS-only: ≈ 15 lines in `themes.scss`, `article.scss`,
   `syntax-highlight.scss`).
3. #2 (small JS + template).
4. #5, #6, #8, #9 (templates + CSS).
5. Add `@axe-core/playwright` scans of `/`, `/en/`, a post, search and the 404 page
   to `e2e/smoke.spec.js` (CI) so regressions fail the build — there is no
   axe gate in the current e2e suite.
