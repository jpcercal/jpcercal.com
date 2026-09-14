---
name: create-blog-post
description: Interview the user, design, write, and validate high-quality Hugo blog posts for jpcercal.com, including SEO metadata, cover assets, and optional LinkedIn copy.
---

# Create Blog Post

## Purpose

Create original, high-quality blog posts for `jpcercal.com`.

The workflow is interview-first:

1. Interview the user.
2. Summarize the article brief.
3. Propose the title, description, slug, and outline.
4. Get confirmation.
5. Write the article.
6. Create the cover asset.
7. Generate optional LinkedIn copy.
8. Validate the result.

Do not write the article before the user approves the proposed direction.

## Repository Context

Before writing, read:

- `AGENTS.md`
- Recent English posts under `content/posts/`
- `data/authors.yml`
- `data/categories.yml`
- `data/tags.yml`
- `layouts/posts/single.html`
- `layouts/partials/head-meta.html`

Use recent posts such as:

- `content/posts/understand-the-system-before-changing-it/index.en.md`
- `content/posts/working-with-ai-agents-stay-on-the-loop/index.en.md`

Preserve the existing Hugo structure and editorial identity.

## Interview

Ask concise questions covering:

1. What is the topic and why does it matter?
2. Who should read the article?
3. What should the reader understand or do afterward?
4. What is the main problem, thesis, or question?
5. What personal experience, technical example, evidence, or story should be included?
6. What is explicitly out of scope?
7. Are there sources that must be cited, avoided, or kept anonymous?
8. What language should be used?
9. Who is the author?
10. What publication date and draft status should be used?
11. What search terms or SEO intent matter?
12. Is a LinkedIn post required?
13. Is an internal link or cover concept required?
14. What approximate length is preferred?

If the user has already answered a question, do not ask it again.

Use `jpcercal@gmail.com` as the default author only when no other author is specified. Confirm the author before writing.

## Approval Brief

After the interview, produce:

- A short article brief
- The proposed audience
- The core thesis
- One recommended title
- Two alternative titles
- An SEO-oriented description
- The proposed slug
- A section outline
- Any assumptions or unresolved questions

The SEO title should normally be concise and descriptive, ideally under approximately 65 characters when natural.

The SEO description should normally be approximately 140-160 characters, explain the reader benefit, and include relevant terms naturally. Do not promise search rankings or use keyword stuffing.

Wait for user approval before drafting the article.

## Editorial Standard

Write in a professional principal or distinguished software engineer voice.

The article must be:

- Accessible to people beginning their IT careers
- Valuable to experienced engineers
- Analytical without being unnecessarily academic
- Practical without becoming a shallow checklist
- Calm, precise, and non-promotional
- Honest about uncertainty and trade-offs
- Focused on systems, boundaries, decisions, and consequences

Use the following qualities as references without copying wording, structure, or distinctive expressions:

- Explain concepts from first principles.
- Define unfamiliar terms before relying on them.
- Make forces and trade-offs explicit.
- Distinguish external outcomes from internal implementation details.
- Use concrete technical examples.
- Discuss failure modes and limitations.
- Connect architecture to people, organizations, and operational reality.
- End with a measured conclusion rather than a slogan.

Do not imitate any individual author.

Avoid:

- Hype and exaggerated claims
- Clickbait
- Sweeping predictions
- Unexplained AI terminology
- Fabricated personal experiences
- Generic productivity claims
- Repeating the same idea in multiple sections
- Treating AI output as automatically correct
- Treating documentation or tests as substitutes for human responsibility

When using first person, only describe experiences supplied by the user or clearly frame the text as a general observation.

## Default Article Structure

Unless the topic requires another structure, use:

1. A concrete opening problem
2. Context and definitions
3. A conceptual model or key distinction
4. A detailed technical or organizational example
5. Trade-offs, boundaries, and failure modes
6. Practical implications
7. A concise reflective conclusion

Default length is approximately 1,000-1,600 words. Adjust based on the topic and the user's requested length.

Use Markdown headings, short paragraphs, lists only when they improve comprehension, and code blocks only when they add real value.

## Source and Attribution Rules

