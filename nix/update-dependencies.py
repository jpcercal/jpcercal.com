#!/usr/bin/env python3
"""Trusted companion to Dependabot: commit verified Nix locks, then dispatch CI.

Only lockfile DATA from npm PRs enters the credential-free Nix container.
Native updates use an archive of this trusted checkout, never PR source code.
"""

import argparse
import base64
import io
import json
import os
from pathlib import Path
import re
import subprocess
import tarfile
import tempfile

ROOT = Path(__file__).resolve().parent.parent
# Docker adapter updates must not leave a second bootstrap pin behind.
# Read only the trusted checkout's digest-pinned builder, never a PR Dockerfile.
def bootstrap_image(source):
    images = re.findall(r"^FROM (nixos/nix:[0-9.]+@sha256:[0-9a-f]{64}) AS nix-builder$", source, re.MULTILINE)
    if len(images) != 1:
        raise ValueError("Expected one version-and-digest-pinned Nix builder in Dockerfile")
    return images[0]


NIX_IMAGE = bootstrap_image((ROOT / "Dockerfile").read_text())
NATIVE_BRANCH = "build/nix-toolchain-update"
NPM_FILES = {"package.json", "package-lock.json", "nix/node-deps.nix", "nix/toolchain.nix"}
NATIVE_FILES = {
    "flake.nix", "flake.lock", "package.json", "package-lock.json",
    "nix/node-deps.nix", "nix/toolchain.nix", "nix/check-browser.cjs",
}
HASH = re.compile(r"sha256-[A-Za-z0-9+/]{43}=")
HASH_ASSIGNMENT = re.compile(r'(npmDepsHash = ")sha256-[A-Za-z0-9+/]{43}=(";)')
REVISION = re.compile(r"[0-9a-f]{40}")


def run(command, **kwargs):
    return subprocess.check_output(command, text=True, **kwargs).strip()


def api(repo, path, method="GET", data=None):
    command = ["gh", "api", f"repos/{repo}/{path}", "--method", method]
    if data is not None:
        command += ["--input", "-"]
    value = run(command, input=json.dumps(data) if data is not None else None)
    return json.loads(value) if value else None


def content(repo, path, ref):
    value = api(repo, f"contents/{path}?ref={ref}")
    return base64.b64decode(value["content"]).decode()


def replace_hash(source, value):
    if not HASH.fullmatch(value):
        raise ValueError("prefetch-npm-deps did not return a SHA-256 SRI hash")
    result, count = HASH_ASSIGNMENT.subn(lambda m: m[1] + value + m[2], source)
    if count != 1:
        raise ValueError("Expected exactly one npmDepsHash assignment")
    return result


def same_except_hash(first, second):
    return HASH_ASSIGNMENT.sub(r"\1HASH\2", first) == HASH_ASSIGNMENT.sub(r"\1HASH\2", second)


def revision(lock, name):
    value = lock["nodes"][name]["locked"]["rev"]
    if not REVISION.fullmatch(value):
        raise ValueError(f"Invalid {name} revision")
    return value


def nix(directory, *arguments, writable=False):
    # No GH_TOKEN, checkout credentials, Docker socket, or PR code in this container.
    return run([
        "docker", "run", "--rm",
        "--mount", "type=volume,source=dependency-update-nix,target=/nix",
        "--mount", f"type=bind,source={directory},target=/work" + ("" if writable else ",readonly"),
        "--workdir", "/work", NIX_IMAGE,
        "nix", "--extra-experimental-features", "nix-command flakes", *arguments,
    ])


def prefetch(directory, rev):
    value = nix(directory, "run", f"github:NixOS/nixpkgs/{rev}#prefetch-npm-deps", "--", "/work/package-lock.json")
    if not HASH.fullmatch(value):
        raise ValueError(f"Unexpected prefetch output: {value!r}")
    return value


