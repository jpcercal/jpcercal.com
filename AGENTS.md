# AGENTS.md — agent operating notes for jpcercal.com

## Repo map

- `flake.nix` + `flake.lock` — source of truth for local/CI dependencies;
  locked nixpkgs provides all native tools and Playwright 1.63.0 browsers,
  separate locked `nodepkgs` preserves Node 26.8.2. `nix/toolchain.nix`
  defines the dev shell, version/browser/safety checks, resvg font wrapper,
  and Linux runtime closure; `nix/node-deps.nix` builds the locked npm
  dependencies offline with a verified `npmDepsHash` and patches native
  Linux binaries. `nix/check-browser.cjs` actually launches Chromium;
  `nix/check-node-modules.sh` protects existing user-managed dependencies.
  `.envrc` loads the flake automatically after `direnv allow`. Supported:
  Linux amd64/arm64, macOS Apple Silicon; Intel macOS browser is not
  packaged by this pinned nixpkgs (use the optional Linux container).
- `Dockerfile` — optional adapter, not a second toolchain definition:
  digest-pinned Nix 2.35.2 builder runs flake checks and exports the runtime
  closure into a digest-pinned Debian compatibility base. No apt/cargo/npm
  or browser install in the runtime. `/opt/ci/bin`, `/opt/ci/node_modules`,
  `blog-env`, and `BASH_ENV` expose the same environment to CI shells.

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
  (container/row/col, explicit-px lg/xl media queries; Tailwind's default
  breakpoint scale drives the `sm:`/`md:`/`lg:` variants) +
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
  `layouts/posts/single.html` and matched in `search.js`; cover meta
  `image` + `image_dark` also emitted there — `image_dark` only when
  `index.dark.svg` exists on disk, so `search.js` never derives the dark
  cover from a naming convention); `search.js`
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
  `theme-color`. Covered by 6 `e2e/smoke.spec.js` theme tests (2 of them
  are cover-fetch network guards — see decision #11; the 6th guards the
  404 page canvas in both themes).
- `layouts/` (33 files) — `index.html`, `404.html` (title + italic
  description with a requested-path echo via an inline client-side script
  filling `[data-error404-path]` + latest 10 posts via `post-card.html`),
  `alias.html`,
  `robots.txt` (disallows `/search/`, `/contact/` + `/en/` variants),
  `posts/single.html`, `authors/single.html`, `contact/list.html` (static
  links, no form), `search/list.html`, `taxonomy/` + `_default/`
  (+`_markup/render-image.html`), `design-system/`,
  `shortcodes/ref.html`, `partials/` (18 files: `head.html`,
  `head-assets.html` incl. theme init, `css.html` + `js.html` Hugo Pipes,
  `navbar.html` incl. theme toggle, `footer.html` incl. `theme.js`,
  `post-card.html`, head-meta-*/favicon/i18n-list/reading-time/word-count/
  author-*).
- `static/` — 3 files: `CNAME` (prod `jpcercal.com`; must NOT ship
  to the staging branch) + `_headers` (Pages cache/security headers;
  replaces `_config.yml` semantics) + `_redirects` (`/posts/` -> `/` and
  `/en/posts/` -> `/en/` 301s; Cloudflare Pages only — inert on the
  GH-Pages staging, which ignores `_redirects`). Favicons live in
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
  `npm run search:index` (`pagefind --site public`, then prunes the
  unreferenced Pagefind UI bundles) → gates (`lint`,
  `validate:html` over `public/**/index.html` + `public/404.html`,
  `validate:xml` via `xmllint` over xml+svg, `links` via `lychee` with a
  prod→local `--remap`, `lhci`, `e2e`).
- `design-system/` — repo-root staging-only docs (NOT under `content/`):
  `_index.md` (draft, sitemap-disabled), `tokens.md` (incl. dark tokens),
  `components.md`. Staging copies it to `content/design-system` and builds
  `--buildDrafts`; prod must never contain `public/design-system/`.
