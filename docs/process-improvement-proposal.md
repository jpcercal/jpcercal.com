# Process improvement proposal

| | |
|---|---|
| Date | 2026-10-26 |
| Status | **Proposal only. Nothing here is implemented.** |
| Repo state | `origin/main @ 0de494132` (every number in this document was re-checked against this commit on 2026-10-26) |
| Sources | Delivery workflow audit (kanban task `t_b335c1e6`, gaps G1–G10) and code-quality / testing / security / observability audit (kanban task `t_93988721`, findings A1–E3) |
| Author | writer agent, kanban task `t_28bd1ae9` |

> **This document contains suggestions for later analysis, not changes.** The
> PR that carries it adds this single Markdown file and touches no code,
> configuration, workflow, or content. If a recommendation below is accepted,
> it gets implemented in its own PR, reviewed against the suggested acceptance
> criteria listed with it.

## 1. Executive summary

Two audits ran against this repository on 2026-10-26. One covered the delivery
workflow: local development, the PR preview pipeline, main CI, the two
dependency bots, branch protection, and docs. The other covered code quality,
testing, security, and observability. This document merges their findings into
21 prioritized candidate improvements in six themes, with a suggested
four-phase sequence in section 4.

The pipeline is fundamentally healthy, and both audits say so. The toolchain is
reproducible and version-asserted through Nix; CI permissions are
least-privilege per job; the safety logic of both dependency bots has stdlib
unit tests that run in CI; PR previews return in about two minutes; production
deploys are followed by a live verification suite of roughly 30 checks. Nothing
found requires undoing an architectural choice.

The gaps share a few patterns:

1. **Quality signal arrives after merge.** The required `Build` check on a PR
   proves only that Hugo rendered. Lint, HTML/XML validation, link checks, e2e,
   and Lighthouse run on main alone, so a broken PR merges green and then turns
   main red.
2. **Cheap security hygiene is still open.** Secret scanning and push protection
   are disabled (both free on public repos). The one third-party action holding
   `contents: write` is pinned to a mutable tag. The locked dependency tree
   carries 25 open advisories, 17 of them high, that Dependabot will mostly
   never propose fixes for because they are transitive-only.
3. **Bot CI is expensive relative to its value.** One day of minor dependency
   bumps cost roughly 1.5 hours of full-pipeline CI because Dependabot has no
   grouping and every bot-dispatched run executes everything.
4. **Agent-facing docs drift.** AGENTS.md is injected into every agent session,
   and four of its factual claims (Wrangler version, Biome version, post counts,
   smoke-test count) are already wrong at current main.
5. **Staging and release operations carry debt.** The `gh-pages` branch is about
   1.4 GB with 79 preview directories, and its root publicly serves a 2020
   legacy site that still loads GA4 and Google Fonts. Production has no rollback
   runbook, no deploy tags, and no failure alerting, and the site is verified
   only in the minutes after a deploy.

Phase 1 (section 4) is five items, each a day or less of work and low-risk:
enable secret scanning, SHA-pin third-party actions, add CI concurrency and
timeouts, correct the drifted doc claims, and sweep stale branches. That
closes the two cheapest security items, the deploy race, and the doc drift
that misleads every agent session. Later phases are sized per item.

One audit finding is already obsolete. The code-quality audit's P1
`destination_dir` bug, where bot-dispatched staging previews published to
`pr-/` and 404'd, was fixed by the preview-pipeline split (#127, #134) that
landed between the two audit baselines; the current `preview-staging` job is
dispatch-gated, uses `inputs.pull_request_number` consistently, and verifies
the PR context before publishing. R9 proposes a structural test to keep it
fixed. The episode is a useful illustration of how fast this repo moves, and of
why R13 (docs freshness) matters.

## 2. Current-state observations

### 2.1 What works and should be kept

- Reproducibility: locked flake, digest-pinned Docker bases, downstream CI jobs
  consuming the GHCR image by immutable digest, zero-install `node_modules`
  linking. Only main pushes move `:latest`, so a PR cannot poison another PR's
  build environment.
- CI security posture: least-privilege per-job permissions, no
  `pull_request_target`, no repository secrets on any PR-path job, and a
  hardened preview publisher (rejects symlinks, strips `CNAME`, scoped to the
  PR directory, push retries).
- Tested safety logic: `tests/test_dependency_updates.py` and
  `tests/test_pr_preview.py` assert the bots' security properties and structural
  workflow guarantees in CI. Few projects at this size test their pipeline's
  safety invariants.
- PR feedback latency: measured fast path of about 2 minutes (classify 7 s,
  build 75 s, publish 15 s, gate 2 s, comment 4 s), with the slow path reserved
  for infrastructure diffs.
- Production gates: artifact-isolation checks (retired-tracker scans of active
  resources only), an exhaustive bilingual pairing gate, and a post-deploy
  live-site verification suite covering compression, HTTP versions, cache
  headers, TTFB, payload and tracker budgets, SEO, live links, and Lighthouse
  scores.
- Honest self-documentation: `docs/ci-cd.md` already lists five known gaps.
  Several recommendations below simply close items the repo has already flagged
  against itself.

### 2.2 Gap themes

| Theme | Findings | Summary |
|---|---|---|
| Quality signal after merge | G1 | PRs run no gates beyond "Hugo rendered"; fork and bot PRs pass `Build` without any build |
| Security hygiene not yet done | A1, A2, A3, A4 | Secret scanning off; mutable action tags; 25 open advisories (17 high); no CSP, frame, or Permissions-Policy headers |
| CI correctness and cost | B2, G3, B3/G7 | No concurrency or timeouts in `ci.yml`; ~1.5 h CI for one day of minor bumps; shellcheck/actionlint packaged but enforced nowhere |
| Testing blind spots | C1, C2, C3/C4 | The only client-side XSS defense has no test; the visual suite is skipped on CI; the bilingual gate is itself untested |
| Documentation drift | G4/D1 | Wrangler, Biome, post counts, and test counts are stale in AGENTS.md/README, and injected AGENTS.md copies can lag main |
| Repo and branch hygiene | G5, G10, D3, G9 | 28 remote branches (~20 stale); no PR template, CONTRIBUTING, or CODEOWNERS; root clutter; several manual rituals |
| Staging infrastructure | G2, D2 | ~1.4 GB `gh-pages`, 79 `pr-*` dirs, legacy GA4/Google-Fonts site at the staging root, bot publish race |
| Release ops and observability | G6, E1, E2/E3 | No rollback story, tags, or alerting; production verified only at deploy time; perf history kept 7 days |

