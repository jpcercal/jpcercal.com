# CI/CD audit: PR vs `main` behaviour (task t_61b9eaa2)

Audit date: 2026-10-24, against `origin/main` @ `71484e674`. Read-only: no
pipeline file was changed. Live facts (GitHub API, `curl`, `git ls-tree
origin/gh-pages`) are marked **[live]**; everything else is from the files.

Files audited: `.github/workflows/ci.yml` (330 lines),
`.github/workflows/dependency-locks.yml` (54), `.github/dependabot.yml` (24),
`Dockerfile` (29), `.dockerignore`, `package.json`, `flake.nix`,
`nix/toolchain.nix`, `bin/*`, `static/_headers|_redirects|CNAME`,
`config.yaml`, `playwright.config.js`, `lighthouserc.json`, `README.md`.
There is no Makefile and no deploy script outside `ci.yml`.

## TL;DR

* Per-PR previews at `https://staging.jpcercal.com/pr-<n>/` **already exist**
  (`ci.yml:162-249`). The work is hardening them and making them faster, not
  building them.
* Path-prefix base URL handling is already correct (`--baseURL` at
  `ci.yml:227`).
* Problems found, in order of severity:
  1. **No cleanup on PR close.** `gh-pages` holds 74 `pr-*` directories and
     ~1.44 GB of tracked blobs **[live]**. GitHub documents a 1 GB limit for
     published Pages sites, so this needs attention. Builds still succeed
     today.
  2. **`workflow_dispatch` previews are published to the wrong directory.**
     `ci.yml:246` uses `github.event.number`, which is empty for dispatches
     (line 180 correctly falls back to `inputs.pull_request_number`). There
     is a stray `pr-/` directory on `gh-pages` (2523 files, 28.8 MB)
     **[live]**.
  3. **Previews are indexable.** The PR build emits no `noindex` and
     `gh-pages` root `robots.txt` is `User-agent: *` with no `Disallow`
     **[live]**.
  4. **No `concurrency`.** Parallel PR jobs push to the same `gh-pages`
     branch, and nothing cancels superseded runs.
  5. **Preview waits on the full `Build` job** (`ci.yml:165`), so it is
     published only after e2e, lint, link check and Lighthouse finish.
  6. **PR runs overwrite the mutable `:latest` GHCR tag** (`ci.yml:60`) and
     fork PRs cannot log in to push (read-only token).

## 1. Triggers

| Event | Source | What runs |
|---|---|---|
| `pull_request` → `main` (default types: opened, synchronize, reopened) | `ci.yml:6-7` | `image` → `build` → `preview-staging` |
| `push` → `main` | `ci.yml:4-5` | `image` → `build` → `deploy` → `cloudflare-pages` |
| `workflow_dispatch` (input `pull_request_number`) | `ci.yml:8-13` | Same as PR if the number is set (`ci.yml:167`); bot-only path, see below |
| `schedule` 09:00 daily / 10:00 Mondays UTC, `workflow_dispatch` | `dependency-locks.yml:6-9` | Dependency lock bot, only on `refs/heads/main` (line 34) |
| Dependabot weekly (npm, github-actions, docker) | `dependabot.yml` | Opens PRs, which then hit the normal PR trigger |

* There are **no `paths` / `paths-ignore` filters and no `concurrency` block**
  in `ci.yml`. Every PR push runs everything.
* The `workflow_dispatch` route exists because commits made with
  `GITHUB_TOKEN` do not trigger `push`/`pull_request` workflows
  (`ci.yml:182-184`, `dependency-locks.yml:3-5`).
* Branch protection on `main` **[live]**: required check is `Build` only,
  `enforce_admins` is on, no required PR reviews, no rulesets. Repo Actions
  default workflow permission is `write`. Each job still declares its own
  `permissions:`.

## 2. Jobs and steps (`ci.yml`)

Workflow `env` (lines 15-20): `BASE_URL=https://jpcercal.com/`,
`CLOUDFLARE_PROJECT_NAME=jpcercal-dot-com`, `IMAGE_NAME`. Default shell is
bash (`BASH_ENV` loads the Nix env).

### `image` (28-63), runs on PR and main

