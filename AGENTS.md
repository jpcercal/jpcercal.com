# AGENTS.md — agent operating notes for jpcercal.com

## Repo map

- `content/posts/<slug>/` — 70 post bundles (avg 3.2 files), 6 `index.en.md`
  (EN translations). `content/search/`, `content/contact/`, `content/404.html`.
- `assets/scss/` — `vendor.scss` (Bootstrap slim import), `index.scss` (app),
  syntax-highlight theme (ported from `assets/less/syntax-highlight.less`).
- `assets/js/` — `search.js`, `contact.js`, `newsletter.js`, `blog.js`,
  `language.js`, `post.js`; shared `i18n.js`/`notifier.js` after dedupe.
- `layouts/` (27 files) — `partials/head-assets.html`, `partials/footer.html`,
  `search/list.html`, `index.html`, `_default/`, shortcodes.
- `static/` — `CNAME` (prod `jpcercal.com`; must NOT ship to staging branch),
  `search-template.html` (removed with Pagefind), favicons, `_headers`
  (Pages; replaces `_config.yml` semantics).
- `config.yaml` — Hugo `0.166.0`, `publishDir: public`, Pygments → Chroma.
- `grunt/` (23), `grunt-custom/` (10), `Gruntfile.js`, `grunt/aliases.yaml` —
  legacy build being replaced by Hugo Pipes + native binaries.
- `design-system/` — repo-root staging-only docs (NOT under `content/`).
- `bin/fetch-vendor.sh` — interim `napa` replacement (to be removed).
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
  extract to shared ES modules.
- `static/CNAME` (`jpcercal.com`) must not publish to the staging branch;
  the staging job strips or overwrites it per-PR path.
- `public/` output is stale dev-only; never trust it, always rebuild.
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
