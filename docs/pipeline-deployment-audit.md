# Pipeline and deployment audit

Scope: build, CI/CD and deployment of jpcercal.com at `main` @ `0de494132`.
Read-only review of `ci.yml`, `pr-preview.yml`, `dependency-locks.yml`,
`static/_headers`, `static/_redirects`, `bin/verify-pages.sh`,
`package.json`, `docs/ci-cd.md`. Nothing was executed against Cloudflare or
GitHub; findings come from reading the configuration. Items marked
"verify" need a quick check with `curl -I` on the live site before fixing.

## 1. Deployment target map

| Target | Host | Platform | Trigger | Workflow / job | Output |
|---|---|---|---|---|---|
| Production | `jpcercal.com` | Cloudflare Pages project `jpcercal-dot-com` (Direct Upload, no CF build) | push to `main` | `ci.yml`: `image` -> `build` -> `deploy` -> `cloudflare-pages` (verify) | `public/` built with `BASE_URL=https://jpcercal.com/`, uploaded by `wrangler pages deploy public` |
| Staging (PR preview) | `staging.jpcercal.com/pr-<n>/` | GitHub Pages, `gh-pages` branch, per-PR directory | same-repo PR opened/synchronize/reopened/closed | `pr-preview.yml`: `classify` -> `build-fast`/`build-full` -> `Build` gate -> `publish` -> `comment`; `cleanup` on close | `public/` built with `--buildDrafts`, PR baseURL, design-system, `CNAME` removed |
| Staging (bot PRs) | same | same | `workflow_dispatch` with `pull_request_number` | `ci.yml` `preview-staging` | same as above |
| Local/e2e | `localhost` | `python3 -m http.server` on `public/` | `npm run e2e` | Playwright | localhost-baseURL build; never an artifact |

Key asymmetry: staging (GitHub Pages) ignores `_headers` and `_redirects`.
Header and redirect behavior can therefore only be verified on production.
The 404 page, the `/posts/` redirects and every cache header are untestable
in previews.

## 2. Findings, prioritized

Priority: P1 = fix first (real risk or large payoff), P2 = worthwhile,
P3 = polish. Effort: S under 1h, M a few hours.

### P1

**1. Production deploys can run out of order or in parallel.**
`ci.yml` has no `concurrency` block. Two quick merges run two pipelines;
the slower one can finish `deploy` last and publish older content over newer.
Fix: top-level `concurrency: { group: ci-main-${{ github.ref }}, cancel-in-progress: false }`
(do not cancel, a half-finished deploy is worse), or at least on `deploy`.
Keep PR-dispatch runs in a separate group. Effort S.

**2. No security headers beyond two.**
`_headers` sends only `X-Content-Type-Options` and `Referrer-Policy`.
Missing: `Strict-Transport-Security`, `Permissions-Policy`,
`X-Frame-Options` / `frame-ancestors`, `Cross-Origin-Opener-Policy`, CSP.
Fix: add HSTS (start `max-age=31536000`; add `includeSubDomains` and
`preload` only after checking every subdomain, including `staging`, serves
HTTPS), `Permissions-Policy` denying camera/mic/geolocation/etc.,
`X-Frame-Options: DENY`, `Cross-Origin-Opener-Policy: same-origin`.
CSP needs care: the site has inline scripts (theme init in `head-assets.html`,
JSON-LD, the 404 path script, the Cloudflare beacon snippet) and the beacon
loads from `static.cloudflareinsights.com`. Ship it as
`Content-Security-Policy-Report-Only` first, or use `script-src` hashes
generated at build time. Do not use `'unsafe-inline'` for scripts.
Add assertions to `verify-pages.sh` (it currently checks no security header).
Effort S for the simple headers, M for CSP.

**3. Webfonts have no long cache lifetime.**
`_headers` covers `/css/*`, `/js/*`, `/pagefind/*` and `/images/*` but not
`/fonts/*`. Fonts are versioned by filename (`pt-serif-v19-...woff2`) and
preloaded on every page, so `/fonts/*` should be
`public, max-age=31536000, immutable`. Verified live: `curl -I` on `/fonts/pt-serif-v19-latin-400.woff2` returns
`cache-control: public, max-age=14400, must-revalidate`, i.e. a 4h lifetime
with revalidation. The homepage also returns no `strict-transport-security`,
`x-frame-options` or `permissions-policy` header. Because
`font-display: optional` is used, a slow font fetch means the fallback face
for that view, so this affects the rendering the site cares about.
Effort S.

