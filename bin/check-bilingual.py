#!/usr/bin/env python3
"""Check every source pair and its rendered routes, including preview subpaths."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urljoin, urlsplit
import json
import re


def require(condition, message):
    if not condition:
        raise SystemExit(f'bilingual: {message}')


class Page(HTMLParser):
    def __init__(self, path):
        super().__init__()
        self.elements = []
        self.text = []
        self.feed(path.read_text())

    def handle_starttag(self, tag, attrs):
        self.elements.append((tag, dict(attrs)))

    def attrs(self, tag):
        return [attrs for name, attrs in self.elements if name == tag]

    def handle_data(self, data):
        self.text.append(data)


def metadata(path):
    text = path.read_text()
    front = text.split('---', 2)[1]
    match = re.search(r'^slug:\s*(.+)$', front, re.M)
    require(match, f'missing slug: {path}')
    return match[1].strip().strip('"\''), text


root = Path('public')
home = Page(root / 'index.html')
base = next(a['href'] for a in home.attrs('link') if a.get('rel') == 'canonical')
require(base.endswith('/'), f'base URL must end with /: {base}')
parsed_base = urlsplit(base)
cache = {}


def local_file(url):
    parsed = urlsplit(url)
    if parsed.netloc != parsed_base.netloc or parsed.scheme != parsed_base.scheme:
        return None
    require(parsed.path.startswith(parsed_base.path), f'URL escaped base path: {url}')
    relative = unquote(parsed.path[len(parsed_base.path):])
    require('..' not in Path(relative).parts, f'unsafe local URL: {url}')
    path = root / relative
    if path.is_dir():
        path /= 'index.html'
    require(path.is_file(), f'missing local destination: {url}')
    if parsed.fragment and path.suffix == '.html':
        require(any(a.get('id') == unquote(parsed.fragment) for _, a in page(path).elements),
                f'missing fragment: {url}')
    return path


def page(path):
    if path not in cache:
        cache[path] = Page(path)
    return cache[path]


bundles = sorted(p for p in Path('content/posts').iterdir() if p.is_dir())
routes = {}
sources = {}
for bundle in bundles:
    pair = {}
    for lang, filename in [('pt', 'index.md'), ('en', 'index.en.md')]:
        source = bundle / filename
        require(source.is_file(), f'missing {lang} counterpart: {bundle}')
        slug, text = metadata(source)
        if lang == 'en':
            require(bundle.name == slug, f'bundle must use its English slug: {bundle} -> {slug}')
        route = ('en/' if lang == 'en' else '') + slug + '/'
        require(route not in routes, f'duplicate route: {route}')
        routes[route] = source
        pair[lang] = urljoin(base, route)
        sources[(bundle.name, lang)] = text
    for lang, url in pair.items():
        rendered = page(local_file(url))
        require(rendered.attrs('html')[0].get('lang') == lang, f'wrong html language: {url}')
        canonicals = [a.get('href') for a in rendered.attrs('link') if a.get('rel') == 'canonical']
        require(canonicals == [url], f'wrong canonical: {url}')
        alternates = {a.get('hreflang'): a.get('href') for a in rendered.attrs('link')
                      if a.get('rel') == 'alternate' and a.get('hreflang')}
        require(alternates == pair, f'wrong reciprocal alternates: {url}')
        other = pair['en' if lang == 'pt' else 'pt']
        require(any(a.get('href') == other for a in rendered.attrs('a')), f'missing language switch: {url}')
        require(any('data-pagefind-body' in a for _, a in rendered.elements), f'missing search body: {url}')
        require(any(a.get('data-pagefind-filter') == 'type' for _, a in rendered.elements), f'missing post filter: {url}')
        authors = [a for a in rendered.attrs('a') if a.get('rel') == 'author']
        require(len(authors) == 1, f'missing author: {url}')
        author_path = urlsplit(authors[0]['href']).path[len(parsed_base.path):]
        require(author_path.startswith('en/authors/' if lang == 'en' else 'authors/'), f'wrong author language: {url}')
        local_file(authors[0]['href'])
        for a in rendered.attrs('a'):
            if a.get('href'):
                local_file(urljoin(url, a['href']))
        for a in rendered.attrs('img'):
            if a.get('src'):
                local_file(urljoin(url, a['src']))
        for asset in bundle.iterdir():
            if asset.suffix.lower() in ('.png', '.jpg', '.jpeg', '.gif', '.svg') and '.original.' not in asset.name:
                local_file(urljoin(url, asset.name))
        if (bundle / 'index.svg').is_file():
            local_file(urljoin(url, 'index.png'))
        # Positional references explicitly name index.md; they must nevertheless
        # render the destination in the current language, not the source language.
        refs = re.findall(r'{{<\s*ref\s+"posts/([^/]+)/index(?:\.en)?\.md"\s*>}}', sources[(bundle.name, lang)])
        for target in refs:
            slug, _ = metadata(Path('content/posts') / target / ('index.en.md' if lang == 'en' else 'index.md'))
            expected = urljoin(base, ('en/' if lang == 'en' else '') + slug + '/')
            linked = any(urljoin(url, a.get('href', '')).split('#')[0] == expected for a in rendered.attrs('a'))
            # A standalone shortcode emits a plain relative URL, not an <a>.
            bare = urlsplit(expected).path in ''.join(rendered.text)
            require(linked or bare,
                    f'reference not in {lang}: {url} -> {expected}')

entry = json.loads((root / 'pagefind/pagefind-entry.json').read_text())
require(set(entry['languages']) == {'pt', 'en'}, 'Pagefind must contain exactly pt and en')
for lang in ('pt', 'en'):
    require(entry['languages'][lang]['page_count'] == len(bundles), f'incomplete {lang} Pagefind index')

print(f'bilingual: {len(bundles)} pairs / {len(routes)} routes passed (metadata, links, assets, authors, search counts/markup)')
