#!/usr/bin/env python3
"""Classify the files changed by a PR for the preview workflow.

Reads one changed path per line on stdin (the PR files API, including
`previous_filename` of renames) and writes `mode`, `toolchain` and `reason`
to $GITHUB_OUTPUT (or stdout when unset).

  mode=fast       every changed file is a site-content/rendering or docs file;
                  the preview needs only the cached CI image and a Hugo build.
  mode=full       anything else (infra, config, pipeline, tests, unknown paths).
  toolchain=true  the CI image inputs changed, so the image must be rebuilt
                  (implies mode=full).

The lists are explicit and fail closed: a path that matches none of them is
"full". Directory entries match by prefix, other entries match exactly.
"""

import os
import sys

# Inputs of the CI image (Dockerfile COPY lines + .dockerignore allow-list).
TOOLCHAIN_DIRS = ("nix/",)
TOOLCHAIN_FILES = frozenset(
    {
        "Dockerfile",
        ".dockerignore",
        "flake.nix",
        "flake.lock",
        "package.json",
        "package-lock.json",
        "bin/nix-node-modules.sh",
    }
)

# Pure site content and rendering inputs: Hugo + the baked toolchain suffice.
FAST_DIRS = (
    "content/",
    "layouts/",
    "assets/",
    "i18n/",
    "data/",
    "archetypes/",
    "design-system/",
    "static/fonts/",
    "docs/",
)
# Not part of the site output; a preview is still cheap and harmless.
FAST_FILES = frozenset({"README.md", "AGENTS.md", "LICENSE"})

# GitHub's PR files API stops at 3000 files; beyond that the list is partial.
API_FILE_LIMIT = 3000


def matches(path, dirs, files):
    return path in files or path.startswith(dirs)


def classify(paths, reported_total=None):
    paths = sorted({p.strip() for p in paths if p.strip()})
    if not paths:
        return "full", False, "no changed files reported"
    if reported_total is not None and reported_total >= API_FILE_LIMIT:
        return "full", False, f"{reported_total} changed files exceeds the API listing limit"

    toolchain = [p for p in paths if matches(p, TOOLCHAIN_DIRS, TOOLCHAIN_FILES)]
    if toolchain:
        return "full", True, f"toolchain input changed: {toolchain[0]}"

    other = [p for p in paths if not matches(p, FAST_DIRS, FAST_FILES)]
    if other:
        return "full", False, f"non-content path changed: {other[0]}"

    return "fast", False, f"{len(paths)} content/docs path(s) only"


def main():
    total = os.environ.get("CHANGED_FILES_COUNT", "")
    reported = int(total) if total.isdigit() else None
    mode, toolchain, reason = classify(sys.stdin.read().splitlines(), reported)
    lines = [f"mode={mode}", f"toolchain={str(toolchain).lower()}", f"reason={reason}"]
    out = os.environ.get("GITHUB_OUTPUT")
    if out:
        with open(out, "a", encoding="utf-8") as handle:
            handle.write("\n".join(lines) + "\n")
    print("\n".join(lines))


if __name__ == "__main__":
    main()