Checkout → Buildx → GHCR login (`GITHUB_TOKEN`, `packages: write`) →
`docker/build-push-action` with `push: true`, tags `:latest` and `:<sha>`,
GHA cache (`cache-from/to type=gha`). The Dockerfile (builder stage lines
5-16) runs `nix flake check` (including a real Chromium launch) and exports
the runtime closure into a Debian base. The output is the immutable `digest`
that every later job pins (`ci.yml:73`, `172`, `262`, `310`).
Measured with a warm cache: **16 s** (run 40085980313 **[live]**).

### `build` (65-160), runs on PR and main, required check `Build`

1. Checkout, `ln -s /opt/ci/node_modules node_modules` (zero install,
   83-87).
2. `python3 -m unittest discover -s tests` (89-90): dependency-updater
   safety tests.
3. `npm run e2e -- e2e/smoke.spec.js` (92-95): Playwright. The web server
   in `playwright.config.js:19` does its own `npm run build && npm run
   images && npm run search:index`, i.e. a **full throwaway site build with
   localhost URLs**. Traces are uploaded on failure (97-103).
4. `npm run build` (105-106): `rm -rf public` + `hugo --minify
   --printUnusedTemplates --baseURL "$BASE_URL"` (`package.json:22`), a
   second full Hugo build.
5. `bin/build-images.sh` (108-109): image copy, oxipng/mozjpeg, oxvg, resvg
   512 px covers.
6. `npm run search:index` (111-112): Pagefind, then prunes unused UI files
   (`package.json:25`).
7. Gates, all blocking: `npm run lint` (Biome, 114-115), `validate:html`
   (117-118), `validate:xml` (120-121), `lychee` link check with prod→local
   `--remap` (123-129), `bin/check-artifact.sh` (131-132: prod isolation,
   `public/design-system` absent, no retired trackers, plus
   `bin/check-bilingual.py`), Lighthouse CI (134-143; `lighthouserc.json`:
   `/`, `/en/` and one post, 3 runs each, perf and SEO ≥ 0.9 are errors,
   a11y and best-practices are warnings; uploads to `temporary-public-storage`).
8. Uploads `lighthouse-reports` (145-153) and the `public` artifact (155-160,
   7-day retention).

Measured duration: **~4 min 50 s** (run 40085980313 **[live]**).

### `preview-staging` (162-249), PR only

* `if:` PR event, or dispatch with a PR number (167). `needs: [build,
  image]`. `permissions: contents: write, packages: read`.
* `PR_BASE_URL=https://staging.jpcercal.com/pr-<number>/` (180).
* For dispatches only: validates the number, open state, base `main`,
  same-repo head and exact head SHA through the REST API (185-206).
* Checkout, link `node_modules`.
* Staging build (217-231): `cp -r design-system content/design-system`;
  `hugo --buildDrafts --minify --baseURL "$PR_BASE_URL"`;
  `bin/build-images.sh`; `npm run search:index`; `rm -f public/CNAME`.
  Note this build is **new**; the `public` artifact from `build` is not
  reused because it has the prod base URL.
* Presence check (233-238), `continue-on-error: true`, three `test -f`s.
* `peaceiris/actions-gh-pages@v4` (240-249): `publish_dir: ./public`,
  `publish_branch: gh-pages`, `destination_dir: pr-${{ github.event.number }}`,
  `keep_files: true`, `cname: staging.jpcercal.com`.
* Measured duration: **~2 min 40 s**. Total PR time to "files on `gh-pages`":
  ~8 min, plus a separate `pages-build-deployment` run on `gh-pages`
  (latest build status `built` **[live]**).

### `deploy` (251-299), `main` push only

Guard `github_event == push && ref == refs/heads/main` (256). Needs `build`.
Downloads the `public` artifact built with the prod base URL, then:
`wrangler pages project list` (diagnostic, 283-289), idempotent
`wrangler pages project create jpcercal-dot-com --production-branch main`
(`continue-on-error`, 291-296), then
`wrangler pages deploy public --project-name=... --commit-dirty=true`
(298-299). Direct Upload, no Cloudflare build quota. Secrets:
`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` (the only two repo secrets
**[live]**). Wrangler is `4.149.0` (`package.json:16`); `README.md:163` and
`AGENTS.md:150` still say 4.147.0 (doc drift).

