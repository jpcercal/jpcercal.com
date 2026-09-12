#!/usr/bin/env bash
#
# Production verification suite for the Cloudflare Pages deployment.
# Runs in the blocking `cloudflare-pages` CI job AFTER `deploy`.
# Every check is a CLAIM about the live site; failures are collected
# and reported as a summary table, exit 1 if anything failed.
#
# Required on PATH: curl, python3, xmllint, lychee, node/npx (lhci),
# Chrome (CHROME_PATH for LHCI). Override the target with BASE_URL.
#
set -uo pipefail

BASE_URL="${BASE_URL:-https://jpcercal.com/}"
BASE_URL="${BASE_URL%/}/"
PASS=0
FAIL=0
FAILED_CHECKS=()

pass() { PASS=$((PASS + 1)); echo "PASS: $1"; }
fail() {
	FAIL=$((FAIL + 1))
	FAILED_CHECKS+=("$1")
	echo "FAIL: $1${2:+ ($2)}"
}

echo "== verify-pages: target $BASE_URL =="

# 0. Propagation wait: the deploy just landed, allow Pages to converge.
echo "-- propagation wait --"
READY=0
for _ in $(seq 1 30); do
	if curl -fsSL -o /dev/null --max-time 10 "$BASE_URL"; then READY=1; break; fi
	sleep 10
done
if [ "$READY" = "1" ]; then pass "site responds 200"; else fail "site responds 200"; fi

HTML_DIR="$(mktemp -d)"
trap 'rm -rf "$HTML_DIR"' EXIT
curl -fsSL --compressed --max-time 30 "$BASE_URL" -o "$HTML_DIR/index.html" || fail "fetch homepage"
# The JS bundle only loads on the search page — fetch it for asset checks.
curl -fsSL --compressed --max-time 30 "${BASE_URL}search/" -o "$HTML_DIR/search.html" || fail "fetch search page"

CSS_URL="$(grep -oE '/css/[^"]+\.css' "$HTML_DIR/index.html" | head -1)"
JS_URL="$(grep -oE '/js/[^"]+\.js' "$HTML_DIR/search.html" | head -1)"
# Assets are root-relative; BASE_URL keeps its trailing slash.
CSS_URL="${CSS_URL#/}"
JS_URL="${JS_URL#/}"

# 1. Compression gates: Pages negotiates Brotli/Zstd, both accepted.
echo "-- compression (br|zstd accepted) --"
for target in "$BASE_URL" "$BASE_URL$CSS_URL" "$BASE_URL$JS_URL"; do
	ENC="$(curl -s -o /dev/null -D - --max-time 20 -H 'Accept-Encoding: br' "$target" | grep -i '^content-encoding:' | tr -d '\r' | awk '{print $2}')"
	case "$ENC" in
	br | zstd) pass "compressed $target ($ENC)" ;;
	*) fail "compressed $target" "got '${ENC:-none}'" ;;
	esac
done

# 2. HTTP/2 + HTTP/3 (alt-svc) headers.
echo "-- protocols --"
VER="$(curl --http2 -s -o /dev/null -w '%{http_version}' --max-time 20 "$BASE_URL")"
[ "$VER" = "2" ] && pass "HTTP/2 served" || fail "HTTP/2 served" "got $VER"
ALTSVC="$(curl -s -o /dev/null -D - --max-time 20 "$BASE_URL" | grep -i '^alt-svc:' | tr -d '\r')"
case "$ALTSVC" in
*h3*) pass "alt-svc advertises h3" ;;
*) fail "alt-svc advertises h3" "got '${ALTSVC:-none}'" ;;
esac

# 3. Immutable long-cache + fingerprinted bundle names.
echo "-- immutable cache --"
for asset in "$CSS_URL" "$JS_URL"; do
	CC="$(curl -s -o /dev/null -D - --max-time 20 "$BASE_URL$asset" | grep -i '^cache-control:' | tr -d '\r')"
	case "$CC" in
	*immutable*) pass "immutable $asset" ;;
	*) fail "immutable $asset" "got '${CC:-none}'" ;;
	esac
done
case "$CSS_URL $JS_URL" in
*[a-f0-9][a-f0-9][a-f0-9][a-f0-9]*) pass "fingerprinted asset names" ;;
*) fail "fingerprinted asset names" ;;
esac

# 4. TTFB < 1.0s median over 5 samples.
echo "-- TTFB --"
TTFB="$(for _ in 1 2 3 4 5; do curl -s -o /dev/null -w '%{time_starttransfer}\n' --max-time 20 "$BASE_URL"; done | sort -n | sed -n '3p')"
python3 -c "import sys; sys.exit(0 if float('$TTFB') < 1.0 else 1)" \
	&& pass "TTFB ${TTFB}s < 1.0s median" || fail "TTFB ${TTFB}s < 1.0s median"

