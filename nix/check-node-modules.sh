#!/usr/bin/env bash
set -euo pipefail

helper="$1"
mkdir managed directory unmanaged

(
	cd managed
	bash "$helper"
	test "$(readlink node_modules)" = "$BLOG_NODE_MODULES"
	bash "$helper"
	ln -sfn /nix/store/old-blog-node-deps-0.1.0/node_modules node_modules
	bash "$helper"
	test "$(readlink node_modules)" = "$BLOG_NODE_MODULES"
)

(
	cd directory
	mkdir node_modules
	touch node_modules/user-work
	if bash "$helper"; then exit 1; fi
	test -f node_modules/user-work
)

(
	cd unmanaged
	ln -s ../directory/node_modules node_modules
	if bash "$helper"; then exit 1; fi
	test "$(readlink node_modules)" = ../directory/node_modules
	test -f node_modules/user-work
)