### `cloudflare-pages` (301-330), `main` push only, after `deploy`

`bin/verify-pages.sh` against the live site: propagation wait, br/zstd
compression, HTTP/2 and HTTP/3 headers, asset checks, link check, Lighthouse
and so on. It fails the workflow but cannot gate the deploy (it runs after).

### `dependency-locks.yml`

Runs `nix/update-dependencies.py` on trusted `main` only, and writes lockfile
PRs / dispatches CI on them. It needs `contents`, `pull-requests` and
`actions: write` (26-29) and the repo setting "Allow GitHub Actions to create
and approve pull requests". It has its own `concurrency` group (22-24). It is
the only workflow that already uses `concurrency`.

## 3. How the site is published today

**Production** `https://jpcercal.com`: Cloudflare Pages project
`jpcercal-dot-com` via Wrangler Direct Upload from the `deploy` job. HTTP
response **[live]**: `server: cloudflare`, `alt-svc: h3`, `cf-cache-status:
DYNAMIC`. Headers/redirects come from `static/_headers` (13 lines) and
`static/_redirects` (4 lines: `/posts/` and `/en/posts/` 301 to the indexes).
Those two files are **Cloudflare-Pages-only**. `static/CNAME` (`jpcercal.com`)
is a GitHub-Pages leftover that ships in the prod artifact and is stripped for
staging (`ci.yml:231`).

**Staging** `https://staging.jpcercal.com`: GitHub Pages, legacy branch build,
source `gh-pages` branch, path `/`, custom domain `staging.jpcercal.com`,
`build_type: legacy`, `https_enforced: false` (`gh api .../pages` **[live]**).
DNS is a Cloudflare-proxied record: the hostname resolves to Cloudflare IPs
(`104.21.x`, `172.67.x`), and responses carry both `server: cloudflare` and
`x-github-request-id` / `via: 1.1 varnish`, i.e. Cloudflare proxy in front of
GitHub Pages. There is no server, bucket or custom reverse proxy of our own.
`README.md:178-179` documents `CNAME staging → <user>.github.io`.

Layout of the `gh-pages` branch **[live]**:

* Root: a **stale copy of the pre-migration site** (≈1558 files, 86 MB, root
  `index.html`, `404.html`, `robots.txt`, `.nojekyll`) plus `CNAME` =
  `staging.jpcercal.com`. `https://staging.jpcercal.com/` serves this legacy
  home page. The root `404.html` is the only 404 Pages will ever serve, so
  `/pr-<n>/unknown` gets the legacy 404, not the new one.
* 74 `pr-*` directories (48-125, with gaps) plus the stray `pr-/`. Each is a
  full site build: ~26 MB / 1261 files for current PRs. `keep_files: true`
  means they accumulate forever.
* Tracked blob total: **1.44 GB** across 68k+ files (the Git tree API reports
  `truncated: true`).
* Only `peaceiris` writes it, one `deploy: <sha>` commit per PR push.
  `CNAME` exists once at the root; none inside `pr-*` dirs.

Consequences of GH Pages as the staging host: `_headers`, `_redirects` and
`config.yaml` caching have no effect on previews (no compression tuning, no
cache headers, `max-age=600`), previews are all under one origin (shared
`localStorage`, cookies), and custom headers like `X-Robots-Tag` are not
possible.

## 4. What needs what

### 4a. Docker image rebuild / toolchain change

The image's inputs are exactly the `.dockerignore` allow-list
(`.dockerignore:3-12`) and `Dockerfile:7-9`:

```
Dockerfile
.dockerignore
flake.nix
flake.lock
package.json
package-lock.json
nix/**
bin/nix-node-modules.sh
```

Any change here changes the `image` job's cache key and produces a new image
digest. With the warm GHA cache and unchanged inputs the job takes ~16 s
(measured), so it is cheap but is not free: it also does a registry login and
push on every run.

### 4b. Pipeline / infra changes (no image rebuild, but not "content")

```
.github/workflows/**        .github/dependabot.yml
static/_headers             static/_redirects        static/CNAME
config.yaml                 # Hugo build config + security.exec.allow
lighthouserc.json  .lychee.toml  .htmlvalidate.json  biome.json
playwright.config.js        e2e/**   tests/**
bin/**  (except nix-node-modules.sh, which is in 4a)
.envrc  .node-version  .env.dist
```

