# AGENTS.md — agent operating notes for jpcercal.com

## Repo map

- `content/posts/<slug>/` — 70 post bundles (avg 3.2 files), 6 `index.en.md`
  (EN translations). `content/search/`, `content/contact/`, `content/404.html`.
- `assets/scss/` — `vendor.scss` (Bootstrap slim import), `index.scss` (app),
  syntax-highlight theme (ported from `assets/less/syntax-highlight.less`).
- `assets/js/` — exactly 3 files: `search.js`, `contact.js`, `index.js`.
  `search.js:31-46` and `contact.js:14-41` duplicate the `i18n` IIFE shape
  (different keys); `contact.js:48+` owns `notifier` — extract shared
  `i18n.js` (+`notifier.js`) ES modules in the JS commit.
  DONE (JS commit): `i18n.js` + `notifier.js` shared modules, `index.js`
  deleted (was dead: no references, prod dropped it via `drop_console`).
  `js.Build` (esbuild) bundles + minifies + fingerprints; per-locale
  variants (locale is a build param) mean 2 hashed files per bundle.
  `fetch` replaced `axios` (dropped dep; fixed ~500ms TBT from axios
  0.16.2); `lunr` CDN stays until the Pagefind commit.
  DONE (Pagefind commit): `lunr` + `search.json` + `search-template.html`
  + `grunt-custom/{lunr,post,author,category,tag}-*` + `paths.js` gone;
  `pagefind --site public` (Rust, `cargo install pagefind`) indexes the
  74 post pages (2 langs auto-detected, `type=post` filter); `search.js`
  uses dynamic `import()` of the ES-module `pagefind.js` with
  `basePath` = bundle dir (staging subpaths work). `pagefind.js` is a
  module — classic `<script src>` fails with `import.meta` error.
  Search works only in built output (+`pagefind --site`); `hugo server`
  dev has no index, results area stays empty (silent, old parity).
- `layouts/` (27 files) — `partials/head-assets.html`, `partials/footer.html`,
  `search/list.html`, `index.html`, `_default/`, shortcodes.
- `static/` — `CNAME` (prod `jpcercal.com`; must NOT ship to staging branch),
  `search-template.html` (removed with Pagefind), favicons, `_headers`
  (Pages; replaces `_config.yml` semantics).
- `config.yaml` — Hugo `0.166.0`, `publishDir: public`, Pygments → Chroma.
- `grunt/` (23), `grunt-custom/` (10), `Gruntfile.js`, `grunt/aliases.yaml` —
  legacy build being replaced by Hugo Pipes + native binaries.
- `design-system/` — repo-root staging-only docs (NOT under `content/`).
- `bin/fetch-vendor.sh` — interim `napa` replacement (napa package itself
  is gone). Remove per-consumer: `one-dark-*` clone lines die with the CSS
  commit (Less port), `disqus-loader` line dies with the privacy commit.
  `bin/watch.sh` is legacy Docker flow, deleted with the Grunt pipeline.
- `.github/workflows/ci.yml` — jobs: `build`, `deploy` (prod Pages),
  `preview-staging` (PR → `gh-pages`), `cloudflare-pages` (blocking verify).

## Locked decisions (do not relitigate without new evidence)

1. **Tailwind v4** for CSS (Rust Oxide + LightningCSS, CSS-first `@theme`,
   auto purge). Rejected: PureCSS (dormant), Pico (heavier), hand-rolled
   (maintenance rot). Custom CSS measured lightest but Tailwind chosen for
   support/knowledge with zero dead CSS.
2. **Dart Sass Embedded** via Hugo Pipes — NOT `grass` (unmaintained).
3. **LightningCSS** (Rust) for CSS + **`hugo --minify`** (Go) for HTML.
4. **esbuild** (Go) for JS; preserves `uglify.yaml` mangle/drop_console.
5. **`html-validate` via Bun** is the primary HTML validator; `tidy-C`
   optional. Java VNU is out.
6. **Pagefind** (Rust) for search; no Cloudflare Workers/D1/Vectorize (would
   waste the 100k req/day free quota; site is fully static).
7. **`giscus` + Cloudflare Web Analytics/Zaraz** for comments/analytics.
8. **Prod-only blocking gates**; staging checks are non-blocking.
9. **`br` or `zstd` accepted** for the compression gate (Pages negotiates).
10. **Native-first order**: C/Rust binary > Go > Node/Bun everywhere.