# 5. Payload budgets: no legacy/search artifacts, no tracker remnants,
#    Pagefind present, design-system absent.
echo "-- payload budgets --"
code_of() { curl -s -o /dev/null -w '%{http_code}' --max-time 20 "$BASE_URL$1"; }
[ "$(code_of 'search.json')" = "404" ] && pass "no search.json" || fail "no search.json"
[ "$(code_of 'design-system/')" = "404" ] && pass "no design-system/" || fail "no design-system/"
[ "$(code_of 'pagefind/pagefind-entry.json')" = "200" ] && pass "pagefind index live" || fail "pagefind index live"
for needle in 'disqus' 'gtag(' 'googletagmanager' 'formspree' 'api.ipify' 'lunr'; do
	if grep -qi "$needle" "$HTML_DIR/index.html"; then fail "no $needle remnant"; else pass "no $needle remnant"; fi
done

# 6. SEO: robots, sitemap (xmllint), hreflang, JSON-LD.
echo "-- SEO --"
ROBOTS="$(curl -fsSL --max-time 20 "$BASE_URL/robots.txt" || true)"
case "$ROBOTS" in
*"Disallow: /search/"* | *"Disallow: /contact/"*) pass "robots disallows search/contact" ;;
*) fail "robots disallows search/contact" ;;
esac
case "$ROBOTS" in
*Sitemap*) pass "robots references sitemap" ;;
*) fail "robots references sitemap" ;;
esac
curl -fsSL --max-time 30 "$BASE_URL/sitemap.xml" -o "$HTML_DIR/sitemap.xml" || fail "fetch sitemap.xml"
if xmllint --noout "$HTML_DIR/sitemap.xml" 2>/dev/null; then
	pass "sitemap.xml well-formed"
	if grep -E '/(search|contact)/' "$HTML_DIR/sitemap.xml" | grep -q '<loc>'; then
		fail "sitemap excludes search/contact"
	else
		pass "sitemap excludes search/contact"
	fi
else
	fail "sitemap.xml well-formed"
fi
grep -q 'hreflang=' "$HTML_DIR/index.html" \
	&& pass "hreflang present" || fail "hreflang present"
python3 - "$HTML_DIR/index.html" <<'EOF' && pass "JSON-LD valid" || fail "JSON-LD valid"
import json, re, sys
html = open(sys.argv[1]).read()
blocks = re.findall(r'ld\+json>(.*?)</script>', html, re.S)
assert blocks, "no JSON-LD block"
for b in blocks:
    json.loads(b)
EOF

# 7. Links + markup on the live homepage.
echo "-- links + markup --"
if lychee --config .lychee.toml --no-progress "$BASE_URL" 2>&1 | tail -2; then
	pass "lychee live homepage"
else
	fail "lychee live homepage"
fi
if ./node_modules/.bin/html-validate --stdin-filename=index.html --stdin <"$HTML_DIR/index.html" >/dev/null 2>&1; then
	pass "html-validate live homepage"
else
	fail "html-validate live homepage"
fi

# 8. LHCI (perf + SEO blocking per lighthouserc.json, live URLs).
# LHCI_CHROME_FLAGS (space-separated, e.g. "--no-sandbox" for rootful
# containers) is unset in normal runs, keeping the Chrome sandbox on.
echo "-- LHCI --"
LHCI_CHROME_FLAGS_ARR=()
if [ -n "${LHCI_CHROME_FLAGS:-}" ]; then
	# shellcheck disable=SC2206
	for flag in ${LHCI_CHROME_FLAGS}; do
		LHCI_CHROME_FLAGS_ARR+=(--collect.settings.chromeFlags="$flag")
	done
fi
if ./node_modules/.bin/lhci autorun \
	--collect.url="$BASE_URL/" \
	--collect.url="$BASE_URL/en/" \
	--collect.url="$BASE_URL/revisitando-o-layout-e-o-projeto-do-blog/" \
	${LHCI_CHROME_FLAGS_ARR[@]+"${LHCI_CHROME_FLAGS_ARR[@]}"}; then
	pass "LHCI assertions"
else
	fail "LHCI assertions"
fi

# Summary table.
echo
echo "== verify-pages summary: $PASS passed, $FAIL failed =="
for c in ${FAILED_CHECKS[@]+"${FAILED_CHECKS[@]}"}; do echo "  FAILED: $c"; done
if [ -f "$GITHUB_STEP_SUMMARY" ]; then
	{
		echo "## Pages verification ($BASE_URL)"
		echo
		echo "| result | count |"
		echo "|---|---|"
		echo "| passed | $PASS |"
		echo "| failed | $FAIL |"
		for c in ${FAILED_CHECKS[@]+"${FAILED_CHECKS[@]}"}; do echo "| FAILED: $c | |"; done
	} >>"$GITHUB_STEP_SUMMARY"
fi
[ "$FAIL" = "0" ]
