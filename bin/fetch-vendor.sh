#!/usr/bin/env bash
#
# Fetches front-end vendor sources that are consumed straight from
# node_modules by the Grunt build (see grunt/copy.yaml and
# assets/less/syntax-highlight.less).
#
# This replaces `npm run napa`: napa clones via the unauthenticated
# git:// protocol, which GitHub retired in 2022, so installs hang and
# then fail. Plain https clones are the supported equivalent.
#
set -euo pipefail

clone_if_missing() {
  local repo="$1"
  local dest="$2"
  if [ -d "$dest" ]; then
    echo "vendor: $dest already present, skipping."
  else
    echo "vendor: cloning $repo into $dest ..."
    git clone --depth 1 "https://github.com/${repo}.git" "$dest"
  fi
}

clone_if_missing "osvaldasvalutis/disqusLoader.js" "node_modules/disqus-loader"

echo "vendor: done."
