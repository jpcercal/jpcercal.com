# PR previews

Every same-repository PR to `main` is published at
`https://staging.jpcercal.com/pr-<number>/` by `.github/workflows/pr-preview.yml`.
A single sticky comment on the PR carries the URL. Closing the PR removes the
directory from `gh-pages`.

| Changed paths | Path | What runs |
|---|---|---|
| Only `content/`, `layouts/`, `assets/`, `i18n/`, `data/`, `archetypes/`, `design-system/`, `static/fonts/`, `docs/`, `README.md`, `AGENTS.md`, `LICENSE` | fast | Prebuilt `:latest` CI image, Hugo, `bin/build-images.sh` with `SKIP_IMAGE_OPTIMIZATION=1`, Pagefind, publish |
| Anything else (config, `.github/`, `bin/`, `e2e/`, `tests/`, `static/_headers`, unknown paths) | full | Same build with image optimization, then publish |
| `Dockerfile`, `.dockerignore`, `flake.*`, `package*.json`, `nix/**`, `bin/nix-node-modules.sh` | full + image | Also builds the CI image as `:pr-<n>-<sha>` and builds the site in it |

Lint, tests, link checks and Lighthouse stay in `ci.yml` (the required `Build`
check) and run in parallel; the preview never waits for them. The classifier
is `.github/scripts/classify-pr.py`; its lists are explicit and any unlisted
path means `full`. Fork and Dependabot PRs get no preview (their token is
read-only).