### 2.3 Measured baselines

Reference values for before/after comparison if improvements land. Re-verified
2026-10-26 at `0de494132` unless attributed otherwise.

| Metric | Value |
|---|---|
| PR preview fast path | ~2 min (classify 7 s, build 75 s, publish 15 s, gate 2 s, comment 4 s) |
| Main pipeline | ~11 min (image 31 s, build 418 s, deploy 55 s, live verify 146 s) |
| Bot bump dispatch | 22–27 min each; PRs #147–151 open at time of writing (4 npm bumps + 1 nix update) |
| `npm audit --package-lock-only` | 25 advisories: 17 high, 6 moderate, 2 low |
| Wrangler pin | 4.149.0 (`package.json`); docs say 4.147.0; open PR #148 bumps to 4.152.0; the undici fix ships in 4.153.0 |
| `gh-pages` branch | ~1.4 GB (per `pr-preview.yml` comment, audit-time); 79 `pr-*` directories plus one stray `pr-/` |
| Remote branches | 28 (~20 stale post-merge; 9 `wt/t_*` agent worktree branches) |
| Content | 78 post bundles / 156 article files (docs claim 76/152 and 75/150) |
| Smoke tests | 32 `test()` declarations in `e2e/smoke.spec.js` (AGENTS.md says 18) |
| shellcheck / actionlint | Clean at audit time (0 warnings; 12 benign SC2015 infos in `verify-pages.sh`) |
| i18n key parity | en/pt identical, 36 keys |
| Git tags | None |
| Actions secrets | 2 (`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`), deploy job only |

## 3. Recommended improvements

How to read an item. **Source** refers to audit finding IDs (G = workflow
audit; A–E = code-quality audit). **Priority**: P1 = act soon (real bug, or
cheap and high value), P2 = next quarter, P3 = opportunistic. **Effort**:
XS < 1 h, S ≈ half a day, M ≈ 2–3 days, L > 3 days. **Risk** is the chance
that the change itself breaks something or adds friction, with mitigation
noted inline. Acceptance criteria are suggestions for whoever implements the
item later; adjust them during analysis.

| ID | Recommendation | Theme | Pri | Effort | Risk | Source |
|---|---|---|---|---|---|---|
| R1 | Enable secret scanning and push protection | Security | P1 | XS | near-zero | A1 |
| R2 | SHA-pin third-party GitHub Actions | Security | P1 | XS | low | A2 |
| R3 | Security response headers, including hash-based CSP | Security | P2 | M | medium | A4 |
| R4 | Clear the npm audit backlog; add a lockfile-refresh mode | Dependencies | P1 | S–M | low–med | A3 |
| R5 | Dependabot grouping and lighter bot-dispatch CI | Dependencies | P2 | S | low–med | G3 |
| R6 | Concurrency groups and `timeout-minutes` in `ci.yml` | CI/CD | P1 | S | low | B2 |
| R7 | PR-level quality gates on the preview artifact | CI/CD | P1 | M | medium | G1 |
| R8 | Enforce shellcheck and actionlint in CI | CI/CD | P2 | S | low | B3, G7 |
| R9 | Workflow micro-hardening and a structural parity test | CI/CD | P3 | S | low | B4, B5, B1 (fixed) |
| R10 | Unit tests for the search render/escape helpers | Testing | P2 | S | low | C1 |
| R11 | Run visual regression on CI Linux | Testing | P2 | M | medium | C2, G9 |
| R12 | Test the bilingual checker; small reliability fixes | Testing | P3 | S | low | C3, C4 |
| R13 | Fix doc drift and keep docs fresh by construction | Docs/DX | P1 | S | near-zero | G4, D1 |
| R14 | Branch hygiene | Docs/DX | P1 | XS | low | G5 |
| R15 | One aggregated local verification command | Docs/DX | P1 | S | low | G8 |
| R16 | Contribution scaffolding (PR template, CONTRIBUTING) | Docs/DX | P3 | S | near-zero | G10, D3 |
| R17 | Repo and workspace hygiene | Docs/DX | P3 | XS–S | low | G9, D3 |
| R18 | `gh-pages` staging remediation | Staging/ops | P2 | M–L | medium | G2, D2 |
| R19 | Rollback runbook, deploy tags, failure alerting | Staging/ops | P2 | S | low | G6 |
| R20 | Scheduled lightweight production verification | Staging/ops | P2 | S | low | E1 |
| R21 | Optional observability extras within the privacy decision | Staging/ops | P3 | S | low | E2, E3 |

### Theme 1: Security and supply chain

#### R1 (P1) · Enable GitHub secret scanning and push protection

Source A1. Verified through the GitHub API on 2026-10-26:
`secret_scanning: disabled` and `secret_scanning_push_protection: disabled` on
a public repo (Dependabot security updates are enabled). Both features are free
for public repos and are a dashboard or API toggle with no code change. The
repo keeps a Cloudflare API token in Actions secrets, and humans and agents
push from laptops, so the accidental-commit scenario is realistic.

- Expected impact: credential pushes get blocked at the source instead of
  depending on review or after-the-fact scanning.
