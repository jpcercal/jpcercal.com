# Cloudflare Pages production deployment

Production is a **Direct Upload** project (`jpcercal-dot-com`, domain
`jpcercal.com`). Cloudflare never builds the site: `ci.yml` builds `public/`
and the `deploy` job uploads it with Wrangler. Git integration must stay off,
otherwise Cloudflare would also run its own build.

## Flow (push to `main` only)

`image` -> `build` (clean prod build, gates, `public` artifact) -> `deploy`
-> `cloudflare-pages` (`bin/verify-pages.sh` against the live site; it fails
the workflow but does not roll back the deploy).

| Setting | Value |
| --- | --- |
| Build command | `BASE_URL=https://jpcercal.com/ npm run build` then `npm run images`, `npm run search:index` (CI; `npm run build` now fails fast if `BASE_URL` is empty) |
| Output directory | `public` (checked with `test -f public/index.html` before upload) |
| Production branch | `main` (`--branch=main`) |
| Deployment metadata | commit SHA and first line of the message, so deploys are identifiable and can be rolled back from the dashboard |

## Required secrets and variables

Set as GitHub repository secrets; nothing is stored in the repo.

- `CLOUDFLARE_API_TOKEN` - token with *Account > Cloudflare Pages > Edit* only.
- `CLOUDFLARE_ACCOUNT_ID` - required; Wrangler cannot infer the account in CI.
- `CLOUDFLARE_PROJECT_NAME` is a plain workflow `env` value (not secret).
- The Web Analytics token lives in `config.yaml` params (public by design).

The Pages project must exist before the first deploy (create it once in the
dashboard or with `wrangler pages project create jpcercal-dot-com
--production-branch main`). The old "create if missing" step swallowed auth
errors and was removed, so a bad token or missing project now fails the
deploy with the real Cloudflare message.

## Concurrency and timeouts

`deploy` uses the `cloudflare-pages-production` concurrency group with
`cancel-in-progress: false`: deploys run one at a time, a running upload is
never killed, and only the newest queued run survives. All jobs have
`timeout-minutes`.

## Headers (`static/_headers`)

- Immutable (1 year): `/css/*`, `/js/*`, `/fonts/*` (fingerprinted or
  versioned names), `/pagefind/{fragment,index,filter}/*` (content-hashed).
  `pagefind.js` and `pagefind-entry.json` keep stable names, so they use the
  default revalidation.
- `/images/*`: 1 day plus `stale-while-revalidate` 7 days (not fingerprinted).
- HTML keeps Cloudflare's default (revalidate), so new posts appear at once.
- Every response: `X-Content-Type-Options`, `Referrer-Policy`, HSTS
  (`max-age=31536000`, no `includeSubDomains`/`preload`, since staging is a
  separate host and preload is hard to undo), `X-Frame-Options: DENY`,
  `Permissions-Policy`, `Cross-Origin-Opener-Policy: same-origin`.
- **No CSP yet.** The inline theme-init script, JSON-LD and analytics snippet
  need hashes/nonces first; add `Content-Security-Policy-Report-Only` before
  enforcing.

`bin/verify-pages.sh` asserts the font cache header, the six security headers,
and that `_headers`/`_redirects` are not publicly served.

## Redirects and routing (`static/_redirects`)

Only static 301s (`/posts/`, retired categories/tags). Sources are listed with
and without trailing slash because Pages matches literally. Limits: 2000
static + 100 dynamic rules; currently well under.

**No SPA fallback, deliberately.** This is a static multi-page site; unknown
URLs must return the real `404.html` with status 404 (gated by
`verify-pages.sh`). A `/* /index.html 200` rule would turn every broken link
into a soft-404 and harm SEO.

## Not covered

Preview pipeline fixes (`ci.yml` preview-staging auth, gh-pages race) belong to
the staging task. Cache hit rates and job durations were not measured.
