# UX audit — top 10 issues

**Target:** production, https://jpcercal.com/ (PT default, `/en/` mirror), live on 2026-10-26.
Chromium via CDP, desktop 1280px and mobile emulation 375px@2x, light + dark themes, keyboard Tab pass, `curl -sIL` for redirects.
Pages: `/`, `/en/`, a post (`/um-waf-nao-e-um-patch/`), `/search/`, `/contact/`, `/categories/`, unknown URL (404).
Not covered: Safari/Firefox, screen-reader run, real-device performance. No critical issue found (no blocked core flow); ranking is by user impact × reach.

| # | Issue | Severity |
|---|-------|----------|
| 1 | Search results show raw code/line-number junk as excerpts | High |
| 2 | Theme toggle (and others) have no/low-contrast keyboard focus ring | High |
| 3 | No `<main>` landmark and no skip link on any page | High |
| 4 | Touch/click targets far below 44px on mobile | High |
| 5 | Language switcher drops page context on Contact; active item is a dead `#` link | High |
| 6 | Search input has no accessible label; results region unannounced for empty state | Medium |
| 7 | Dates use English format on Portuguese pages | Medium |
| 8 | Home page has no identity; tagline/meta description is off-brand and stale | Medium |
| 9 | Contact page lists stale channels and "nós" copy | Medium |
| 10 | Internal links are non-canonical and cost a redirect; legacy 2013 posts surface undated | Medium |

## 1. Search excerpts are code junk — High
- **Where:** `/search/`, query `php`.
- **Observed:** top results are "Instalando PHPUnit no OSX 10.8 Mountain Lion" and "…no Windows"; excerpts read `1 2 3 4 5 6 7 8 9 10 … 19 <?php` — Chroma line-number gutters indexed as text.
- **Impact:** results look broken and uninformative; users cannot judge relevance, and 2013-era posts outrank current content.
- **Why included:** search is the main discovery flow for 76 posts. Fix: `data-pagefind-ignore` on `.lntd`/line-number cells (and consider code blocks), review ranking/recency.

## 2. Keyboard focus ring missing or invisible — High
- **Where:** header on all pages (Tab order: Pesquisar → logo → theme toggle → PT → EN).
- **Observed:** theme toggle computed `outline: 2px solid rgba(0,0,0,0)`, no box-shadow → no visible ring. Search/PT/EN links use `rgba(0,0,0,.84)` outline, nearly invisible on the dark theme background `rgb(25,25,25)`. Body links get the browser default. No `:focus` rule exists in `assets/scss`.
- **Impact:** keyboard users cannot see where they are (WCAG 2.4.7 / 1.4.11).
- **Why:** one shared `:focus-visible` token fixes all pages in both themes.

## 3. No `<main>` landmark, no skip link — High
- **Where:** every page (`querySelectorAll('main').length === 0`; no "pular" link).
- **Impact:** screen-reader users cannot jump to content; keyboard users tab through 6+ header links on every page (WCAG 2.4.1, 1.3.1).
- **Why:** trivial template fix (`layouts/_default/baseof.html`) with site-wide benefit.

## 4. Touch targets too small — High
- **Where:** mobile 375px: header PT/EN 35×28 and 37×28, brand link 19px tall, footer nav 28px tall; post page icon links 24×24 (three, empty-text), in-article reference links 26px tall; Contact page links 22px tall; categories list links 22px tall.
- **Impact:** mis-taps on phones, especially the language and share/icon links (WCAG 2.5.8 min 24px passes only barely; 44px recommended).
- **Why:** mobile-first reader traffic; fix with padding/min-height on nav, footer, icon and list links.

## 5. Language switch loses context; active item is `#` — High
- **Where:** `/contact/` → "Inglês" goes to `/en` (home), not `/en/contact/`. Posts switch correctly (`/en/a-waf-is-not-a-patch/`). On every page the active-language `Português`/`PT` link has `href="#"` (resolves to `…/page/#`).
- **Impact:** an EN reader clicking from Contact is dumped on the home page; the dead active link is announced as a link that does nothing.
- **Why:** bilingual is a core site promise. Fix `i18n-list` for pages without translations lookup and render the active locale as `aria-current` text/span.

## 6. Search input unlabeled — Medium
- **Where:** `/search/`: `<input type=search id=search>` with only a placeholder, no `<label>`/`aria-label`.
- **Observed:** instructions are plain text; "Nenhum resultado encontrado." appears in an `aria-live` region only after typing; before typing the three instruction lines are the whole page.
- **Impact:** screen readers announce an unnamed field; placeholder disappears on input.
- **Why:** WCAG 1.3.1/3.3.2; small fix.

## 7. English-formatted dates on PT pages — Medium
- **Where:** PT home cards and post pages: `<time>Oct 22, 2026</time>` next to "1470 palavras / 7 min de leitura".
- **Impact:** inconsistent language; PT readers see `Oct`. 
- **Why:** visual/content consistency across the whole PT site; format with the page locale (`22 de out. de 2026`).

## 8. Home lacks identity — Medium
- **Where:** `/` (and `/en/`, 404 page reuse the list). H1 is "Últimos Posts"; footer/meta description is "Alta qualidade e variedade de assuntos, incluindo desde dicas de programação à estilo de vida, mas no nosso estilo e não estamos falando de CSS." Every card is category "Engenharia". Tab title is `🐴 jpcercal.com`.
- **Impact:** first-time visitors do not learn who writes or what the blog covers; the search-snippet description is generic and misleading (no lifestyle content).
- **Why:** first impression and SEO snippet; add a one-line author intro and rewrite the description.

## 9. Contact page is stale — Medium
- **Where:** `/contact/`: listed Twitter (`twitter.com/jpcercal`), Facebook, GitHub, LinkedIn, plus "Nós gostaríamos de receber seu feedback…"; no mention of expected response, no copy of the e-mail visible beyond the link label "E-mail".
- **Impact:** dead/renamed channels, plural voice for a single-author blog, weak call to action. The page is the only feedback path since the form and comments were removed.
- **Why:** sole reader feedback route; verify each channel and reword.

## 10. Non-canonical internal links and undated legacy posts — Medium
- **Where:** header search `/search`, category `/categories/engineering`, author `/authors/jpcercal`, EN switch `/en` (all 301 to trailing slash; confirmed with `curl -sIL`); Contact "Procurar por" also `/search`.
- **Related:** 2013-era posts (PHPUnit on OSX 10.8) are listed without an "outdated" notice.
- **Impact:** extra round trip on every navigation (perceived speed), duplicated URL variants; readers may follow obsolete install steps.
- **Why:** cheap fix (`relLangURL` with trailing slash) plus an optional age banner for posts older than N years.

## Checked and fine
No horizontal overflow at 375px; viewport meta present; all 21 home images have alt; 404 returns HTTP 404 with a custom page; PT/EN canonical tags present; dark/light toggle works and persists.
