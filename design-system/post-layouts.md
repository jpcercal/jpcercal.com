---
title: Post layouts
description: Three ways to separate the blocks of a single post, side by side. Use the header toggle to compare light and dark.
layout: post-layouts
draft: true
sitemap:
  disable: true
---

Each preview renders the real post "The Cost of the Loop Matters More Than the Score" with the same markup
and only the summary as body. The one used on every real post is picked with
`params.postVariant` in `config.yaml` (`rules`, `panels` or `banded`).

1. **Rules**: hairlines between byline, title, translations, body and tags. Nothing boxed; the most editorial and the closest to today's look.
2. **Panels**: byline, translations and tags become bordered, tinted surfaces with the same 8px radius as the header controls; the title and the body stay on the plain canvas.
3. **Banded**: byline, title, share buttons and translations sit in one full-bleed tinted band under the navbar; the body starts on the plain canvas below it.

The navbar rule (rules, banded) and the band touching the navbar (banded) are
only visible on real posts, not in this stacked preview.