### 4c. Site-wide rendering (needs a full build, no infra change)

```
layouts/**   assets/**   i18n/**   data/**   archetypes/**   design-system/**
```

These change every page, so previews must rebuild everything. The image
pipeline (`assets/images/**`) also feeds `bin/build-images.sh`.

### 4d. Content-only

```
content/**                 # posts, authors, search/contact _index files, post assets
static/fonts/**            # vendored fonts (also a static asset)
README.md  docs/**  AGENTS.md  LICENSE  *.png  (repo-root screenshots)
```

Content-only PRs do not need a new image, the dependency tests or Lighthouse
to produce a correct preview. `content/**` changes **do** still need the full
Hugo + images + Pagefind pipeline to preview correctly, because the images
are produced from the content bundles and the search index spans all posts.
There is no incremental output in this repo, and I did not find a cheaper
partial build that would keep search and covers correct.

### 4e. Caveat on path filters

`Build` is the **required status check** for `main`. A workflow-level
`on.pull_request.paths-ignore` would leave `Build` "expected" but never
reported on skipped PRs, which blocks merging. Therefore do not put path
filters at the `on:` level. Use a `changes` job inside the same workflow and
job-level `if:` (skipped jobs report success on required checks only when the
job itself, not the whole workflow, is skipped; verify on a throwaway PR).

## 5. Proposal: per-PR previews at `staging.jpcercal.com/pr-<n>/`

Keep GitHub Pages `gh-pages` plus the Cloudflare proxy. It already serves
every PR path, needs no new secret, and moving to Cloudflare Pages preview
deployments would need a second project, new DNS and a token with edit access
on every PR (see "Alternative" below). The changes below are incremental.

### 5.1 Base URL handling (already works; keep)

* Build with `hugo --buildDrafts --minify --baseURL
  "https://staging.jpcercal.com/pr-<n>/"` (**trailing slash required**).
  Hugo then emits `/pr-<n>/…` root-relative `RelPermalink` and absolute
  `Permalink`; `config.yaml:63-64` keeps `relativeURLs/canonifyURLs: false`.
  Confirmed live: `https://staging.jpcercal.com/pr-117/` has
  `rel=canonical` at the prefixed URL, and tag links in the PR HTML use
  `/pr-117/tags/...`.
* Search works under the prefix because `assets/js/search.js:53-56` derives
  `basePath` from the page URL; `bin/check-bilingual.py` derives the base from
  the output.
* Not available under a prefix: `_headers`, `_redirects`, root `robots.txt`,
  custom 404 (see section 3). Do not rely on them in previews.
* Fix the number source in one place: define `PR_NUMBER: ${{
  github.event.number || inputs.pull_request_number }}` in the job `env` and
  use it for both `PR_BASE_URL` (line 180) and `destination_dir` (line 246,
  currently `github.event.number` only).

### 5.2 Directory layout on `gh-pages`

```
/                     CNAME, legacy site, root robots.txt, .nojekyll   (do not touch from PR jobs)
/pr-<n>/              full preview build, replaced on every push (no stale files)
```

Use `peaceiris` with `destination_dir: pr-<n>` and **`keep_files: false`**.
`destination_dir` scopes the clean to that subtree, so unrelated PRs and the
root are kept while files deleted in the PR do not linger (today
`keep_files: true` at line 247 leaves stale files in `pr-<n>/`). Use
`commit_message: "preview: pr-<n> @ <sha>"` and `force_orphan: false`.

Add `concurrency: { group: staging-gh-pages, cancel-in-progress: false }` to
the publish job and to the cleanup workflow so pushes serialise (the action
does fetch, commit, push, and parallel pushes to one branch can be rejected as
non-fast-forward). Add a separate workflow-level group per PR with
`cancel-in-progress: true` (`ci-${{ github.workflow }}-${{
github.event.pull_request.number || github.ref }}`) for the `pull_request`
event only, so superseded pushes never publish old content.

### 5.3 Cleanup on PR close

New file `.github/workflows/preview-cleanup.yml`:

