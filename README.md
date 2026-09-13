# jpcercal.com

Personal blog and website — [jpcercal.com](https://jpcercal.com/) in production,
per-PR previews at `https://staging.jpcercal.com/pr-<n>/`.

## A brief history of time

> Yes, I know that this title remembers a book title by Stephen Hawking, but at this case it’s about my blog. =)

Well, everything started in 2010 when I decided to have a blog, it has been a long time and many different things happened to myself on the way, however, this is a complete redesign of an old [Symfony](https://symfony.com/) project, that was migrated to [PhalconPHP](https://phalconphp.com/en/), then to [Wordpress](https://wordpress.org/) and finally to text based application (which is the status quo today).

Thanks to all of you for following me through this crazy things called life, to all free services available nowdays on the internet and for the effort that I’ve put on it, now I don’t have to pay anything to have this project running except the domain.

### Screenshots

Well, nothing better than a picture showing how the blog is rendered today, right?

![Homepage](homepage-desktop.png)

Mobile rendering is captured in `homepage-mobile.png`.

## Architecture (target)

| Concern | Legacy | Target |
|---|---|---|
| SSG | Hugo 0.166.0 extended | Hugo 0.166.0 extended (kept) |
| CSS framework | Bootstrap 5.3.8 slim | Tailwind CSS v4 (Rust Oxide + LightningCSS) |
| SCSS compiler | Ruby Sass via grunt-contrib-sass | Dart Sass Embedded via Hugo Pipes |
| CSS minify | grunt-contrib-cssmin (Node) | LightningCSS (Rust) |
| HTML minify | grunt-contrib-htmlmin (Node) | `hugo --minify` (Go) |
| JS minify | grunt-contrib-uglify (Node) | esbuild (Go) |
| XML minify | grunt-xmlmin (Node) | `xmllint` (C) |
| Images | grunt-contrib-imagemin + svg2png/Inkscape | `oxipng` (Rust) + `oxvg` (Rust) + `mozjpeg` (C) + `resvg` (Rust) |
| Syntax highlight | Pygments (Python) | Chroma (Go, Hugo built-in) |
| Search | Lunr.js 2.3.9 + `search.json` | Pagefind 1.5.2 (Rust, static, PT stemming) |
| Comments | Disqus (`cercal-io`) | removed (no third-party comments) |
| Analytics | Google Analytics 4 | removed (no third-party analytics) |
| Lint | csslint/jshint/VNU (Java) | Biome (Rust) + `html-validate` via Node |
| Link check | — | `lychee` (Rust) |
| Perf audit | grunt-pagespeed (dead API) | `lhci` via Node |
| E2E | — | Playwright |
| Theming | — | Medium-style dark theme (`themes.scss` CSS vars + `data-theme`, OS default, header toggle persisted in `localStorage`, no-flash init) |
| File ops | grunt clean/concat/copy/processhtml/watch | Hugo (Go) + `cp`/`rm` |
| Vendor fetch | `napa` over retired `git://` | removed (no vendor clones left) |
| Runtime | Node 20 + Ruby + Java 8 + Python + Inkscape | Node 26.8.2 pinned (`.node-version`, `fnm`), static native binaries only |
| Hosting (prod) | `gh-pages` branch via GitHub Pages | Cloudflare Pages Direct Upload (`wrangler pages deploy public`) |
| Hosting (staging) | — | `gh-pages` branch repurposed staging-only, path-based per PR |

Toolchain preference order: **native C/Rust binary > Go > Node/Bun**.
See [AGENTS.md](AGENTS.md) for the locked decisions and rationale.

Baseline repo size: 367 tracked files (`content` 242 — 70 post bundles,
`assets` 49, `layouts` 33; Grunt is fully deleted in the final state).
Native tool versions are pinned in the `Dockerfile` (`HUGO_VERSION`,
`OXIPNG_VERSION`, `OXVG_VERSION`, `RESVG_VERSION`, `PAGEFIND_VERSION`,
`LYCHEE_VERSION`, `MOZJPEG_VERSION`) and baked into the self-sufficient
CI image, so it is the source of truth for the toolchain.
At ~1 post/day the deployed file count stays ~1.5–2k/yr — far below the
Cloudflare Pages 20k-file limit.

## Local development

Prerequisites: [fnm](https://github.com/Schniz/fnm) (or Node 26+ — the
repo pins 26.8.2 in `.node-version`), Hugo extended 0.166.0, plus the
native image/search/link toolchain for full builds (`oxipng`, `oxvg`,
`resvg`, mozjpeg `jpegtran`, `pagefind`, `lychee`, `xmllint` — see the
`Dockerfile` for the pinned versions).

```shell
fnm use          # pins Node 26 (see .node-version)
npm ci
hugo server --renderToMemory   # live preview at http://localhost:1313
```

`--renderToMemory` is required: without it `hugo server` writes dev
rendering (localhost URLs, livereload) into `public/` and pollutes the
production artifact.

Production-equivalent build (`BASE_URL` is required):

```shell
BASE_URL=https://jpcercal.com/ npm run build   # clean + hugo --minify
npm run images                                  # bin/build-images.sh
npm run search:index                            # pagefind --site public
```

Design-system preview (staging-only docs, lives outside `content/`):

```shell
cp -r design-system content/design-system && hugo server --buildDrafts --renderToMemory
# delete content/design-system afterwards — it must never be committed
# under content/ or leak into production builds
```

## Deploy

- **Production** (`push` to `master` only): the `image` job builds the
  self-sufficient CI image (`Dockerfile`, pushed to GHCR and pinned by
  commit SHA — Hugo extended + Node 26 + native image toolchain +
  baked `node_modules` + Playwright Chromium, so jobs do zero installs).
  `build` links the baked dependencies, runs `npm run build` (requires
  `BASE_URL`) + `bin/build-images.sh` + `pagefind --site public` plus
  the gates (`lint`, `validate:html`, `validate:xml`, `links`), and
  uploads the `public` artifact. `deploy` downloads that artifact and
  publishes it with `wrangler pages deploy public
  --project-name="$CLOUDFLARE_PROJECT_NAME"` (wrangler v4,
  `CLOUDFLARE_PROJECT_NAME=jpcercal-dot-com` in CI env; creates the
  project first if missing, idempotent) to `jpcercal.com`. Direct
  Upload — no Pages build quota consumed. Afterwards the
  `cloudflare-pages` job (`bin/verify-pages.sh`) verifies the live site
  and fails the workflow on any missed gate.
- **Staging** (every PR, never touches the Pages project or
  production): CI rebuilds with `--buildDrafts`,
  `content/design-system` copied in, `--baseURL
  https://staging.jpcercal.com/pr-<n>/`, and publishes that path to the
  `gh-pages` branch (`keep_files`, prod `CNAME` stripped, branch custom
  domain `staging.jpcercal.com`). The presence check is a light
  non-blocking file-existence assertion only.
- **DNS** (Cloudflare, one-time repo-admin setup): apex → Pages project;
  `CNAME staging → <user>.github.io` (proxied) with the `gh-pages`
  custom domain set to `staging.jpcercal.com`.
- **Secrets** (repo settings → Actions): `CLOUDFLARE_API_TOKEN` (Pages
  deploy token) + `CLOUDFLARE_ACCOUNT_ID`.
- **Local Docker build**: `docker build -t jpcercal/jpcercal.com .`
  produces the same self-sufficient CI image the pipeline runs in
  (multi-stage: prebuilt release binaries + Rust-built `oxvg`/`resvg`
  fallback + mozjpeg from source + baked `node_modules` + Playwright
  Chromium; `linux/amd64` with `arm64` fallbacks). CI jobs then only
  `ln -s /opt/ci/node_modules node_modules` and run the same pipeline
  (`npm run build` with `BASE_URL`, `bin/build-images.sh`,
  `pagefind --site public`).

## Verification

The `cloudflare-pages` CI job runs on production pushes only, **after**
the deploy, against the live site (`bin/verify-pages.sh`, `BASE_URL`;
fails the workflow on any missed gate). It asserts, accepting `br` or
`zstd`:

1. Compression served for html/css/js
2. HTTP/2 + HTTP/3 (`alt-svc: h3`) headers
3. Immutable long-cache + fingerprinted asset names
4. TTFB < 1.0s median (over 5 samples)
5. Payload budgets (`search.json` → 404, `design-system/` → 404,
   `pagefind/pagefind-entry.json` → 200, no
   Disqus/`gtag(`/`googletagmanager`/Formspree/`api.ipify`/Lunr remnants)
6. SEO (robots disallows `/search/` + `/contact/` and references the
   sitemap, `sitemap.xml` well-formed via `xmllint` and excluding
   search/contact, `hreflang`, valid JSON-LD)
7. `lychee` link check + `html-validate` on the live homepage
8. LHCI performance ≥ 90 and SEO ≥ 90 (blocking; accessibility and
   best-practices ≥ 90 warn) — the live config drops `staticDistDir`
   and passes a single-string `chromeFlags` (`LHCI_CHROME_FLAGS`
   carries `--no-sandbox` for rootful CI containers)

plus a summary table. Staging PRs get a light non-blocking
file-existence check only (`public/index.html` and
`public/design-system/index.html` present, `public/CNAME` absent).

## Project history

The modernization path (`chore/modernize-architecture`, single PR,
stacked revert-safe commits, deploy last) is merged:

0. docs (this README + `AGENTS.md`) → 1. tooling baselines → 2. napa out →
3. CSS (Tailwind + Dart Sass + Less port) → 4. JS modules + esbuild →
5. html/xml → 6. images → 7. highlight + lint → 8. Pagefind → 9. SEO/perf →
10. privacy → 11. design-system → 12. deploy (Pages prod + gh-pages staging +
DNS/CNAME) → 13. slim native-only image, green build.

Follow-up hardening since (one fix PR each): self-sufficient GHCR CI
image with zero-install jobs, Wrangler deploy/project fixes (existing
`jpcercal-dot-com` project, account inference, idempotent create),
`lychee` egress/bot excludes with prod→local `--remap`, live-URL LHCI
without the static server, layout-centering/icon-rhythm fixes with
regenerated visual snapshots, Debian trixie + dependency upgrades, the
Medium-style dark theme, and the Node 24 → 26 upgrade.
