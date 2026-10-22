#!/usr/bin/env bash
# Fails when commit messages (or PR text) carry tool attribution.
#   bin/check-commit-messages.sh <base>..<head>   # every commit in a range
#   bin/check-commit-messages.sh --file <msgfile> # a single message (commit-msg hook)
# PR_TITLE / PR_BODY, when set, are checked as well.
# Optional local hook: ln -s ../../bin/check-commit-messages.sh .git/hooks/commit-msg
# (the hook passes the message file as the only argument).
set -euo pipefail

pattern='claude|anthropic|co-authored-by:|generated with'
status=0

check() { # label, text
	if printf '%s' "$2" | grep -Eiq "$pattern"; then
		echo "attribution: $1 matches /$pattern/" >&2
		status=1
	fi
}

if [ "${1:-}" = "--file" ]; then
	check "commit message" "$(grep -v '^#' "$2")"
elif [ $# -eq 1 ] && [ "${1#-}" = "$1" ] && [ -e "$1" ] && ! git rev-parse -q --verify "$1^{commit}" >/dev/null 2>&1; then
	# git commit-msg hook invocation: single path argument
	check "commit message" "$(grep -v '^#' "$1")"
elif [ $# -eq 1 ]; then
	while read -r sha; do
		check "commit $sha" "$(git log -1 --format='%an <%ae>%n%cn <%ce>%n%B' "$sha")"
	done < <(git rev-list "$1")
else
	[ -n "${PR_TITLE:-}${PR_BODY:-}" ] || { echo "usage: $0 <range> | --file <msgfile>" >&2; exit 2; }
fi

[ -z "${PR_TITLE:-}" ] || check "PR title" "$PR_TITLE"
[ -z "${PR_BODY:-}" ] || check "PR body" "$PR_BODY"
exit $status