**4. The production artifact is built twice and the first build is wasted.**
`build` runs Playwright smoke tests, which rebuild `public/` with localhost
URLs, then runs the production build, images and Pagefind again. That is by
design (AGENTS.md landmine), but it means the pre-deploy gates (links, LHCI)
run on the second build while e2e ran on a different one. Option: build
production once, serve it for e2e on a path-agnostic baseURL, and drop the
second build; or keep the design and split e2e into its own parallel job so
wall time falls. Effort M. Do not change before measuring job durations.

**5. Deploy has no timeout, no retry and a hard dependency on a "create project" step.**
`deploy` and `cloudflare-pages` have no `timeout-minutes` (default is 6h);
`ci.yml` has none on any job, unlike `pr-preview.yml`. A hung Wrangler or an
unreachable site (`verify-pages.sh` waits up to 5 min then continues) can
hold the concurrency group. Fix: add `timeout-minutes` to every job (for
example image 30, build 30, deploy 10, verify 20). The
`wrangler pages project create` step with `continue-on-error` hides real
failures (bad token, wrong account) behind the later deploy error; remove it
once the project exists, and remove the `project list` diagnostic from the
hot path. Effort S.

### P2

**6. Verification runs after deploy, so a bad deploy is live before it is detected.**
Documented and accepted (locked decision 8), but there is no rollback path.
Cheaper option: deploy to a Pages preview branch first
(`wrangler pages deploy public --branch=verify`), run `verify-pages.sh`
against the `*.pages.dev` branch URL, then promote by deploying to `main`.
Needs `BASE_URL` plumbing in the beacon gate (the beacon renders only on
the prod host, so that one check must be skipped for previews). Alternative:
document the rollback (Cloudflare dashboard -> Deployments -> rollback) in
`docs/ci-cd.md`. Effort M (promote flow) or S (doc).

**7. `--commit-dirty=true` and no commit metadata.**
The container checkout is not necessarily a git work tree Wrangler can read,
so deployments in the Cloudflare dashboard may show no commit hash/message.
Pass `--commit-hash="$GITHUB_SHA"` and `--commit-message` (first line of the
commit subject, sanitized) and `--branch=main`. Makes rollbacks identifiable.
Effort S.

**8. `/images/*` cache is only one day.**
Images under `/images/` are not fingerprinted by Hugo (copied from
`assets/images/` by `bin/build-images.sh`), so a day is a reasonable safe
default, but post images served from page bundles under their own paths and
favicons fall under `/*`, which has no `Cache-Control`. Add
`stale-while-revalidate` (`max-age=86400, stale-while-revalidate=604800`)
for `/images/*`, and consider fingerprinting. Verify actual paths of post
bundle assets first (`curl -I` on a post cover). Effort S.

**9. `_redirects` is hand-maintained with duplicate slash/no-slash pairs.**
~60 lines, each source listed twice, and Pages matches literally. Risky to
edit by hand and easy to forget the `/en/` counterpart. Pages allows 2000
static redirects, so there is no limit pressure. Fix: generate the file from
one table at build time (Hugo template or a small script), or add a check to
`bin/check-artifact.sh` that every non-`/en/` rule has its `/en/` twin and
slash variant. Effort S for the check.

**10. Staging has no failure-path cleanup race protection, and `ci.yml` bot publish does not retry.**
Already listed in `docs/ci-cd.md` Known gaps: bot `preview-staging` and
`publish` both push to `gh-pages`; only `publish` retries. Fix: make
`preview-staging` call `.github/scripts/preview-pages.sh` as well, or give
both a shared `concurrency: gh-pages-publish` group. Effort S.

**11. Build caching.**
- Docker layers: cached via `type=gha` (good). The cache is shared per
  branch scope, with a 10 GB repo cap; `mode=max` can evict other caches.
  Watch usage; consider `type=registry` cache in GHCR instead.
