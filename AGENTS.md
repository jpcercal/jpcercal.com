# AGENTS.md — agent operating notes for jpcercal.com

## Repo map

- `content/posts/<slug>/` — 70 post bundles (avg ~3.3 files), 6 `index.en.md`
  (EN translations). `content/search/`, `content/contact/` (each with
  `_index.md` + `_index.en.md`), `content/authors/` (3 authors). The 404
  page is `layouts/404.html` — there is no `content/404.html`.
- `assets/scss/` (13 files) — app styles (Dart Sass `@use` modules) +
  `syntax-highlight.scss` (Chroma onedark tokens verbatim from
  `hugo gen chromastyles`, own container chrome) + `themes.scss`
  (Medium-style dark-theme CSS vars bound to `data-theme`).
  `assets/less/` + Bootstrap slim + Ruby Sass chain long gone.
- `assets/css/vendor.css` — Tailwind v4 entry (`@import "tailwindcss"`,
  CSS-first, no tailwind/postcss config): Bootstrap-4 grid skeleton
  (container/row/col) + `@theme` breakpoints (xl pinned to 1200px) +
  `@custom-variant dark` bound to `[data-theme="dark"]` (reserved for
  future color-only tweaks; no `dark:` utilities used yet).
- `assets/images/` — `favicon/` + `icons/` sources (copied to
  `public/images/` and optimized by `bin/build-images.sh`).
- `assets/js/` — exactly 3 files: `search.js` (Pagefind, search page only
  via the `searchPage` scratch flag) + `theme.js` (site-wide dark-theme
  toggle via `footer.html`, `defer`) + shared `i18n.js`.
  (`contact.js`/`notifier.js`/`index.js` deleted with the contact form;
  `axios`/`lunr` deps long gone.) `js.Build` (esbuild) bundles +
  minifies + fingerprints. `search.js` is parameterized by locale (a build
  param), so EN/PT search pages emit distinct hashed files; `theme.js`
  builds param-free (one hashed file, every page).
  `lunr` + `search.json` + `search-template.html` +
  `grunt-custom/{lunr,post,author,category,tag}-*` + `paths.js` are gone;
  `pagefind --site public` indexes the 76 post source files (70 PT + 6 EN,
  2 langs auto-detected, `type=post` filter set in
  `layouts/posts/single.html` and matched in `search.js`); `search.js`
  uses dynamic `import()` of the ES-module `pagefind.js` with
  `basePath` = bundle dir (staging subpaths work). `pagefind.js` is a
  module — classic `<script src>` fails with `import.meta` error.
  Search works only in built output (+`pagefind --site`); `hugo server`
  dev has no index, results area stays empty (silent, old parity).
- `theme.js` contract: the pre-CSS init script in `head-assets.html`
  resolves `data-theme` before paint (stored choice → OS
  `prefers-color-scheme` → light, no flash); `theme.js` wires the header
  `[data-theme-toggle]` button, persists to `localStorage.theme`, keeps
  following the OS while nothing is stored, and syncs `colorScheme` +
  `theme-color`. Covered by 3 `e2e/smoke.spec.js` tests.
- `layouts/` (33 files) — `index.html`, `404.html`, `alias.html`,
  `robots.txt` (disallows `/search/`, `/contact/` + `/en/` variants),
  `posts/single.html`, `authors/single.html`, `contact/list.html` (static
  links, no form), `search/list.html`, `taxonomy/` + `_default/`
  (+`_markup/render-image.html`), `design-system/`,
  `shortcodes/ref.html`, `partials/` (18 files: `head.html`,
  `head-assets.html` incl. theme init, `css.html` + `js.html` Hugo Pipes,
  `navbar.html` incl. theme toggle, `footer.html` incl. `theme.js`,
  `post-card.html`, head-meta-*/favicon/i18n-list/reading-time/word-count/
  author-*).
- `static/` — exactly 2 files: `CNAME` (prod `jpcercal.com`; must NOT ship
  to the staging branch) + `_headers` (Pages cache/security headers;
  replaces `_config.yml` semantics). Favicons live in
  `assets/images/favicon/`, not here. `search-template.html` was removed
  with Pagefind.
