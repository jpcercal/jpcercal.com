#!/usr/bin/env bash
# Production output checks shared by native Nix development and container CI.
set -euo pipefail

test -f public/index.html
test -f public/en/index.html
test -f public/404.html
test -f public/pagefind/pagefind-entry.json
test ! -e public/design-system
test ! -e public/search.json

if grep -REil 'lunr|disqus|gtag\(|googletagmanager|formspree|api\.ipify' public --include='*.js'; then
	echo "artifact: forbidden retired dependency or tracker found" >&2
	exit 1
fi

# Historical posts discuss the old stack. Inspect active scripts/forms, not
# article text or ordinary links to old libraries.
python3 - <<'PY'
from html.parser import HTMLParser
from pathlib import Path
import re

forbidden = re.compile(r'lunr|disqus|gtag\(|googletagmanager|formspree|api\.ipify', re.I)

class ActiveResources(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_script = False
        self.resources = []

    def handle_starttag(self, tag, attrs):
        if tag in ('script', 'iframe', 'form'):
            self.resources.extend(value for key, value in attrs if key in ('src', 'action') and value)
        if tag == 'script':
            self.in_script = True

    def handle_endtag(self, tag):
        if tag == 'script':
            self.in_script = False

    def handle_data(self, data):
        if self.in_script:
            self.resources.append(data)

for path in Path('public').rglob('*.html'):
    parser = ActiveResources()
    parser.feed(path.read_text())
    if any(forbidden.search(resource) for resource in parser.resources):
        raise SystemExit(f'artifact: forbidden active resource in {path}')
PY

echo "artifact: production isolation checks passed"