def commit_files(repo, branch, parent, files, message, create=False):
    """One atomic commit; force=false rejects a branch that moved during hashing."""
    base = api(repo, f"git/commits/{parent}")
    entries = []
    for path, text in sorted(files.items()):
        blob = api(repo, "git/blobs", "POST", {"content": text, "encoding": "utf-8"})
        entries.append({"path": path, "mode": "100644", "type": "blob", "sha": blob["sha"]})
    tree = api(repo, "git/trees", "POST", {"base_tree": base["tree"]["sha"], "tree": entries})
    commit = api(repo, "git/commits", "POST", {"message": message, "tree": tree["sha"], "parents": [parent]})
    if create:
        api(repo, "git/refs", "POST", {"ref": f"refs/heads/{branch}", "sha": commit["sha"]})
    else:
        api(repo, f"git/refs/heads/{branch}", "PATCH", {"sha": commit["sha"], "force": False})
    return commit["sha"]


def dispatch(repo, branch, number):
    api(repo, "actions/workflows/ci.yml/dispatches", "POST", {
        "ref": branch, "inputs": {"pull_request_number": str(number)},
    })


def validate_npm_pr(repo, pr, paths, trusted):
    if pr["user"]["login"] != "dependabot[bot]" or (pr["head"]["repo"] or {}).get("full_name") != repo:
        raise ValueError("Not a same-repository Dependabot PR")
    if pr["base"]["ref"] != "main" or not pr["head"]["ref"].startswith("dependabot/npm_and_yarn/"):
        raise ValueError("Not an npm update against main")
    if "package-lock.json" not in paths or not set(paths) <= NPM_FILES:
        raise ValueError("PR changes files outside the npm-update allowlist; rebase/review it manually")
    # Never clobber independent Nix changes or evaluate an untrusted flake.
    branch = pr["head"]["sha"]
    for path in ("flake.nix", "flake.lock", "nix/toolchain.nix", ".github/workflows/ci.yml"):
        if content(repo, path, branch) != (trusted / path).read_text():
            raise ValueError(f"{path} differs from trusted main; rebase/review the PR")
    source = content(repo, "nix/node-deps.nix", branch)
    if not same_except_hash(source, (trusted / "nix/node-deps.nix").read_text()):
        raise ValueError("PR modifies more than npmDepsHash in node-deps.nix")
    return source


def npm_updates(repo, dry_run):
    rev = revision(json.loads((ROOT / "flake.lock").read_text()), "nixpkgs")
    # Fetch fresh metadata immediately before hashing. Pagination handles >100 PRs/files.
    prs = json.loads(run(["gh", "api", "--paginate", "--slurp", f"repos/{repo}/pulls?state=open&per_page=100"]))
    failures = []
    for pr in [p for page in prs for p in page]:
        if pr["user"]["login"] != "dependabot[bot]" or not pr["head"]["ref"].startswith("dependabot/npm_and_yarn/"):
            continue
        try:
            pages = json.loads(run(["gh", "api", "--paginate", "--slurp", f"repos/{repo}/pulls/{pr['number']}/files?per_page=100"]))
            source = validate_npm_pr(repo, pr, [f["filename"] for page in pages for f in page], ROOT)
            with tempfile.TemporaryDirectory() as directory:
                Path(directory, "package-lock.json").write_text(content(repo, "package-lock.json", pr["head"]["sha"]))
                updated = replace_hash(source, prefetch(directory, rev))
            branch = pr["head"]["ref"]
            # Also recover a missed dispatch if a previous invocation committed then failed.
            head = api(repo, f"pulls/{pr['number']}")
            if head["head"]["sha"] != pr["head"]["sha"]:
                raise ValueError("PR changed while hashing; retry on the next invocation")
            print(f"#{pr['number']}: " + ("hash already synchronized" if source == updated else "synchronize npmDepsHash"), flush=True)
            if dry_run:
                continue
            if source != updated:
                commit_files(repo, branch, pr["head"]["sha"], {"nix/node-deps.nix": updated},
                             "fix(nix): synchronize dependency hash with scheduled npm update")
            # Only dispatch when the current head has no successful/in-progress CI run.
            runs = api(repo, f"actions/workflows/ci.yml/runs?head_sha={head['head']['sha']}&per_page=100")["workflow_runs"]
            if source != updated or not any(r["status"] != "completed" or r["conclusion"] == "success" for r in runs):
                dispatch(repo, branch, pr["number"])
        except (ValueError, subprocess.CalledProcessError) as error:
            print(f"#{pr['number']}: {error}", flush=True)
            failures.append(pr["number"])
    return failures