- `config.yaml` — Hugo `0.166.0`, `publishDir: public`, Chroma `onedark`
  (`noClasses: false`, line numbers on). `security.exec.allow` must keep
  `^(dart-)?sass$`, `^go$`, `^git$`, `^node$`, `^postcss$`,
  `^tailwindcss$` (Hugo Pipes binaries).
- Grunt is fully deleted (Gruntfile + `grunt/` + `grunt-custom/` +
  `bin/watch.sh` gone). Build = npm scripts: `npm run clean` +
  `npm run build` (hugo `--minify --printUnusedTemplates`, `BASE_URL` env
  required) → `npm run images` (`bin/build-images.sh`) →
  `npm run search:index` (`pagefind --site public`) → gates (`lint`,
  `validate:html` over `public/**/index.html` + `public/404.html`,
  `validate:xml` via `xmllint` over xml+svg, `links` via `lychee` with a
  prod→local `--remap`, `lhci`, `e2e`).
- `design-system/` — repo-root staging-only docs (NOT under `content/`):
  `_index.md` (draft, sitemap-disabled), `tokens.md` (incl. dark tokens),
  `components.md`. Staging copies it to `content/design-system` and builds
  `--buildDrafts`; prod must never contain `public/design-system/`.
- `bin/` holds exactly 2 scripts: `build-images.sh` (native image
  pipeline: copy → oxipng/mozjpeg optimize → oxvg minify → resvg 512px
  covers) + `verify-pages.sh` (live-site gate suite run by the
  `cloudflare-pages` job). (`fetch-vendor.sh` deleted with the last vendor
  clone; `watch.sh` deleted with the Grunt pipeline.)
- `.github/workflows/ci.yml` — jobs in order: `image` (builds + pushes the
  self-sufficient CI image to GHCR, pinned by commit SHA; downstream jobs
  run inside it and zero-install via `ln -s /opt/ci/node_modules`) →
  `build` (prod build + all gates, uploads the `public` artifact) →
  `preview-staging` (PRs only: drafts + design-system + PR baseURL build,
  `public/CNAME` removed, `peaceiris/actions-gh-pages` publishes `pr-<n>/`
  with `cname: staging.jpcercal.com`; presence check is a
  `continue-on-error` file-existence assertion) + `deploy` (main pushes
  only: downloads the artifact, idempotent project-create, wrangler v4
  Direct Upload) → `cloudflare-pages` (runs `bin/verify-pages.sh` against
  the live site with baked-Chromium `CHROME_PATH` + `LHCI_CHROME_FLAGS`;
  fails the workflow — it runs AFTER the deploy, it does not gate it).
- `e2e/smoke.spec.js` — 7 tests (home/search/contact-static-links/EN +
  3 theme tests); `e2e/visual.spec.js` snapshots are platform-specific and
  skipped on CI.

## Locked decisions (do not relitigate without new evidence)

1. **Tailwind v4** for CSS (Rust Oxide + LightningCSS, CSS-first `@theme`,
   auto purge). Rejected: PureCSS (dormant), Pico (heavier), hand-rolled
   (maintenance rot). Custom CSS measured lightest but Tailwind chosen for
   support/knowledge with zero dead CSS.
2. **Dart Sass Embedded** via Hugo Pipes — NOT `grass` (unmaintained).
3. **LightningCSS** (Rust) for CSS + **`hugo --minify`** (Go) for HTML.
4. **esbuild** (Go) for JS via Hugo `js.Build` (`minify: true`); the old
   `grunt-uglify` chain is deleted with Grunt.
5. **`html-validate` via Node** (`./node_modules/.bin/html-validate`) is
   the primary HTML validator; `tidy-C` optional. Java VNU is out. (Bun
   is not part of the toolchain.)
6. **Pagefind** (Rust) for search; no Cloudflare Workers/D1/Vectorize (would
   waste the 100k req/day free quota; site is fully static).
7. **No third-party comments/analytics**: Disqus (`cercal-io`) + GA4
   removed outright per user scope decision (`giscus` + Cloudflare Web
   Analytics/Zaraz explicitly out of scope — do not re-add without new
   instruction). Contact form likewise removed (static links page).
8. **Prod-only gates** (the live-site verify suite fails the workflow;
   it runs after the deploy, it does not gate it); staging checks are
   non-blocking.
