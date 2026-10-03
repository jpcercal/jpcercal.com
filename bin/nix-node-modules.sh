#!/usr/bin/env bash
# Only replace links owned by this integration; never remove an npm installation.
set -euo pipefail

: "${BLOG_NODE_MODULES:?enter nix develop or enable direnv first}"

if [[ -L node_modules ]]; then
	case "$(readlink node_modules)" in
	/nix/store/*-blog-node-deps-*/node_modules | /opt/ci/node_modules)
		ln -sfn "$BLOG_NODE_MODULES" node_modules
		;;
	*)
		echo "nix: node_modules is an unmanaged link; move it aside before entering the shell" >&2
		exit 1
		;;
	esac
elif [[ -e node_modules ]]; then
	echo "nix: node_modules already exists; move it aside before entering the shell" >&2
	exit 1
else
	ln -s "$BLOG_NODE_MODULES" node_modules
fi