## Landmines

- `grunt/processhtml.yaml` has `process:false` — a no-op; `build:template`
  comments in layouts do nothing. Remove with the task.
- `grunt/concat.yaml` targets a `jpcercal.com.js` that `footer.html:19`
  never loads — dead config. Delete, do not port.
- CDN skew: layouts pin `axios 0.16.2` / `lunr 2.1.5` while `package.json`
  has `1.20.0` / `2.3.9`. Both go away (fetch API + Pagefind).
- `seoImage` front-matter points at `.png` but bundles ship `.svg` — fix
  with `Resources.GetMatch`, not string concat.
- `search.js:31-48` and `contact.js:14-43` duplicate i18n/notify logic —
  extract to shared ES modules. (Line numbers approximate; see `assets/js/`.)
- Biome `2.5` has no `files.ignores` (use `!` negations in `files.includes`)
  and no comments in `biome.json`; explicit CLI paths bypass `includes`.
  Biome must never scan `layouts/` — Go `{{ }}` templates are unparseable
  JS/HTML (validate built `public/` output with `html-validate` instead).
- `static/CNAME` (`jpcercal.com`) must not publish to the staging branch;
  the staging job strips or overwrites it per-PR path.
- `public/` output is stale dev-only; never trust it, always rebuild.
- This machine's global gitignore ignores `*.js` and `assets/*` — new JS
  files and new files under `assets/` need `git add -f` (tracked files
  are unaffected).
- Hugo Pipes binaries resolve via `node_modules/.bin` on PATH (npm scripts
  provide it; `playwright.config.js` webServer prefixes it explicitly).
  `config.yaml` must keep `^tailwindcss$` in `security.exec.allow`.
- Hugo resource cache collides when a pipe chain changes shape (e.g. adding
  `resources.Copy`); rebuild with `--ignoreCache` then. CI runners are cold.
- Old `vendor.scss` never imported Bootstrap `utilities/api`, so nearly all
  `d-*`/`mt-*`/`float-*`/responsive classes were dead in prod. The Tailwind
  migration ACTIVATES them — diffs vs old rendering here are intended fixes
  (locale switcher, floats, spacing), proven by old-vs-new screenshots.
- `grunt/htmlmin.yaml` keeps optional tags/redundant attrs/entities to
  satisfy `html-validate`; the file dies with the HTML commit (`hugo
  --minify` keeps them anyway).
- `svg2png` (inkscape) is gone — covers render via `resvg` in
  `bin/build-images.sh` (512px). DONE (images commit): native tools
  `oxipng`/`oxvg`/`resvg` via cargo, `mozjpeg` built from source on CI
  (no apt package); locally `brew install oxipng resvg mozjpeg` but PATH
  `jpegtran` is libjpeg-turbo — the script requires mozjpeg, so export
  `JPEGTRAN=/opt/homebrew/opt/mozjpeg/bin/jpegtran`.
- Visual specs (`e2e/visual.spec.js`) are platform snapshots, skipped on CI;
  regenerate only from fully-styled builds (`hugo server` with pipes, never
  from grunt-CSS layouts).
- `hugo server` MUST pass `--renderToMemory` — otherwise it writes dev
  rendering (localhost URLs, livereload) into `public/` and pollutes the
  production artifact.
- Run `bin/fetch-vendor.sh` AFTER any `npm install/uninstall` — npm prunes
  the extraneous vendor clones (e.g. `disqus-loader`).
- `grunt-shell` production ≠ development (`--buildDrafts` only in dev);
  the same split applies to staging (`--buildDrafts` + PR baseURL) vs prod.

## Agent rules

- **Plan mode is read-only**: observe/analyze/plan only. Never edit, run
  write-shaped commands, or commit. Tell the user to switch to build mode.
- **Like-for-like parity**: every migration commit proves equivalence
  (`diff -r` old vs new output ex fingerprints, size comparisons, LHCI).
- **Atomic commits** on `chore/modernize-architecture`, deploy-affecting
  changes last. Never deploy prod from a PR job.
- **Verify through execution**: run builds, linters, and checks; report
  evidence (commands + results), not intent.
- **Prod gate absence assertions**: `public/design-system/` must not exist
  in prod artifacts; `search.json`/Lunr/Disqus/GA remnants must not exist.