- Hugo resource cache (`resources/_gen`, Tailwind/Sass output) is not
  restored: CI runners are cold (noted in AGENTS.md as a collision source).
  For production keep cold on purpose; for PR previews caching
  `$HUGO_CACHEDIR` keyed on `hashFiles('assets/**', 'config.yaml')` would save
  seconds, but add only if preview build time shows up as a problem.
- Pagefind index and image optimization run on every build. Image
  optimization is already skipped on the fast preview path.
Effort: nothing needed now; measure first.

**12. `verify-pages.sh` checks cache and compression but not headers it should.**
Extend with: HSTS present, `nosniff`, `Referrer-Policy`, `/fonts/*` immutable,
redirect targets (`/posts/` -> `/` 301, one retired tag), and `/_headers`
and `/_redirects` not publicly served (Pages serves neither; confirm 404).
Effort S.

### P3

**13. Version drift in docs.** `AGENTS.md` says Wrangler `4.147.0`;
`package.json` pins `4.149.0`. Update the doc, or add a CI step comparing
them. Effort S.

**14. Literal `Authorization: Bearer ***` in `preview-staging`** (confirmed:
`ci.yml:200`, `grep -n Bearer`). It is a redacted placeholder, not
`$GH_TOKEN`, so the PR-verification `curl --fail` gets a 401 and bot-dispatched
previews fail at the first step. Fix: `-H "Authorization: Bearer $GH_TOKEN"`
(the step already sets `GH_TOKEN`). Move this to P1 for the pipeline PR.
Effort S.

**15. No SPA fallback needed.** The site is a static multi-page Hugo build
with a real `404.html`; Pages serves it for unknown paths with a 404 status
(gated by `verify-pages.sh`). Adding `/* /index.html 200` would be wrong: it
would turn missing pages into soft 404s and break SEO. Record this as a
deliberate decision.

**16. Output directory is correct.** `publishDir: public`, Wrangler uploads
`public`, the artifact contains `_headers` and `_redirects` copied from
`static/`. `public/CNAME` is shipped in production (harmless on Pages) and
removed for staging. No change needed.

**17. Environment variable handling.** `BASE_URL` is required by
`npm run build` but is not validated: an unset value passes
`--baseURL ""` to Hugo and produces a working-looking build with wrong
canonical URLs. Fix: `: "${BASE_URL:?BASE_URL is required}"` in the script.
Secrets are limited to `CLOUDFLARE_API_TOKEN`/`CLOUDFLARE_ACCOUNT_ID` in the
`deploy` job only (good). Use a GitHub Environment named `production` with
the secrets attached, so they are scoped and a required reviewer is possible.
Effort S.

**18. Slow-asset handling is already strong.** Fingerprinted CSS/JS, Pagefind
chunks immutable, local preloaded WOFF2, Brotli/Zstd negotiated, HTTP/3
verified. Remaining gap is item 3 (fonts cache) and item 8.

## 3. Suggested PR split

Matches the existing child tasks.

1. Production (Cloudflare) PR: items 2, 3, 8, 12, 17 (validation part),
   plus Wrangler flags from item 7. Files: `static/_headers`,
   `bin/verify-pages.sh`, `package.json` build script, `docs/ci-cd.md`.
2. Pipeline reliability PR: items 1, 5, 7, 10, 17 (GitHub Environment),
   13. Files: `.github/workflows/ci.yml`, `docs/ci-cd.md`, `AGENTS.md`.
3. Optional follow-ups: 4, 6, 9, 11 after measuring job durations.

Required environment documentation: `BASE_URL` (all builds),
`CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` (deploy only),
`CLOUDFLARE_PROJECT_NAME` (workflow env, not secret).

## 4. Not verified

- Item 8 post-bundle asset paths and cache headers (item 3 and the missing
  security headers were confirmed with `curl -I`; a zone-level Cloudflare
  setting could still add HSTS elsewhere, none was seen on `/`).
- Actual job durations and cache hit rates: pull from the Actions run history
  before deciding on items 4 and 11.