- `bin/` holds 4 scripts: `build-images.sh` (native image
  pipeline: copy → oxipng/mozjpeg optimize → oxvg minify → resvg 512px
  covers) + `verify-pages.sh` (live-site gate suite run by the
  `cloudflare-pages` job), `nix-node-modules.sh` (safe immutable dependency
  linking), and `check-artifact.sh` (production isolation and active-script
  tracker checks; historical prose mentioning old libraries is allowed).
  (`fetch-vendor.sh` deleted with the last vendor
  clone; `watch.sh` deleted with the Grunt pipeline.)
- `.github/workflows/ci.yml` — jobs in order: `image` (builds + pushes the
  Nix-built self-sufficient CI image to GHCR, consumed by immutable digest;
  downstream jobs
  run inside it and zero-install via `ln -s /opt/ci/node_modules`) →
  `build` (Playwright smoke first, clean prod build + lint/HTML/XML/links/
  artifact/LHCI gates, uploads the `public` artifact) →
  `preview-staging` (PRs only: drafts + design-system + PR baseURL build,
  `public/CNAME` removed, `peaceiris/actions-gh-pages` publishes `pr-<n>/`
  with `cname: staging.jpcercal.com`; presence check is a
  `continue-on-error` file-existence assertion) + `deploy` (main pushes
  only: same container, downloads the artifact, idempotent project-create,
  exactly locked Wrangler 4.147.0 from npm/Nix, no action-installed CLI,
  Direct Upload) → `cloudflare-pages` (runs `bin/verify-pages.sh` against
  the live site with baked-Chromium `CHROME_PATH` + `LHCI_CHROME_FLAGS`;
  fails the workflow — it runs AFTER the deploy, it does not gate it).
- `e2e/smoke.spec.js` — 11 tests (home/search/contact-static-links/EN +
  404 layout + latest-posts content + 6 theme tests, 2 of them
  cover-fetch network guards);
  `e2e/visual.spec.js` snapshots are platform-specific and skipped on CI.

## Locked decisions (do not relitigate without new evidence)

0. **Nix flakes + direnv** own dependencies and runtime configuration;
   Docker is optional locally and remains the CI packaging adapter.
   Commit `flake.lock` and `package-lock.json`; hashes are mandatory.
   No automatic mutable `npm ci` on shell entry, no floating tool downloads.
   Update exact Node and Playwright version assertions intentionally.
   Reproducibility is per platform, not byte-identical across OSes or
   guaranteed for network-dependent performance/link audits.

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
7. **No third-party comments; Cloudflare Web Analytics only**: Disqus
   (`cercal-io`) + GA4 removed outright per user scope decision
   (`giscus` + Zaraz explicitly out of scope). Contact form likewise
   removed (static links page). The single allowed tracker is the
   cookieless Cloudflare Web Analytics beacon
   (`layouts/partials/analytics-cloudflare.html`, token in
   `config.yaml` params, renders only for the `jpcercal.com` host via
   the `.Permalink` gate so staging/local/e2e emit nothing; do NOT
   also enable dashboard auto-injection — it double-counts). The
   live-site verify suite asserts the beacon IS present in prod while
   still failing on Disqus/`gtag(`/`googletagmanager` remnants.
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
    mode. Theme-paired post covers ship as two `<picture>`s
    (`.theme-cover--light/--dark`, each with a bare `<img>` — no
    `<source media>`, which can only see the OS) switched by CSS in
    `post-card.scss` (`data-theme`, with a `prefers-color-scheme`
    fallback for no-JS); `theme.js` never touches images. The hidden
    picture is `display:none` + `loading="lazy"` and must not be fetched
    — that "hidden lazy is not fetched" behavior is browser-documented,
    not spec-guaranteed, and is guarded by e2e network assertions in
    Chromium only (Firefox/Safari uncovered). With JS disabled Chromium
    drops lazy deferral entirely, so both variants are fetched (display
    stays correct) — verified empirically.

## Landmines

