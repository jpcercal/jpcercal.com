# UX audit — annotated evidence

Source: `docs/ux-audit.md` (live site https://jpcercal.com, captured 2026-10-26, Chromium via CDP,
desktop 1280×800 and mobile 375×812@2x). Red boxes/labels and black panels were injected into the
page before capture; no real page content was altered otherwise. No credentials or private data appear.

| # | Issue | Severity | Image | Viewport |
|---|-------|----------|-------|----------|
| 1 | Search excerpts show code line-number junk | High | `01-search-excerpts-code-junk.png` | desktop |
| 2 | No visible keyboard focus ring (theme toggle, dark) | High | `02-focus-ring-invisible-dark.png` | desktop |
| 3 | No `<main>` landmark / skip link | High | `03-no-main-landmark-skip-link.png` | desktop |
| 4 | Touch targets too small | High | `04-touch-targets-small-mobile.png` | mobile |
| 5 | Language switch loses context; active item `href="#"` | High | `05-language-switch-loses-context.png` | desktop |
| 6 | Search input unlabeled | Medium | `06-search-input-unlabeled.png` | desktop |
| 7 | English-formatted dates on PT pages | Medium | `07-english-dates-on-pt-pages.png` | desktop |
| 8 | Home lacks identity; generic meta description | Medium | `08-home-lacks-identity.png` | desktop |
| 9 | Contact page stale | Medium | `09-contact-page-stale.png` | desktop |
| 10 | Non-canonical links / undated legacy posts | Medium | `10-noncanonical-links-and-legacy-posts.png`, `10b-legacy-post-undated-notice.png` | desktop |

## Deviations from the audit text (re-verified live)
- #10: the redirects are **HTTP 308**, not 301.
- #9: the live Contact copy no longer contains the "Nós gostaríamos…" sentence; it reads "Você pode entrar em contato por e-mail ou através de nossos perfis sociais." The evidence shows the legacy Twitter/Facebook channels only.
- #2: the red outline in the image is the annotation; the real element has `outline: 2px solid rgba(0,0,0,0)` and no box-shadow.

## PR snippet
```md
### UX evidence
1. Search excerpts: ![](docs/ux-evidence/01-search-excerpts-code-junk.png)
2. Focus ring: ![](docs/ux-evidence/02-focus-ring-invisible-dark.png)
3. No main/skip link: ![](docs/ux-evidence/03-no-main-landmark-skip-link.png)
4. Touch targets (mobile): ![](docs/ux-evidence/04-touch-targets-small-mobile.png)
5. Language switch: ![](docs/ux-evidence/05-language-switch-loses-context.png)
6. Search input label: ![](docs/ux-evidence/06-search-input-unlabeled.png)
7. PT dates: ![](docs/ux-evidence/07-english-dates-on-pt-pages.png)
8. Home identity: ![](docs/ux-evidence/08-home-lacks-identity.png)
9. Contact: ![](docs/ux-evidence/09-contact-page-stale.png)
10. Redirects / legacy: ![](docs/ux-evidence/10-noncanonical-links-and-legacy-posts.png) ![](docs/ux-evidence/10b-legacy-post-undated-notice.png)
```
