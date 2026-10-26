# CI/CD

Two workflows, split by trigger. Pull requests get a fast staging preview;
everything that touches production runs only after a merge to `main`.

| Workflow | File | Runs on | Purpose |
|---|---|---|---|
| PR preview | `.github/workflows/pr-preview.yml` | same-repo PRs to `main`: opened, synchronize, reopened, closed | Preview at staging, required `Build` check, cleanup |
| CI (main) | `.github/workflows/ci.yml` | push to `main`; `workflow_dispatch` | Full gates, deploy to Cloudflare Pages, live-site verification |

`dependency-locks.yml` (daily/weekly) syncs Nix/npm locks and dispatches
`ci.yml` for its own PR branches, because commits made with `GITHUB_TOKEN` do
not trigger `pull_request` workflows.

## PR preview

URL: `https://staging.jpcercal.com/pr-<number>/`. A single bot comment on the PR
carries it and is updated in place on every push. Previews are served from the
`pr-<number>/` directory of the `gh-pages` branch; Pages can take about a
minute to refresh after a push.

```
classify -> (image) -> build-fast | build-full -> Build (gate)
                                              \-> publish -> comment
closed:  cleanup
```

### Fast path vs full build

`classify` reads the PR's file list (renames count their old path too) with
`.github/scripts/classify-pr.py`. The lists are explicit; a path that matches
none of them means full.

| Changed files | Result | What runs |
|---|---|---|
| Only `content/`, `layouts/`, `assets/`, `i18n/`, `data/`, `archetypes/`, `design-system/`, `static/fonts/`, `docs/`, `README.md`, `AGENTS.md`, `LICENSE` | **fast** | Prebuilt `:latest` CI image, Hugo, `bin/build-images.sh` with `SKIP_IMAGE_OPTIMIZATION=1`, Pagefind. No Docker build, no checks. The Hugo build takes seconds. |
| Anything else: `config.yaml`, `.github/`, `bin/`, `e2e/`, `tests/`, `static/_headers`, unknown paths | **full** | Same build with full image optimization, in the `:latest` image |
| `Dockerfile`, `.dockerignore`, `flake.nix`, `flake.lock`, `package.json`, `package-lock.json`, `nix/**`, `bin/nix-node-modules.sh` | **full + image** | Also builds the CI image as `:pr-<n>-<sha>` and builds the site inside it |
| Empty or 3000+ file lists | **full** | The files API is capped at 3000 |

Neither path runs lint, HTML/XML validation, link check, Lighthouse, Playwright
or any production step.

### `Build` required check

Branch protection on `main` requires a status check named `Build`. Since
`ci.yml` no longer runs on PRs, the `gate` job in `pr-preview.yml` is named
`Build` and is green only if the fast or full preview build succeeded. For
fork and Dependabot PRs no build runs (read-only token), so it passes with a
warning and is not a build result.

### Safety properties

- `pull_request`, never `pull_request_target`. No repository secrets are used.
- Build jobs have a read-only token and only upload an artifact. Only
  `publish` has `contents: write`; it checks out `gh-pages` sparsely, refuses
  symlinks and an artifact without `index.html`, drops any `CNAME`, and touches
  only `pr-<n>/`.
- Concurrency group `pr-preview-<n>` with cancel-in-progress: a new push
  supersedes the previous run, and closing the PR cancels an in-flight build.
- Pushes from different PRs race on `gh-pages`; `preview-pages.sh` retries from
  a fresh fetch (up to 6 times).
- Only a push to `main` moves the `:latest` image tag, so a PR cannot change
  what other PRs build with.

### Cleanup

On `closed` (merged or abandoned), `cleanup` runs `preview-pages.sh remove <n>`
from the `main` copy of the script (never PR code), which `git rm`s `pr-<n>/`
and pushes. Removing a missing directory is a no-op. Reopening a PR republishes.
Nothing else on `gh-pages` is touched.

## Main pipeline (`ci.yml`)

Runs on every push to `main`, in order: `image` (build and push the Nix-based
CI image to GHCR, tags `:latest` and `:<sha>`) -> `build` (Playwright smoke,
clean production build, lint, HTML/XML validation, link check, artifact checks,
Lighthouse; uploads `public`) -> `deploy` (Wrangler Direct Upload to
Cloudflare Pages, `main` pushes only) -> `cloudflare-pages` (`bin/verify-pages.sh`
against the live site; fails the workflow but does not gate the deploy).
Production steps are unchanged from before the split.

`preview-staging` still exists for one case: the dependency-lock bot dispatches
`ci.yml` with `pull_request_number`, which builds and publishes `pr-<n>/` and
reports `Build` for the bot's branch. It never deploys.

## Secrets and settings

| Name | Used by | Notes |
|---|---|---|
| `CLOUDFLARE_API_TOKEN` | `ci.yml` `deploy` | Only job that sees it; main pushes only |
| `CLOUDFLARE_ACCOUNT_ID` | `ci.yml` `deploy` | Same |
| `GITHUB_TOKEN` | everything else | Automatic. Jobs request their own scopes (`packages`, `contents: write` for publish/cleanup, `pull-requests: write` for the comment) |

Repository settings: Actions may create pull requests (`dependency-locks.yml`);
`gh-pages` is the staging Pages source (`CNAME` `staging.jpcercal.com`); branch
protection requires `Build`. The Cloudflare Web Analytics token lives in
`config.yaml`, is public, and renders only on the production host.

## Known gaps

- PRs no longer run lint, validators, link check, Lighthouse or e2e; failures
  show up only after merge to `main`. Consider a cheap lint/unit job on PRs if
  that is too late.
- Fork and Dependabot PRs get no preview and an unverified `Build` check.
- `cleanup` runs the script from `main`, so closing a PR before the preview
  workflow is merged fails that job (the script is not on `main` yet).
- Stale `pr-*` directories from before the cleanup job (and one stray `pr-/`)
  remain on `gh-pages` until swept manually.

## Running the preview build locally

`.github/scripts/build-preview.sh` is the single definition of the staging
build, used by `pr-preview.yml` (fast/full) and the bot-dispatched
`ci.yml` `preview-staging` (full), which now also publishes through
`preview-pages.sh` (same retry on rejected pushes):

```sh
PR_BASE_URL=https://staging.jpcercal.com/pr-999/ bash .github/scripts/build-preview.sh fast
```

It validates `PR_BASE_URL`, groups log output, checks the output (index,
design-system, Pagefind entry, no `CNAME`, canonical on the PR path, no links
to the production host) and writes a size/page summary to the job summary.
`npm run build` now fails early when `BASE_URL` is unset.
