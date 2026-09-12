---
title: Components
description: Rendered examples of the jpcercal.com building blocks.
draft: true
sitemap:
  disable: true
---

## Post card

<article class="post-card mb-6">
    <div class="flex">
        <div class="flex-col m-4">
            <img class="rounded" src="/images/icons/tag.svg" alt="Example" height="60" width="60">
        </div>
        <header class="flex-col m-0">
            <h2 class="mt-0 mb-0 font-size-h4">
                <a class="mt-4 mb-1 post-card--title" href="#">Example post title</a>
            </h2>
            <ul class="flex list-none gap-2">
                <li><time datetime="2026-01-01">Jan 1, 2026</time></li>
                <li class="hidden sm:inline"><span>100 words</span></li>
            </ul>
            <p class="mt-2 mb-4 mr-2">Example description showing the card rhythm.</p>
        </header>
    </div>
</article>

## Search field

<div class="search">
    <input class="font-size-h6 search-input-field" type="search" placeholder="Example search field">
</div>

## Code block

```yaml
draft: false
author: jpcercal@gmail.com
slug: my-slug
```

Inline `code` renders on a light pill (`#f8f9fa`); fenced blocks render on
the dark One Dark container (`assets/scss/syntax-highlight.scss`).

## Meta list

<ul class="flex list-none gap-2">
    <li><a href="mailto:jpcercal@gmail.com">E-mail</a></li>
    <li><a href="https://github.com/jpcercal" target="_blank">GitHub</a></li>
</ul>
