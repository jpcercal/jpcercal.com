#!/usr/bin/env bash
#
# Publish or remove one PR preview directory on the gh-pages branch.
#
#   preview-pages.sh publish <pr-number> <site-dir> <commit-sha>
#   preview-pages.sh remove  <pr-number>
#
# Must run inside a (sparse, shallow, partial) clone of gh-pages whose
# `origin` can push; only `pr-<number>/` is ever touched. The root site,
# CNAME and every other pr-* directory stay untouched.
#
# Pushes from different PRs race on the same branch, so a rejected push is
# retried from a fresh fetch instead of relying on a (lossy) concurrency group.
set -euo pipefail

BRANCH="${PAGES_BRANCH:-gh-pages}"
ATTEMPTS="${PUSH_ATTEMPTS:-6}"
AUTHOR=(-c user.name="github-actions[bot]" -c user.email="41898282+github-actions[bot]@users.noreply.github.com")

mode="${1:-}"
number="${2:-}"
if ! [[ "$number" =~ ^[1-9][0-9]{0,8}$ ]]; then
	echo "preview: invalid PR number '$number'" >&2
	exit 2
fi
dir="pr-$number"

# Sparse clones only materialize the paths they were told about; make sure
# ours is one of them so `git rm` / `git add` see the existing directory.
if [ "$(git config --get core.sparseCheckout || true)" = "true" ]; then
	git sparse-checkout add "$dir"
fi

refresh() {
	git fetch --quiet --depth 1 origin "$BRANCH"
	git reset --quiet --hard FETCH_HEAD
}

push_with_retry() {
	local attempt=1
	until git push --quiet origin "HEAD:refs/heads/$BRANCH"; do
		if [ "$attempt" -ge "$ATTEMPTS" ]; then
			echo "preview: push still rejected after $attempt attempts" >&2
			return 1
		fi
		echo "preview: push rejected (attempt $attempt), refreshing and retrying" >&2
		sleep "${PUSH_RETRY_DELAY:-$((attempt + RANDOM % 4))}"
		refresh
		"$1"
		attempt=$((attempt + 1))
	done
}

apply_publish() {
	rm -rf -- "$dir"
	mkdir -p -- "$dir"
	cp -a -- "$site/." "$dir/"
	git add -A -- "$dir"
	if git diff --cached --quiet; then
		return 0
	fi
	git "${AUTHOR[@]}" commit --quiet -m "preview: $dir @ ${sha}"
}

apply_remove() {
	git rm -r --quiet --ignore-unmatch -- "$dir"
	if git diff --cached --quiet; then
		return 0
	fi
	git "${AUTHOR[@]}" commit --quiet -m "preview: remove $dir"
}

case "$mode" in
publish)
	site="${3:?site dir required}"
	sha="${4:?commit sha required}"
	[ -f "$site/index.html" ] || {
		echo "preview: $site/index.html missing, refusing to publish" >&2
		exit 2
	}
	# The artifact is produced by PR code: never publish links, and never let
	# the production CNAME replace the staging one.
	if [ -n "$(find "$site" -type l -print -quit)" ]; then
		echo "preview: symlinks in artifact, refusing to publish" >&2
		exit 2
	fi
	rm -f -- "$site/CNAME"
	apply=apply_publish
	;;
remove)
	apply=apply_remove
	;;
*)
	echo "usage: $0 publish <pr> <site-dir> <sha> | remove <pr>" >&2
	exit 2
	;;
esac

"$apply"
if [ "$(git rev-parse HEAD)" = "$(git rev-parse "origin/$BRANCH" 2>/dev/null || true)" ]; then
	echo "preview: $dir already up to date, nothing to push"
	exit 0
fi
push_with_retry "$apply"
echo "preview: $mode $dir done"