def replace_once(source, pattern, replacement):
    result, count = re.subn(pattern, lambda m: replacement(m), source)
    if count != 1:
        raise ValueError(f"Expected one version assertion matching {pattern!r}")
    return result


def synchronize_versions(directory, versions):
    for value in versions.values():
        if not re.fullmatch(r"[0-9][0-9A-Za-z.+-]*", value):
            raise ValueError(f"Unexpected package version: {value!r}")
    path = directory / "nix/toolchain.nix"
    source = path.read_text()
    source = replace_once(source, r"(hugo version \| grep 'v)[0-9.]+(\.\*extended')",
                          lambda m: m[1] + versions["hugo"] + m[2])
    for tool in ("oxipng", "oxvg", "resvg", "pagefind", "lychee"):
        source = replace_once(source, rf"({tool} --version \| grep -F )[0-9A-Za-z.+-]+",
                              lambda m, tool=tool: m[1] + versions[tool])
    source = replace_once(source, r"(grep -i 'mozjpeg\.\*)[0-9.]+(')",
                          lambda m: m[1] + versions["mozjpeg"] + m[2])
    source = replace_once(source, r'(assert pkgs.playwright-driver.version == ")[^"]+(";)',
                          lambda m: m[1] + versions["playwright"] + m[2])
    path.write_text(source)
    path = directory / "nix/check-browser.cjs"
    path.write_text(replace_once(path.read_text(), r'(assert.equal\(version, ")[^"]+("\);)',
                                lambda m: m[1] + versions["playwright"] + m[2]))


def prepare_native(directory, rev):
    lock_before = json.loads((directory / "flake.lock").read_text())
    old = revision(lock_before, "nixpkgs")
    path = directory / "flake.nix"
    source = path.read_text()
    if source.count(f'nixpkgs.url = "github:NixOS/nixpkgs/{old}";') != 1:
        raise ValueError("Expected one exact nixpkgs input pin")
    path.write_text(source.replace(f'nixpkgs.url = "github:NixOS/nixpkgs/{old}";',
                                   f'nixpkgs.url = "github:NixOS/nixpkgs/{rev}";'))
    nix(directory, "flake", "lock", writable=True)
    lock = json.loads((directory / "flake.lock").read_text())
    if lock["nodes"]["nodepkgs"] != lock_before["nodes"]["nodepkgs"]:
        raise ValueError("Scheduled native updates must not change the Node pin")
    expression = '''let f = builtins.getFlake "/work";
      p = import f.inputs.nixpkgs { system = builtins.currentSystem; };
      in { hugo = p.hugo.version;
        oxipng = p.oxipng.version; oxvg = p.oxvg.version; resvg = p.resvg.version;
        pagefind = p.pagefind.version; lychee = p.lychee.version;
        mozjpeg = p.mozjpeg.version; playwright = p.playwright-driver.version; }'''
    versions = json.loads(nix(directory, "eval", "--impure", "--json", "--expr", expression))
    synchronize_versions(directory, versions)
    npm_lock = json.loads((directory / "package-lock.json").read_text())
    if npm_lock["packages"]["node_modules/@playwright/test"]["version"] != versions["playwright"]:
        node_rev = revision(lock, "nodepkgs")
        nix(directory, "shell", f"github:NixOS/nixpkgs/{node_rev}#nodejs_26", "--command", "npm", "install",
            "--package-lock-only", "--ignore-scripts", "--no-audit", "--no-fund", "--save-dev", "--save-exact",
            f"@playwright/test@{versions['playwright']}", writable=True)
    path = directory / "nix/node-deps.nix"
    path.write_text(replace_hash(path.read_text(), prefetch(directory, rev)))
    nix(directory, "run", f"github:NixOS/nixpkgs/{rev}#nixfmt", "--", "flake.nix", "nix/toolchain.nix", writable=True)
    # These include exact version assertions, immutable node_modules safety,
    # and an actual Chromium launch. Do not publish an incompatible candidate.
    nix(directory, "flake", "check", "--no-update-lock-file", "-L", writable=True)


