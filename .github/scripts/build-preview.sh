#!/usr/bin/env bash
#
# Build the staging preview site into ./public (single definition shared by
# pr-preview.yml fast/full paths and the bot-dispatched ci.yml preview).
#
#   PR_BASE_URL=https://staging.jpcercal.com/pr-<n>/ build-preview.sh fast|full
#
# fast: SKIP_IMAGE_OPTIMIZATION=1 (no lossless size passes).
# full: fully optimized images.
# Run from the repository root with node_modules linked.
set -euo pipefail

mode="${1:-}"
case "$mode" in
fast | full) ;;
*)
	echo "usage: PR_BASE_URL=... $0 fast|full" >&2
	exit 2
	;;
esac

STAGING_HOST="${STAGING_HOST:-https://staging.jpcercal.com}"
: "${PR_BASE_URL:?PR_BASE_URL is required}"

# A wrong base URL still builds "successfully" but publishes broken links, so
# fail early: it must be this PR's directory on the staging host.
if ! [[ "$PR_BASE_URL" =~ ^${STAGING_HOST}/pr-[1-9][0-9]{0,8}/$ ]]; then
	echo "preview: PR_BASE_URL '$PR_BASE_URL' must match $STAGING_HOST/pr-<n>/ (trailing slash required)" >&2
	exit 2
fi

# Hugo Pipes (Dart Sass, Tailwind) resolves binaries via node_modules/.bin.
export PATH="$PWD/node_modules/.bin:$PATH"

step() { echo "::group::$*"; }
endstep() { echo "::endgroup::"; }

rm -rf public content/design-system
# design-system/ lives outside content/ so prod never ships it.
cp -r design-system content/design-system

step "hugo ($mode) -> $PR_BASE_URL"
hugo --buildDrafts --minify --baseURL "$PR_BASE_URL"
endstep

step "images ($mode)"
if [ "$mode" = fast ]; then
	SKIP_IMAGE_OPTIMIZATION=1 bin/build-images.sh
else
	bin/build-images.sh
fi
endstep

step "pagefind"
npm run search:index
endstep

# The prod CNAME (jpcercal.com) must never ship to staging.
rm -f public/CNAME
# Leave the working tree clean for later steps.
rm -rf content/design-system

# Output checks: cheap, and they turn silent bad builds into a clear failure.
fail=0
check() {
	if ! "$@"; then
		echo "::error::preview output check failed: $*"
		fail=1
	fi
}
check test -f public/index.html
check test -f public/design-system/index.html
check test -f public/pagefind/pagefind-entry.json
check test ! -e public/CNAME
# hugo --minify strips attribute quotes, so accept both forms.
check grep -Eq "rel=\"?canonical\"? href=\"?${PR_BASE_URL}" public/index.html
# No page may point at the production host.
if grep -rIl --include='*.html' 'https://jpcercal.com/' public | grep -q .; then
	echo "::error::preview output links to the production host"
	fail=1
fi
[ "$fail" -eq 0 ] || exit 1

{
	echo "### Preview build ($mode)"
	echo "- base URL: \`$PR_BASE_URL\`"
	echo "- pages: $(find public -name index.html | wc -l | tr -d ' ')"
	echo "- size: $(du -sh public | cut -f1)"
} | tee -a "${GITHUB_STEP_SUMMARY:-/dev/null}"