```yaml
name: Preview cleanup
on:
  pull_request:
    types: [closed]          # merged or abandoned
    branches: [main]
permissions:
  contents: write            # push to gh-pages
concurrency:
  group: staging-gh-pages    # same group as the publisher
  cancel-in-progress: false
jobs:
  remove-preview:
    # Same-repo PRs only; fork PRs never publish a preview.
    if: github.event.pull_request.head.repo.full_name == github.repository
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
        with: { ref: gh-pages, fetch-depth: 1 }   # token persists for the push
      - env:
          PR_NUMBER: ${{ github.event.pull_request.number }}
        run: |
          [[ "$PR_NUMBER" =~ ^[1-9][0-9]*$ ]]
          if [ -d "pr-$PR_NUMBER" ]; then
            git rm -r --quiet "pr-$PR_NUMBER"
            git -c user.name=github-actions[bot] -c user.email=41898282+github-actions[bot]@users.noreply.github.com \
              commit -m "preview: remove pr-$PR_NUMBER"
            for i in 1 2 3; do git push && break || { git pull --rebase; sleep $((i*5)); }; done
          fi
```

It runs from the base branch's workflow definition, so PR code never executes
with the write token. The number is regex-validated before use in a path.
It must **not** check out or run the PR head.

One-time sweep (manual, separate PR/step): remove `pr-` and every `pr-<n>`
whose PR is closed (`gh pr list --state closed --json number`). Of the 74
directories, only open PRs listed in `gh pr list --state open` should remain.
Deleting directories does not shrink history; if `.git` size becomes a
problem, take a one-off `git checkout --orphan` squash of `gh-pages` while no
publish is running.

### 5.4 Exact path filters

Do **not** use `on.*.paths` (4e). Add a `changes` job at the start of
`ci.yml`:

```yaml
changes:
  runs-on: ubuntu-latest
  permissions: { contents: read }
  outputs:
    toolchain: ${{ steps.f.outputs.toolchain }}
    pipeline:  ${{ steps.f.outputs.pipeline }}
  steps:
    - uses: actions/checkout@v7
      with: { fetch-depth: 0 }
    - id: f
      run: |
        base=$(git merge-base origin/main HEAD)   # PR events; main pushes run everything
        files=$(git diff --name-only "$base" HEAD)
        grep -qE '^(Dockerfile|\.dockerignore|flake\.(nix|lock)|package(-lock)?\.json|nix/|bin/nix-node-modules\.sh)' <<<"$files" && t=true || t=false
        grep -qE '^(\.github/|static/(_headers|_redirects|CNAME)|config\.yaml|lighthouserc\.json|\.lychee\.toml|\.htmlvalidate\.json|biome\.json|playwright\.config\.js|e2e/|tests/|bin/)' <<<"$files" && p=true || p=false
        echo "toolchain=$t" >> "$GITHUB_OUTPUT"; echo "pipeline=$p" >> "$GITHUB_OUTPUT"
```

Use (these are proposals for the implementation task):

| Condition | Effect |
|---|---|
| `toolchain == true` or `push` to `main` | Build and push the image as today. Otherwise keep the image job (cheap, cached) but **stop pushing `:latest` from PR runs** (`ci.yml:60`) and skip `push` for fork PRs; tag PR images by `:<sha>` only. |
| PR and `toolchain == false` and `pipeline == false` (content/layout/asset only) | Preview job runs standalone (no `needs: build`): staging build → publish → URL check. Skip tests, e2e, lint, lychee, Lighthouse, `unittest`. |
| PR and (`toolchain` or `pipeline`) true | Keep `build` gates in parallel with the preview, as today. |
| `push` to `main` | Unchanged: `image → build → deploy → cloudflare-pages`. |

Because `Build` is required, keep the `Build` job present and green on every
PR. When running it as "fast mode" it should be a thin job that passes after
the minimum checks, or the repo protection must change to require the new job
name. This is a decision for the owner: **I recommend keeping the full
`Build` as a required check but running it in parallel with the preview
instead of before it**, which removes ~5 min from time-to-preview without
lowering protection. The task description (t_b1471e45) asks for no checks on
PRs, which does reduce protection: it should be an explicit owner decision.