9. **`br` or `zstd` accepted** for the compression gate (Pages negotiates).
10. **Native-first order**: C/Rust binary > Go > Node/Bun everywhere.
11. **Dark-theme contract**: `data-theme` on `<html>` + CSS vars in
    `themes.scss` (Medium-style); the OS setting is the default, the
    header toggle persists an override in `localStorage.theme`, and the
    pre-CSS init script prevents a flash. Tailwind's `dark:` variant is
    bound to `[data-theme="dark"]`. Do not reintroduce class-based dark
    mode.

## Landmines

- Biome `2.5.13` has no `files.ignores` (use `!` negations in
  `files.includes`; explicit CLI paths bypass `includes`). Biome must
  never scan `layouts/` — Go `{{ }}` templates are unparseable JS/HTML
  (validate built `public/` output with `html-validate` instead).
- `static/CNAME` (`jpcercal.com`) must not publish to the staging branch;
  the staging job deletes `public/CNAME` while the gh-pages action sets
  `cname: staging.jpcercal.com` instead.
- `public/` output is stale dev-only; never trust it, always rebuild.
- This machine's global gitignore ignores `*.js`, `assets/*`, `/bin/`
  and `robots.txt` — new files matching those need `git add -f`
  (tracked files are unaffected).
- Hugo Pipes binaries resolve via `node_modules/.bin` on PATH (npm scripts
  provide it; `playwright.config.js` webServer and the staging job export
  it explicitly when calling `hugo` directly). `config.yaml` must keep
  the `security.exec.allow` list (see repo map).
- Hugo resource cache collides when a pipe chain changes shape (e.g. adding
  `resources.Copy`, as `css.html` does for the syntax-highlight sheet);
  rebuild with `--ignoreCache` then. CI runners are cold.
- Old `vendor.scss` never imported Bootstrap `utilities/api`, so nearly all
  `d-*`/`mt-*`/`float-*`/responsive classes were dead in prod. The Tailwind
  migration ACTIVATES them — diffs vs old rendering here are intended fixes
  (locale switcher, floats, spacing), proven by old-vs-new screenshots.
- Covers render via `resvg` in `bin/build-images.sh` (512px). Native tools
  `oxipng`/`oxvg`/`resvg` via cargo, `mozjpeg` built from source on CI
  (no apt package); locally `brew install oxipng resvg mozjpeg` but PATH
  `jpegtran` is libjpeg-turbo — the script requires mozjpeg, so export
  `JPEGTRAN=/opt/homebrew/opt/mozjpeg/bin/jpegtran`.
- `e2e/smoke.spec.js` (7 tests) runs in CI; `e2e/visual.spec.js` snapshots
  are platform-specific and skipped on CI (`test.skip(!!process.env.CI)`)
  — regenerate locally only, from fully-styled builds (`hugo server`
  with pipes).
- `hugo server` MUST pass `--renderToMemory` — otherwise it writes dev
  rendering (localhost URLs, livereload) into `public/` and pollutes the
  production artifact.
- `npm run build` ≠ staging (`--buildDrafts` only in staging, plus the
  design-system copy + PR baseURL). Locally, always delete a copied
  `content/design-system/` afterwards — it must never be committed under
  `content/`.
- Search works only in built output + `pagefind --site public`; `hugo
  server` dev has no Pagefind index (silent empty results, by design).

## Agent rules

- **Plan mode is read-only**: observe/analyze/plan only. Never edit, run
  write-shaped commands, or commit. Tell the user to switch to build mode.
- **Atomic commits** on `<type>/<kebab-case>` branches, one concern per
  commit, fix-forward (no amend-after-push); deploy-affecting changes last.
  Never deploy prod from a PR job.
- **Regression discipline** (migration parity is done): every style/layout
  change re-runs the gates (`lint`, `validate:*`, `links`, `lhci`, `e2e`)
  and regenerates visual snapshots locally when rendering changes.
- **Verify through execution**: run builds, linters, and checks; report
  evidence (commands + results), not intent.
- **Prod gate absence assertions**: `public/design-system/` must not exist
  in prod artifacts; `search.json`/Lunr/Disqus/GA/Formspree/`api.ipify`
  remnants must not exist; `pagefind/pagefind-entry.json` must resolve.
- LHCI collects `/`, `/en/` + one rich post page
  (`/revisitando-o-layout-e-o-projeto-do-blog/`) — NOT `/search/`
  (noindexed by design, which fails the `is-crawlable` SEO audit).