- Never run `npm ci` into the Nix-managed read-only `node_modules` link.
  Shell entry creates/updates only owned links and refuses existing user
  directories. For npm changes use `--package-lock-only --ignore-scripts`,
  recalculate `npmDepsHash`, and commit both locks. `.gitignore` must keep
  `!flake.lock` despite its general `*.lock` exclusion.
- Hugo's Node permission model recursively checks symlinks in allowed
  directories. The Nix environment sets `HUGO_SECURITY_NODE_PERMISSIONS_ALLOWREAD`
  to the project plus the exact npm derivation, and shell/direnv adds the
  exact `.direnv/flake-profile` target. Never allow the entire `/nix/store`
  (unrelated packages link to `/etc`), use `*`, or disable permissions.
- Playwright's npm version must match the Nix browser driver. Linux native
  binaries are patched with RPATH; host-library validation is skipped, but
  actual browser launch is a flake check. npm browser revision overrides
  are removed to match the Nix browser link farm on macOS too.
- `resvg` is wrapped with pinned Liberation/DejaVu fonts and no system-font
  discovery; `FONTCONFIG_FILE` alone does not configure resvg/fontdb.
- Browser tests rebuild `public/` with localhost URLs. In CI run them before
  the clean production build; never upload their output as the prod artifact.
- Docker's entrypoint is not relied upon by GitHub Actions. Every `run` step
  uses Bash and `BASH_ENV` for the Nix-generated settings. Do not reintroduce
  action-installed Wrangler or floating Node/native-tool version variables.

- Biome `2.5.13` has no `files.ignores` (use `!` negations in
  `files.includes`; explicit CLI paths bypass `includes`). Biome must
  never scan `layouts/` — Go `{{ }}` templates are unparseable JS/HTML
  (validate built `public/` output with `html-validate` instead).
- `static/CNAME` (`jpcercal.com`) must not publish to the staging branch;
  the staging job deletes `public/CNAME` while the gh-pages action sets
  `cname: staging.jpcercal.com` instead.
- `/posts/` is a non-rendering section: `content/posts/_index.{md,en.md}`
  set `build: { render: never }` + `sitemap: { disable: true }`, and
  `static/_redirects` 301s the URLs to the home index. Hugo 0.166 REMOVED
  the `_build` front matter key (using it is now a build ERROR, not a
  warning) — use `build`. Do not delete these files: without them the
  section returns to the sitemap and to a missing-layout warning.
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
- Covers render via the Nix-wrapped `resvg` in `bin/build-images.sh` (512px).
  All native tools come from the locked flake; `JPEGTRAN` is the exact Nix
  mozjpeg path. Do not replace it with a host libjpeg-turbo binary or add
  cargo/Homebrew/apt installation requirements back into local/CI docs.
- `e2e/smoke.spec.js` (11 tests) runs in CI; `e2e/visual.spec.js` snapshots
  are platform-specific and skipped on CI (`test.skip(!!process.env.CI)`)
  — regenerate locally only, from fully-styled builds (`hugo server`
  with pipes). The Playwright webServer serves `public/` via
  `python3 -m http.server`, which does NOT honor custom 404s — smoke
  tests hit `/404.html` (`/en/404.html`) directly; the
  unknown-URL→custom-404 behavior is gated live by `bin/verify-pages.sh`.
- `hugo server` MUST pass `--renderToMemory` — otherwise it writes dev
  rendering (localhost URLs, livereload) into `public/` and pollutes the
  production artifact.
- `npm run build` ≠ staging (`--buildDrafts` only in staging, plus the
  design-system copy + PR baseURL). Locally, always delete a copied
  `content/design-system/` afterwards — it must never be committed under
  `content/`.
- Search works only in built output + `pagefind --site public`; `hugo
  server` dev has no Pagefind index (silent empty results, by design).
- `{{ i18n }}` output is HTML-escaped — markup inside translation
  strings (e.g. the 404 `<code data-error404-path>` placeholder) needs
  an explicit `| safeHTML` at the call site.

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