- Effort and risk: XS; near-zero. One caveat to check first: the Cloudflare Web
  Analytics beacon token in `config.yaml` is public by design (locked decision
  #7). Confirm the already-committed token does not trip push protection on
  future commits touching that file, and allowlist it if it does.
- Suggested acceptance criteria:
  - [ ] `gh api repos/jpcercal/jpcercal.com --jq .security_and_analysis` reports
        both statuses `enabled`.
  - [ ] A test push containing a dummy secret-shaped token is rejected by push
        protection, then removed.
  - [ ] An ordinary commit touching `config.yaml` still pushes and deploys.

#### R2 (P1) · SHA-pin the third-party GitHub Actions

Source A2. `peaceiris/actions-gh-pages@v4` (ci.yml:246) holds `contents: write`
and publishes staging previews from a mutable tag. `docker/setup-buildx-action@v4`,
`docker/login-action@v4`, and `docker/build-push-action@v7` (ci.yml:42/45/55) are
also tag-pinned, at lower privilege. The repo's Actions setting is
`allowed_actions: all`. A tag hijack of the gh-pages action would control what
every bot-dispatched PR preview serves.

- Expected impact: closes the largest supply-chain exposure in the pipeline.
  Maintenance is already covered: Dependabot's `github-actions` ecosystem
  updates SHA pins through the existing weekly flow.
- Effort and risk: XS; low. A wrong SHA fails the job on the first run, so
  merge only after one successful main or manually dispatched run.
- Suggested acceptance criteria:
  - [ ] Every third-party `uses:` in `.github/workflows/` is a full commit SHA
        with a `# owner/repo@tag` comment; first-party `actions/*` pins follow
        whatever policy the owner chooses (record the choice).
  - [ ] The image build and a staging preview both pass after the change.
  - [ ] Dependabot `github-actions` updates remain weekly and pick up the pins.

#### R3 (P2) · Add security response headers, including a hash-based CSP

Source A4. `static/_headers` currently sets `X-Content-Type-Options`,
`Referrer-Policy`, and cache rules. Missing: CSP, `frame-ancestors` (or
`X-Frame-Options`), `Permissions-Policy`, and `Strict-Transport-Security`. HSTS
may already be covered by the Cloudflare zone (Always-Use-HTTPS); check the
zone settings before adding the header. A CSP is feasible with hash sources:
the site has exactly two inline scripts (the theme init, which must stay inline
per locked decision #11, and the 404 path echo), both static strings, so no
nonces and no `'unsafe-inline'` are needed. Sketch: `script-src 'self'
'sha256-…' 'sha256-…' https://static.cloudflareinsights.com`, `connect-src
'self'` (Pagefind), `img-src 'self' data: https:` (posts may embed remote
images), `font-src 'self'`, `frame-ancestors 'none'`.

- Expected impact: real XSS and clickjacking mitigation. It matters most
  because the only dynamic client surface (search results HTML built by string
  concatenation, see R10) stays bounded even if an escaping bug slips through.
- Effort and risk: M; medium. A too-tight CSP can break the theme toggle, the
  analytics beacon, or search in subtle ways. Mitigation: stage on
  `staging.jpcercal.com` first and browse PT + EN (search with a real query,
  theme toggle, 404) watching the console; optionally run a
  `Content-Security-Policy-Report-Only` phase; then extend
  `bin/verify-pages.sh` to assert the headers in prod.
- Suggested acceptance criteria:
  - [ ] Staging serves the CSP, `frame-ancestors 'none'`, and a minimal
        `Permissions-Policy`; a full manual pass over both locales shows zero
        CSP violations.
  - [ ] `verify-pages.sh` asserts the new headers in prod and passes after the
        deploy.
  - [ ] The HSTS decision is documented (header added, or zone setting
        confirmed).
  - [ ] No new third-party requests appear; the prod artifact gate still passes.

### Theme 2: Dependency health and bot economics

#### R4 (P1) · Clear the npm audit backlog and make transitive fixes structural

Source A3. `npm audit --package-lock-only` at current main: 25 advisories,
17 high. They concentrate in the `@lhci/cli@0.15.x` tree (extract-zip symlink
traversal, tmp arbitrary file write, proxy-agent chain, and friends) and in
`wrangler@4.149.0` (undici DoS, miniflare; fix ships in 4.153.0). Exposure is
limited because these are dev-only tools installed with `--ignore-scripts`
inside a container, but extract-zip- and tmp-class bugs matter on the CI host.
Dependabot cannot fix most of this: transitive-only updates never move a direct
dependency, so no Dependabot PR ever appears for them.

Three parts: (a) bump the wrangler pin to ≥ 4.153.0 through the existing
pipeline (open PR #148 only reaches 4.152.0); (b) extend
`nix/update-dependencies.py` with a monthly lockfile-refresh mode that runs
`npm update` within semver ranges, recomputes `npmDepsHash`, and opens a PR
whose body reports the `npm audit --json` delta; (c) track `@lhci/cli` upstream
and bump when a release clears its tree.

- Expected impact: high-severity advisories drop to whatever is genuinely
  upstream-blocked, and the remainder is documented in a tracked issue instead
  of living as unexplained audit noise. The transitive gap closes structurally
  instead of through one-off manual passes.
- Effort and risk: (a) XS, (b) S–M, (c) free (a watch). Low to medium:
  transitive bumps can change tool behavior (pagefind or lhci output). The
  mitigation already exists: every bot PR runs the full gate chain and
  `nix flake check` before publication, and nothing auto-merges.
- Suggested acceptance criteria:
  - [ ] The wrangler pin is ≥ 4.153.0 and the deploy job succeeds with it on
        main.
  - [ ] `npm audit --package-lock-only` reports zero high-severity advisories
        that have an available semver fix; any remainder is listed in a tracked
        issue naming the blocking upstream package.
  - [ ] The lockfile-refresh mode is merged with stdlib tests in
        `tests/test_dependency_updates.py` and has produced at least one real
        refresh PR containing the audit delta.
  - [ ] `npmDepsHash` is recomputed and `nix flake check` passes.

#### R5 (P2) · Dependabot grouping and lighter bot-dispatch CI

Source G3. `dependabot.yml` defines no `groups:`. On 2026-10-26 alone, four npm
bump PRs (#147–150) each triggered a full `ci.yml` dispatch of 22–27 minutes,
roughly 1.5 hours of CI for minor devDependency bumps, while the same PRs'
`pr-preview` runs sat in `action_required` as pure noise.

Proposed: (a) a Dependabot group for devDependencies, so one weekly PR replaces
N single bumps (Playwright stays excluded per the existing Nix pairing
constraint); (b) a reduced `ci.yml` dispatch path for bot hash-only updates
that keeps the build and the artifact-isolation checks but skips e2e, LHCI, and
live verify; (c) accept or silence the `action_required` noise if a setting
covers it.

- Expected impact: roughly 80% fewer CI minutes for routine bumps, fewer
  concurrent PRs to review, less `gh-pages` churn.
- Effort and risk: S; low to medium. A group can bundle incompatible bumps, but
  the grouped PR still runs the full gate chain once before merge, so failures
  surface at the same place they do today. The lighter bot path must keep
  `check-artifact.sh` and `check-bilingual.py` (production isolation is
  non-negotiable) and must not weaken the structural workflow tests; update
  `tests/test_pr_preview.py` in the same PR.
- Suggested acceptance criteria:
  - [ ] `dependabot.yml` has at least one devDependency group, and the next
        weekly cycle opens a single grouped npm PR.
  - [ ] A bot-dispatched run for a hash-only update finishes in under ~10
        minutes (measured over the next three dispatches) and still runs the
        build plus artifact gates.
  - [ ] The structural tests are updated and pass; staging publication still
        verifies the PR context before pushing.

### Theme 3: CI/CD correctness and reliability

#### R6 (P1) · Add concurrency groups and timeouts to `ci.yml`

Source B2. `ci.yml` contains zero `concurrency:` and zero `timeout-minutes:`
entries (verified at current main; `pr-preview.yml` already has both). The
consequences: two rapid pushes to main run two concurrent deploy+verify pairs
(concurrent Wrangler Direct Uploads where the last writer wins, possibly the
older commit, and the verify suite may then check the other deploy); a hung
network step (lychee, LHCI) occupies a runner for up to the 6-hour default;
duplicate dispatches rebuild the full Nix CI image in parallel.

Proposed: ref-level `concurrency: { group: ci-${{ github.ref }},
cancel-in-progress: true }` for build-type work (never cancel a main deploy); a
separate `deploy-prod` group with `cancel-in-progress: false` to serialize
uploads; per-job `timeout-minutes` set generously above measured times (image
60, build 45, preview 30, deploy 15, verify 30).

- Expected impact: deterministic prod deploys, bounded failure modes, fewer
  wasted runner minutes.
- Effort and risk: S; low. Serializing the deploy queue is the intent, not a
side effect. Timeouts sit far above the measured build (418 s), so flaky
cancellation is not a concern. actionlint must stay clean (R8 eventually
enforces that automatically).
- Suggested acceptance criteria:
  - [ ] Every `ci.yml` job has a `timeout-minutes`.
  - [ ] Concurrency blocks exist: cancel-in-progress for PR/ref builds, and a
        serialized non-canceling group covering deploy + live verify.
  - [ ] Two rapid main pushes in a test window produce sequential deploy jobs,
        and the live verify checks the newest sha.
  - [ ] `actionlint` passes on the changed file.

#### R7 (P1) · Run quality gates on PRs, against the already-built preview

Source G1; the repo's own `docs/ci-cd.md` Known gaps section flags this first.
PRs currently run no lint, validation, or link checks. The required `Build`
gate proves only that Hugo rendered, and for fork/Dependabot PRs it passes
without any build at all. Failures surface on main after merge: production
stays on the previous deploy (the gates precede `deploy`), but main goes red
and the fix costs another full PR cycle.

Proposed: in `pr-preview.yml`, after `build-fast`/`build-full`, run the cheap
gates against the built `public/`: `biome check`, `html-validate`, `xmllint`,
and optionally offline lychee with the prod→local remap plus
`check-bilingual.py` (it is baseURL-aware; it needs draft/design-system
tolerance). All of these tools are already baked into the CI image. LHCI and
e2e stay main-only, which keeps locked decision #8 (prod-only gates) intact.

- Expected impact: merge-blocking signal moves before the merge; main stays
  green; regressions are caught where they are cheapest to fix. Estimated cost:
  +1–2 min on the ~2 min fast path.
- Effort and risk: M; medium. Latency grows and content-only PRs could see
  false failures. Mitigation: run the gates only where an artifact already
  exists, consider a report-only soft-launch period before the gate is
  required, and scope lychee to changed content or run it fully offline.
- Suggested acceptance criteria:
  - [ ] A test PR with an injected lint error or invalid HTML fails the PR
        gate; the defect is reverted afterwards.
  - [ ] A clean content-only PR measures ≤ ~4 min total fast path.
  - [ ] Fork and bot PRs behave exactly as before (gates skip gracefully, no
        secret exposure, `pr-preview` structural tests still pass).
  - [ ] `docs/ci-cd.md` Known gaps is updated; LHCI/e2e remain main-only.

#### R8 (P2) · Enforce shellcheck and actionlint in CI

Sources B3, G7. Both tools are packaged in the devShell (`nix/toolchain.nix`)
but absent from the `runtime-root` CI closure, and no workflow runs them; the
README lists them as manual steps covering only some scripts. Both were clean
at audit time, so this is drift prevention rather than debt paydown.

Proposed: add both to `runtime-root`; add a seconds-fast lint step (in the main
CI build job or as a flake check) running `shellcheck -x` over the six shell
scripts in `bin/`, `nix/`, and `.github/scripts/`, plus `actionlint` over the
three workflows; optionally silence or refactor the 12 benign SC2015 infos in
`verify-pages.sh` so the gate can run at default severity.

- Expected impact: the "verify through execution" standard becomes automatic
  for the pipeline's own shell and YAML; linter-catchable CI bugs get caught
  before merge.
- Effort and risk: S; low. Changing `runtime-root` triggers a CI image rebuild,
  which the image job already does when toolchain inputs change. No new
  failures are expected since both tools pass today.
- Suggested acceptance criteria:
  - [ ] Both tools exist in the CI image and are callable from job shells.
  - [ ] The lint step runs on main pushes and on PRs touching `bin/`, `nix/`,
        or `.github/workflows/`, and exits 0 today.
  - [ ] A deliberately broken script in a test PR fails the step.

#### R9 (P3) · Workflow micro-hardening and a structural parity test

Sources B4, B5, and the already-fixed B1. Three small items. (a) Fork PRs
cannot pass `ci.yml`'s push steps today (GHCR and gh-pages pushes need a write
token, which forks do not get): either gate push steps on same-repo heads with
graceful degradation, or document a branch-PRs-only policy. (b)
`--commit-dirty=true` on the Wrangler deploy permanently disables a guard that
would catch a dirty tree; drop it or add an explicit `git diff --exit-code`
pre-step. (c) The `destination_dir` bug fixed between the audit baselines
deserves a regression test: extend the structural test suite with an assertion
that `PR_BASE_URL` and `destination_dir` derive the PR number from the same
expression, so the two can never silently diverge again.

- Expected impact: honest CI statuses for external contributors, a trustworthy
  Cloudflare deploy→commit mapping, and a permanent lock on a bug that already
  happened once.
- Effort and risk: S combined; low.
- Suggested acceptance criteria:
  - [ ] A simulated fork PR produces no failing push jobs (they skip with a
        clear status), or the branch-PRs-only policy is documented in the
        contribution notes.
  - [ ] The deploy succeeds without `--commit-dirty`, or with an explicit
        clean-tree assertion.
  - [ ] A CI-run structural test asserts the `PR_BASE_URL` / `destination_dir`
        expression parity.

### Theme 4: Testing strategy

#### R10 (P2) · Unit tests for the search render/escape helpers

Source C1. `assets/js/search.js` builds result cards by string concatenation;
`escapeHtml()` covers title, meta, URL, and author, and the Pagefind excerpt is
intentionally interpolated raw (documented). That contract is the only XSS
defense in client code, and no test pins it: a refactor dropping one
`escapeHtml` call passes every existing e2e test.

Proposed: extract the escape/render helpers into a testable module (for example
`assets/js/search-render.js`, imported by `search.js`; mind the machine-level
global gitignore that matches `*.js`, so new files need `git add -f`) and add
`node:test` cases with injection payloads (`<img onerror>`, quotes,
`javascript:` URLs). Node 26 is pinned; no new dependencies.

- Expected impact: regression protection on the highest-risk client code path,
  runnable without a browser. Pairs with R3's CSP as defense in depth.
- Effort and risk: S; low. The extraction must keep `js.Build` output
  equivalent (per-locale hashed search bundles, one param-free theme bundle);
  the existing e2e search tests guard the behavior.
- Suggested acceptance criteria:
  - [ ] A `node --test` suite (wired into an npm script and CI) asserts the
        injection payloads are escaped.
  - [ ] Removing one `escapeHtml` call in a test branch fails the unit suite.
  - [ ] e2e search tests pass unchanged and bundle fingerprinting behaves as
        before.

#### R11 (P2) · Run the visual regression suite on CI Linux

Sources C2, G9. `e2e/visual.spec.js` carries `test.skip(!!process.env.CI)` and
only darwin snapshots, so recent layout work (navbar, code font sizes) was
verified visually by hand. The classic "snapshots are platform-specific"
problem is already solved by this project's own toolchain: the CI image
contains the exact pinned Chromium and the exact vendored fonts.

Proposed: generate a `visual.spec.js-snapshots-linux/` baseline inside the CI
container, commit it, and run the spec on Linux in the build job (main pushes
first, then extend to PRs touching layouts or assets once stable). Update the
README/AGENTS.md regeneration ritual: baselines regenerate inside the
container, not on the host.

- Expected impact: a deterministic visual gate on rendering changes, ending the
  manual screenshot ritual for layout PRs.
- Effort and risk: M; medium. Baseline churn on intentional design changes
  (regeneration becomes part of those PRs) and pixel flakiness (mitigated by
  the pinned font/Chromium pair plus a small `maxDiffPixelRatio` tolerance).
  Keep the suite non-blocking at first if it proves noisy.
- Suggested acceptance criteria:
  - [ ] Linux baselines are committed and two consecutive CI runs pass green
        with no repo change (flake check).
  - [ ] A test PR with an intentional CSS change fails the visual spec.
  - [ ] Docs describe container-based regeneration; the local darwin flow still
        works.

#### R12 (P3) · Test the bilingual checker; small reliability fixes

Sources C3, C4. `bin/check-bilingual.py` is the gate that keeps 78 × 2 articles
consistent (canonical/alternate pairs, local fragments, shared assets, author
routes, Pagefind language counts). A parsing regression would silently turn it
into a no-op that passes everything, and the gate itself has no tests. Minor
companions: `search.js` dereferences `#search` without a null guard, and
Playwright's `retries: 2` in CI can mask emerging flakiness.

Proposed: a fixture-based unittest in `tests/` (a tiny fake `public/` tree)
following the `test_dependency_updates.py` pattern (stdlib only, already wired
into CI), covering slug resolution, fragment checks, and failure paths; add the
null guard; periodically review `playwright-traces` artifacts for
retried-but-passed tests.

- Expected impact: the most detailed gate in the repo stays trustworthy as
  layouts and markup evolve.
- Effort and risk: S; low.
- Suggested acceptance criteria:
  - [ ] The unittest suite runs in CI, and injecting a broken canonical into
        the fixture tree fails it.
  - [ ] `search.js` null-guards its `#search` lookup; smoke e2e unchanged.
  - [ ] A recurring flakiness review is documented (for example alongside the
        R19 ops doc).

### Theme 5: Documentation, conventions, developer experience

#### R13 (P1) · Fix doc drift, then keep docs true by construction

Sources G4, D1. All verified at current main: Wrangler "4.147.0" (README:163,
AGENTS.md:164) vs 4.149.0 pinned in `package.json`; Biome "2.5.13"
(AGENTS.md:274) vs `^2.5.15`; post counts "76 bundles / 152 files"
(AGENTS.md:34,71) and "75 / 150" (README:68, phrased as a historical
completion baseline) vs actual 78 / 156; smoke tests "18" (AGENTS.md:186,306)
vs 32 `test()` declarations. The structural risk amplifies all of this:
AGENTS.md is injected into every agent session, and an injected copy can lag
main (during the audits, one agent's injected copy predated the entire
`pr-preview.yml` split), so stale facts actively mislead the main contributor.

Proposed: (a) correct the drifted claims now; (b) pick one anti-drift
mechanism: either strip volatile numbers from prose and point at
`package.json` / the toolchain `versions` check as the source of truth, or add
a small CI check that derives the numbers (`find content/posts` counts,
`package.json` versions) and fails on drift. `tests/test_dependency_updates.py`
already parses the Dockerfile bootstrap pin, and the same pattern extends to
doc mentions. Label the README's historical baseline sentence explicitly as
historical.

- Expected impact: agent-facing docs stay true by construction; fewer wrong
  decisions made from stale "facts".
- Effort and risk: S; near-zero.
- Suggested acceptance criteria:
  - [ ] Every drifted claim is corrected or replaced with a source-of-truth
        pointer, and matches `find` / `package.json` output at merge time.
  - [ ] If the guard route is chosen: a test PR that deliberately drifts a doc
        number fails the check (reverted afterwards).
  - [ ] The README baseline count is clearly marked as a historical milestone.

#### R14 (P1) · Branch hygiene

Source G5. 28 remote branches, about 20 of them stale from merged PRs despite
`deleteBranchOnMerge: true` (merges via `gh` CLI evidently skip
`--delete-branch`); 9 `wt/t_*` kanban worktree branches violate the
`<type>/<kebab-case>` convention AGENTS.md itself sets; `strict: false` lets
stale heads merge (PR #145 needed a manual rebase after a conflict, and
semantic conflicts can pass the required check silently).

Proposed: (a) standardize on `gh pr merge --squash --delete-branch` and encode
it in the AGENTS.md agent rules; (b) one-time sweep of the ~20 stale branches;
(c) decide explicitly on `strict: true` (stale heads must re-pass required
checks before merging) versus keeping `strict: false`: with several concurrent
agent PRs as the norm, strict mode adds rebase friction but prevents
silent-stale merges; (d) decide whether kanban `wt/t_*` branches are exempt
from the naming convention or should be deleted when their task completes.

- Expected impact: a readable branch list, a convention that matches reality,
  and fewer stale-head merge surprises.
- Effort and risk: XS for the sweep and doc changes; the `strict` toggle is a
  workflow tradeoff to decide, not a code risk.
- Suggested acceptance criteria:
  - [ ] After the sweep, `git branch -r` shows only active work, bot branches,
        `main`, and `gh-pages`.
  - [ ] The AGENTS.md merge instruction includes `--delete-branch` (or the
        agent harness enforces it).
  - [ ] The `strict` and merge-method decision is recorded with rationale
        (changed or deliberately kept).
  - [ ] The `wt/t_*` policy is documented.

#### R15 (P1) · One aggregated local verification command

Source G8. The README verification section is a 14-command manual checklist;
the npm scripts have no aggregator; there are no git hooks. Every gate depends
on a human or agent remembering the list.

Proposed: `npm run check` (or `bin/verify-local.sh`) implementing the checklist
verbatim, in the documented order (clean prod build first, then gates; browser
tests rebuild `public/` with localhost URLs, so ordering matters per the
existing landmine notes), including shellcheck/actionlint so it aligns with R8.
The README verification section collapses to the single command and keeps the
checklist as documentation of what it runs.

- Expected impact: one command for agents and humans before pushing; fewer
  "forgot a gate" cycles; a single source of truth for local verification.
- Effort and risk: S; low. The script must respect the documented landmines (no
  `npm ci` against the Nix-managed link, `--renderToMemory` for any
  `hugo server` use, `--ignoreCache` after pipe-chain shape changes); reusing
  the exact README sequence avoids surprises.
- Suggested acceptance criteria:
  - [ ] `npm run check` executes the full sequence in a clean worktree and
        exits 0.
  - [ ] An injected defect (lint error, broken link) makes it exit non-zero and
        name the failing gate.
  - [ ] The script passes `shellcheck`; the README points to it.

#### R16 (P3) · Contribution scaffolding

Sources G10, D3. No CONTRIBUTING.md, no PR or issue templates, no CODEOWNERS.
That is acceptable for a solo project, but agents produce most PRs now and rely
entirely on AGENTS.md prose, and the regression-discipline rule lives far from
the point of action.

Proposed: a minimal PR template encoding the conventional-commit title rule,
the bilingual publishing checklist (both locales, localized slugs, translation
references), the regression discipline (gates re-run, snapshots regenerated
when rendering changes), and the `design-system/` "never commit under
`content/`" footgun. Optionally a short CONTRIBUTING.md; CODEOWNERS is optional
for a solo repo but can auto-assign the owner as reviewer.

- Expected impact: rules arrive at the point of action; fewer review
  round-trips; onboarding material for any future contributor, human or agent.
- Effort and risk: S; near-zero (templates only, no workflow change).
- Suggested acceptance criteria:
  - [ ] `.github/PULL_REQUEST_TEMPLATE.md` exists and renders on new PRs with
        the items above.
  - [ ] CONTRIBUTING.md (if added) is linked from the README.

#### R17 (P3) · Repo and workspace hygiene

Sources G9, D3. Small items, each XS–S: move `homepage-desktop.png` and
`homepage-mobile.png` (~390 KB) from the repo root into `docs/assets/` and
update README paths; replace the personal absolute paths committed in
`.env.dist` (iCloud container ID, `/usr/local/bin/unison`) with placeholders;
make the local design-system staging copy self-cleaning with a shell trap
instead of "remember to delete it afterwards"; document or auto-pick a free
`PLAYWRIGHT_PORT` for parallel worktrees; evaluate generating the
`docs/bilingual-review.md` ledger from `check-bilingual.py` output instead of
hand-maintaining it.

- Expected impact: less clutter, fewer recurring agent footguns, and no
  personal filesystem paths in a public repo.
- Effort and risk: XS–S; low. README images must keep rendering; `.env.dist` is
  documentation for a personal ingestion pipeline, so placeholders lose nothing.
- Suggested acceptance criteria:
  - [ ] No PNGs at the repo root; README images render from the new location.
  - [ ] `.env.dist` contains placeholders only.
  - [ ] A local staging build removes `content/design-system/` on success and
        on failure (tested with an interrupt).

### Theme 6: Staging infrastructure, release operations, observability

#### R18 (P2) · Remediate the `gh-pages` staging branch

Sources G2, D2. The branch is ~1.4 GB (audit-time figure from the
`pr-preview.yml` comment) with 79 `pr-*` directories (count re-verified at
writing time) plus one stray `pr-/`. Its root still serves the 2020-era legacy
production build, including GA4 `gtag` and Google Fonts requests, publicly at
`staging.jpcercal.com`: retired trackers on a surface the project controls,
against the spirit of locked decision #7. Every preview publish triggers a full
GitHub Pages rebuild of the branch (2–3 min). The bot `preview-staging` push
also races the preview `publish` job: no shared lock, and only `publish`
retries a rejected push.

Proposed in steps, each independently valuable: (1) replace the legacy root
with a minimal index or 404 page; (2) add a scheduled sweeper reconciling
`pr-*` directories against open PRs, which also removes the stray `pr-/`;
(3) add push retry or a shared lock to the bot publish path; (4) longer term,
evaluate Cloudflare Pages preview deployments or a periodically flattened
`gh-pages` to kill the rebuild cost. Step 4 may involve a history rewrite,
which is destructive and needs an explicit owner decision and a coordinated
window.

- Expected impact: faster preview publishes, a tracker-free staging root, a
  bounded branch size, and no publish races.
- Effort and risk: M for steps 1–3 (low risk); L for step 4 (medium risk:
  destructive operation, `keep_files` semantics, downtime window).
- Suggested acceptance criteria:
  - [ ] `curl -s https://staging.jpcercal.com/` contains no
        `gtag`/`googletagmanager`/`fonts.googleapis` references.
  - [ ] The sweeper runs on schedule; `pr-*` directories for closed PRs drop to
        zero and stay bounded over two weeks.
  - [ ] No bot-dispatch publish fails on a push race over a one-month run
        history.
  - [ ] If step 4 is chosen: a written migration plan with a rollback path is
        approved before execution, and branch size measurably drops.

#### R19 (P2) · Rollback runbook, deploy tags, and failure alerting

Source G6. The live verify suite runs after the production deploy (locked
decision #8, not revisited here); when it fails, the result is a live incident
whose only signal is a red workflow run. There are no git tags (verified:
zero), no documented rollback procedure in any of README/docs/AGENTS.md, and no
alerting channel.

Proposed: (a) document both recovery paths in `docs/ci-cd.md` with decision
guidance: revert-on-main plus redeploy versus Cloudflare dashboard instant
rollback; (b) tag each successfully deployed sha from the deploy job (for
example `deploy-YYYYMMDD-<sha7>`) so "what is actually in prod" is traceable;
(c) send a notification when the post-deploy verify job fails (webhook, chat,
or email), as a non-blocking step that leaks no secrets.

- Expected impact: MTTR for a bad deploy drops from "figure it out live" to
  minutes; prod state is traceable; failures find the owner instead of living
  in an Actions log.
- Effort and risk: S; low. Tags accumulate cheaply. The notification step needs
  careful secret handling: reuse the existing least-privilege patterns and add
  no new secret exposure to other jobs.
- Suggested acceptance criteria:
  - [ ] `docs/ci-cd.md` has a rollback section covering both paths and when to
        use each.
  - [ ] The next prod deploy produces a tag pointing at the deployed sha.
  - [ ] A deliberately failing verify run in a test window delivers a
        notification.
  - [ ] Locked decision #8 is unchanged: verify still runs after deploy.

#### R20 (P2) · Scheduled lightweight production verification

Source E1. All ~30 live-site claims are checked once, right after a deploy.
Infrastructure drift in between (zone or header changes, certificate problems,
beacon misconfiguration, cache-rule regressions) goes unnoticed until the next
deploy, which for a blog can be weeks away.

Proposed: a daily or weekly `schedule` + `workflow_dispatch` job reusing the CI
image to run a lightweight subset of `verify-pages.sh`: 200-response,
compression, beacon presence, custom-404 behavior, security headers once R3
lands, and a small link sample. The full suite stays post-deploy-only. Failures
alert through the R19 channel rather than turning a workflow red in a way that
implies a deploy happened. Optionally add free Cloudflare Health Checks for
uptime.

- Expected impact: MTTR for infrastructure regressions drops from "next deploy"
  to hours, reusing an existing tested script with no new tooling.
- Effort and risk: S; low. Network-dependent checks can flake, so the scheduled
  job stays alert-only (non-blocking) and the link sample stays small (the
  lychee config already exists).
- Suggested acceptance criteria:
  - [ ] The scheduled job runs on cron for one week without false alarms before
        anyone relies on it.
  - [ ] A simulated failure in a test window alerts through the R19 channel.
  - [ ] The full verify suite remains deploy-time-only, and scheduled runs make
        no changes at Cloudflare.

#### R21 (P3) · Optional observability extras, inside the privacy decision

Sources E2, E3. All three options stay inside locked decision #7 (cookieless
Cloudflare beacon only, no third-party trackers). (a) Gate `console.warn`
breadcrumbs in `search.js`/`theme.js` behind localhost/staging hosts, so
staging debugging leaves traces while production stays silent. (b) A
first-party same-origin error beacon (a Pages Function aggregating
`window.onerror`, no cookies or PII) is the only real-user-monitoring option
consistent with the privacy stance; treat it as an owner decision to make
explicitly, not a default. (c) Performance history: LHCI uploads to temporary
public storage and the artifact is kept 7 days, so no long-run trend exists and
regressions are caught only against the absolute ≥ 0.9 gates; commit a small
per-deploy JSON summary (scores for the three collected URLs) from the verify
job, or self-host LHCI if trend analysis ever matters.

- Expected impact: faster staging diagnosis at zero privacy cost; optional
  visibility into production JS breakage that analytics cannot see; a
  performance trend line alongside the absolute gates.
- Effort and risk: S per part; low. Part (b) requires an explicit owner
  decision before any implementation. Part (a) must not change production
  console output; the existing e2e network guards can be extended to assert
  that.
- Suggested acceptance criteria:
  - [ ] (a) Warnings appear on localhost/staging hosts only; the production
        console stays silent and e2e guards pass.
  - [ ] (b) A recorded owner decision exists before any first-party beacon
        work starts.
  - [ ] (c) A per-deploy score JSON is committed or attached, sufficient to
        build a 30-day trend.

## 4. Suggested sequencing

Ordered by value-to-risk, merging both audits' own priority calls. Phases are
suggestions; items are independent unless noted.

| Phase | Items | Rationale |
|---|---|---|
| 1. Quick wins (hours, near-zero risk) | R1, R2, R6, R13, R14 | Dashboard toggles, small workflow edits, doc corrections, a branch sweep. Clears the cheap end of the security backlog, the deploy race, and the doc drift that misleads every agent session. |
| 2. Short term (days to two weeks) | R4 (wrangler bump), R7, R8, R15, R19, R20 | Moves quality signal before merge, bounds CI failure modes, gives production a recovery story. R7 and R8 touch the same workflows, so landing R8 first avoids churn. |
| 3. Medium term (this quarter) | R3, R4 (refresh mode), R5, R10, R11, R18 | Larger edits with staging validation: CSP, bot restructuring, test coverage, staging remediation. R3's header assertions feed R20's scheduled subset. |
| 4. Opportunistic | R9, R12, R16, R17, R21 | Low-risk polish; fold into adjacent work when convenient. |

Expected aggregate effect if phases 1–3 land: high-severity advisories approach
zero; routine bot bumps cost a fraction of today's ~1.5 h/day; lint and
validation regressions are caught before merge instead of after; production
gains rollback tags, alerting, and between-deploy verification; docs stop
misleading agents; and the staging root stops serving retired trackers.

## 5. Scope and locked decisions

Nothing here revisits the locked decisions in AGENTS.md:

- R7 keeps locked decision #8 intact: LHCI and the live verify suite stay
  main/prod-only, and the PR gate is cheap lints and validators only.
- R3 and R21 stay inside decision #7 (cookieless Cloudflare beacon, no
  third-party trackers); R21(b)'s first-party beacon is explicitly an owner
  decision, not a proposal default.
- R3's CSP design assumes decision #11's inline theme-init script stays inline,
  hence hash sources rather than nonces.
- R4, R8, and R15 add tools and scripts through the Nix-owned toolchain per
  decision #0: no floating downloads, no `npm ci` against the managed link.
- The architecture choices (Hugo, Tailwind v4, Dart Sass, Pagefind, esbuild,
  html-validate) are out of scope; the audits found no reason to reopen them.

Out of scope for the PR carrying this document: everything except this file.

## 6. References

- Delivery workflow audit: `workflow-audit-t_b335c1e6.md` (kanban task
  `t_b335c1e6`, attachment id 2). Gaps G1–G10, measured pipeline timings,
  evidence appendix. Audited `origin/main @ 0de494132`.
- Code-quality / testing / security / observability audit:
  `AUDIT-code-quality-t_93988721.md` (kanban task `t_93988721`). Findings
  A1–E3 with a verification appendix. Audited `71484e674`; every finding was
  re-checked against `0de494132` for this proposal. Finding B1 (staging
  `destination_dir` bug) was fixed between the baselines by #127/#134 and is
  not proposed; R9(c) suggests a regression test instead.
- `docs/ci-cd.md` Known gaps (the repo's own list): missing PR gates, fork/bot
  `Build` semantics, the cleanup-script edge case, stale `pr-*` directories,
  and the publish race. R7, R9, and R18 close these.
- Live checks re-run for this document (2026-10-26, at `0de494132`): GitHub
  API security settings (secret scanning disabled); `npm audit
  --package-lock-only` (25 advisories, 17 high); `gh-pages` `pr-*` count (79);
  remote branches (28, of which 9 `wt/t_*`); git tags (0); content counts
  (78 bundles, 156 article files); `e2e/smoke.spec.js` `test()` declarations
  (32); doc version greps (Wrangler 4.147.0 vs 4.149.0, Biome 2.5.13 vs
  ^2.5.15); absence of `concurrency`/`timeout-minutes` in `ci.yml` and their
  presence in `pr-preview.yml`; `peaceiris@v4` and `docker/*@v4/v7` mutable
  tags; open bot PRs #147–151.

Prepared for owner review. Each recommendation is a suggestion for later
analysis; none is implemented, and accepting one should start with its own PR
referencing the criteria above.