def native_update(repo, dry_run):
    existing = api(repo, f"pulls?state=open&head={repo.split('/')[0]}:{NATIVE_BRANCH}")
    if existing:
        print(f"Native proposal #{existing[0]['number']} is still open; do not overwrite it", flush=True)
        if not dry_run:
            dispatch(repo, NATIVE_BRANCH, existing[0]["number"])
        return
    latest = json.loads(run(["gh", "api", "repos/NixOS/nixpkgs/commits/nixos-unstable"]))["sha"]
    if not REVISION.fullmatch(latest):
        raise ValueError("Invalid nixos-unstable revision")
    if latest == revision(json.loads((ROOT / "flake.lock").read_text()), "nixpkgs"):
        print("Native toolchain is already current", flush=True)
        return
    parent = run(["git", "-C", str(ROOT), "rev-parse", "HEAD"])
    archive = subprocess.check_output(["git", "-C", str(ROOT), "archive", "HEAD"])
    with tempfile.TemporaryDirectory() as directory:
        root = Path(directory)
        with tarfile.open(fileobj=io.BytesIO(archive)) as tar:
            tar.extractall(root, filter="data")
        before = {path: (root / path).read_text() for path in NATIVE_FILES}
        prepare_native(root, latest)
        files = {path: (root / path).read_text() for path in NATIVE_FILES if (root / path).read_text() != before[path]}
    print(f"Verified native revision {latest}: {', '.join(sorted(files))}", flush=True)
    if dry_run:
        return
    # A closed proposal leaves its branch behind. Delete only our dedicated bot
    # branch (no open PR) before creating the next proposal from trusted main.
    refs = api(repo, f"git/matching-refs/heads/{NATIVE_BRANCH}")
    if any(ref["ref"] == f"refs/heads/{NATIVE_BRANCH}" for ref in refs):
        api(repo, f"git/refs/heads/{NATIVE_BRANCH}", "DELETE")
    commit_files(repo, NATIVE_BRANCH, parent, files, "build(nix): pin verified native toolchain update", create=True)
    pr = api(repo, "pulls", "POST", {
        "title": "build(nix): update pinned native toolchain", "head": NATIVE_BRANCH, "base": "main",
        "body": f"Scheduled Nix update to `{latest}`.\n\n"
                "- Exact input revision and flake.lock NAR hashes committed.\n"
                "- npmDepsHash recomputed with the new locked nixpkgs.\n"
                "- Native version assertions and paired Playwright npm/browser versions synchronized.\n"
                "- Node pin unchanged; npm install scripts disabled.\n"
                "- Nix flake checks, including a Chromium launch, passed before opening this PR.\n"
                "- CI explicitly dispatched; no automatic merge or production deploy.",
    })
    dispatch(repo, NATIVE_BRANCH, pr["number"])


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--mode", choices=("npm", "native", "all"), default="all")
    parser.add_argument("--dry-run", action="store_true", help="calculate/verify, but never commit, dispatch, or open PRs")
    args = parser.parse_args()
    repo = os.environ.get("GITHUB_REPOSITORY", "jpcercal/jpcercal.com")
    failures = npm_updates(repo, args.dry_run) if args.mode in ("npm", "all") else []
    if args.mode in ("native", "all"):
        native_update(repo, args.dry_run)
    if failures:
        raise SystemExit(f"npm PRs requiring attention: {failures}")


if __name__ == "__main__":
    main()