Follow the user's source instructions exactly.

If the user says a source must not be mentioned:

- Do not mention its title.
- Do not include its URL.
- Do not name its author or publication.
- Do not add an attribution.
- Do not reproduce distinctive wording.
- Do not include the source in the article description.
- Do not include it in the LinkedIn copy.
- Do not include it in cover text or metadata.

Use source material only as background for developing original explanations.

## Hugo Content Contract

English-only posts must use:

```text
content/posts/<slug>/index.en.md
```

Do not create `index.md` unless a Portuguese version is explicitly requested.

Required front matter:

```yaml
---
draft: true
author: jpcercal@gmail.com
slug: example-slug
title: Example Title
date: 2026-01-01T00:00:00+00:00
description: A concise description explaining the article's reader benefit.
categories:
  - other
tags:
  - engineering
  - lessons-learned
---
```

Rules:

- Use a valid author from `data/authors.yml`.
- Use a valid category from `data/categories.yml`.
- Use only valid tags from `data/tags.yml`.
- Do not use the obsolete `topics` field.
- Use `draft: true` by default until approval.
- Do not use a future date unless explicitly requested.
- Keep the slug lowercase and hyphenated.
- Keep the description consistent with the article.
- Prefer existing taxonomies over inventing new ones.

## Cover Asset

Create:

```text
content/posts/<slug>/index.svg
```

The cover should:

- Be a valid 512x512 SVG.
- Match the existing site's visual language.
- Avoid unnecessary text.
- Use original shapes and composition.
- Contain no forbidden attribution or source references.

The build pipeline generates `index.png` from `index.svg`. A post-local cover is required because the site's social metadata points to the generated cover path.

## LinkedIn Copy

When requested, create a separate, paste-ready LinkedIn post.

The LinkedIn copy should normally be 150-250 words and include:

- A clear opening observation
- The article's central insight
- One concrete example or implication
- A practical takeaway
- A placeholder for the article URL
- Three to five relevant hashtags

Do not add the LinkedIn copy as a Hugo page unless explicitly requested.

## Preview and Validation

For draft previews, use:

```sh
hugo server --buildDrafts --renderToMemory
```

Never omit `--renderToMemory`.

For production-equivalent validation, run:

```sh
BASE_URL=https://jpcercal.com/ npm run build
JPEGTRAN=/opt/homebrew/opt/mozjpeg/bin/jpegtran npm run images
npm run search:index
npm run lint
npm run validate:html
npm run validate:xml
lychee --config .lychee.toml --no-progress \
  --remap "https://jpcercal.com file://$PWD/public" \
  "public/**/index.html"
npm run lhci
CI=1 npm run e2e
```

Use the repository-local toolchain when invoking Hugo directly:

```sh
PATH="$PWD/node_modules/.bin:$PATH" hugo ...
```

Use the `JPEGTRAN` override locally when the default `jpegtran` is not Mozilla JPEG:

```sh
JPEGTRAN=/opt/homebrew/opt/mozjpeg/bin/jpegtran npm run images
```

For a draft, validate the route using a build with drafts enabled:

```sh
PATH="$PWD/node_modules/.bin:$PATH" \
hugo --buildDrafts --ignoreCache \
  --minify \
  --baseURL "https://jpcercal.com/"
```

Verify:

```text
public/en/<slug>/index.html
public/en/<slug>/index.png
```

Also confirm:

- The title appears in the generated HTML.
- The canonical URL is correct.
- The author resolves correctly.
- The category and tags resolve correctly.
- The cover is generated.
- No forbidden source reference appears.
- Production does not contain draft-only content.
- `public/design-system/` is absent from production output.
- Pagefind output exists.
- Legacy search artifacts are absent.

Platform-specific visual snapshots may be skipped with `CI=1`; do not regenerate them for content-only changes.

## Completion Report

At the end, report:

- Article title
- Article slug
- Author
- Language
- Draft or publication status
- Changed files
- Generated route
- Cover status
- LinkedIn-copy status
- Commands executed
- Passing checks
- Any unrelated baseline failures

Do not commit, push, or create a pull request unless the user explicitly requests it.