### 5.5 Required secrets and permissions

| Item | Value |
|---|---|
| New secrets | **None.** Preview publish and cleanup use `GITHUB_TOKEN`. `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` stay `main`-only (`deploy` job env, lines 267-268) and must not be exposed to PR jobs. |
| `preview-staging` job | `contents: write` (push `gh-pages`), `packages: read` (pull CI image) as today (168-170). Add `pull-requests: write` only if posting a preview-URL comment (`gh pr comment`), and only for same-repo PRs. |
| `preview-cleanup.yml` | `contents: write`. Nothing else. |
| `image` job | `contents: read`, `packages: write` today (33-35). For fork PRs skip it (the token is read-only and the GHCR login fails). |
| Repo settings | Pages source `gh-pages` / `/` with custom domain `staging.jpcercal.com` (set **[live]**); Actions "Workflow permissions" may stay `write` or be switched to read-only because every job declares permissions; branch protection on `gh-pages`, if added, must allow `github-actions[bot]` pushes. |
| DNS | Cloudflare-proxied `staging` record to the GitHub Pages host (set **[live]**). |

Fork PRs: `contents: write` is not granted to `pull_request` runs from forks,
so previews cannot publish for them. Guard the preview and image jobs with
`github.event.pull_request.head.repo.full_name == github.repository` so they
skip rather than fail. Do not switch to `pull_request_target` to work around
this (`dependency-locks.yml:3-5` makes the same point).

### 5.6 Hardening items to fold into the implementation

1. `noindex` on non-prod hosts: widen the condition at
   `layouts/partials/head-meta.html:104-106` to also emit `<meta name="robots"
   content="noindex">` when `(urls.Parse .Permalink).Host` is not
   `jpcercal.com`, the same host gate as `layouts/partials/analytics-cloudflare.html:7`.
   Also replace the `gh-pages` root `robots.txt` with `User-agent: *` +
   `Disallow: /` (one-off commit to `gh-pages`).
2. Add a non-blocking preview URL check after publish: poll
   `https://staging.jpcercal.com/pr-<n>/` until 200 (Pages deploy takes a short, variable time), then check `/en/` and `/search/`. The current
   "presence check" (233-238) only tests local files.
3. Post/refresh a sticky PR comment with the preview URL (the `pull-requests:
   write` permission above).
4. Optional speed: the `Build` job builds the site twice (Playwright's web
   server and `npm run build`), and the preview builds a third time.
   Letting the preview reuse a single build is blocked by the base URL being
   baked in at build time; a shared `--baseURL` build would need a `sed` over
   absolute URLs, which is fragile and **not recommended**.

### Alternative considered: Cloudflare Pages preview deployments

`wrangler pages deploy --branch pr-<n>` gives `pr-<n>.jpcercal-dot-com.pages.dev`
with automatic cleanup semantics, no 1 GB limit and real `_headers`. But it is
a subdomain (not the requested `/pr-<n>` path), needs `CLOUDFLARE_API_TOKEN` in
PR jobs (exposure risk on a repo that currently keeps it `main`-only), and
retires the existing DNS setup. Rejected for this request, though worth
reconsidering if the 1 GB limit becomes a real blocker.

## Evidence index

| Claim | Where |
|---|---|
| Pages config, CNAME, source branch | `gh api repos/jpcercal/jpcercal.com/pages` |
| 74 `pr-*` dirs, stray `pr-/`, 1.44 GB | `git ls-tree -r -l origin/gh-pages` |
| Job durations | `gh run view 40085980313 --json jobs` |
| Branch protection (`Build` required) | `gh api .../branches/main/protection` |
| Secrets (2 names only) | `gh api .../actions/secrets` |
| Cloudflare in front of GH Pages | `curl -sI https://staging.jpcercal.com/pr-117/` (`server: cloudflare`, `x-github-request-id`, `via: varnish`) |
| No noindex on previews | `curl -s .../pr-117/` has only `rel=canonical`; root `robots.txt` allows all |

Untested: the cleanup workflow and the `changes` job snippets above were
**not** executed (no pipeline files may be modified here). Treat them as
specifications to be proven on a throwaway PR. The behaviour of skipped
jobs vs the required `Build` check (4e) should be verified the same way.
