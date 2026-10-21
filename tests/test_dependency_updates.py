"""Dependency-bot safety/locking regressions; standard library only."""

import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parent.parent
SPEC = importlib.util.spec_from_file_location("updater", ROOT / "nix/update-dependencies.py")
updater = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(updater)
VALID_HASH = "sha256-" + "A" * 43 + "="


def fixture_pr():
    return {
        "number": 1, "user": {"login": "dependabot[bot]"},
        "base": {"ref": "main"},
        "head": {"repo": {"full_name": "owner/repo"}, "ref": "dependabot/npm_and_yarn/test", "sha": "a" * 40},
    }


class DependencyUpdates(unittest.TestCase):
    def test_bootstrap_has_one_source_of_truth_and_rejects_floating_images(self):
        source = (ROOT / "Dockerfile").read_text()
        self.assertEqual(updater.bootstrap_image(source), updater.NIX_IMAGE)
        for invalid in ("FROM nixos/nix:latest AS nix-builder", source + source,
                        source.replace("@sha256:", "@sha512:")):
            with self.assertRaises(ValueError):
                updater.bootstrap_image(invalid)

    def test_hash_replacement_only_changes_one_assignment(self):
        original = (ROOT / "nix/node-deps.nix").read_text()
        updated = updater.replace_hash(original, VALID_HASH)
        self.assertIn(VALID_HASH, updated)
        self.assertTrue(updater.same_except_hash(original, updated))
        for invalid in ("", "sha256-fake", VALID_HASH + "\n", "$(echo attack)"):
            with self.assertRaises(ValueError):
                updater.replace_hash(original, invalid)
        for invalid_source in ("", original + original):
            with self.assertRaises(ValueError):
                updater.replace_hash(invalid_source, VALID_HASH)

    def test_independent_nix_changes_are_not_overwritten(self):
        source = (ROOT / "nix/node-deps.nix").read_text()
        self.assertFalse(updater.same_except_hash(source, source.replace("ignore-scripts", "run-scripts")))

    def test_allowlist_rejects_pr_code_and_forks(self):
        for path in ("flake.nix", "flake.lock", ".github/workflows/ci.yml", "nix/update-dependencies.py", "bin/evil.sh"):
            with self.assertRaises(ValueError):
                updater.validate_npm_pr("owner/repo", fixture_pr(), ["package-lock.json", path], ROOT)
        pr = fixture_pr()
        pr["head"]["repo"]["full_name"] = "attacker/repo"
        with self.assertRaises(ValueError):
            updater.validate_npm_pr("owner/repo", pr, ["package-lock.json"], ROOT)
        pr = fixture_pr()
        pr["user"]["login"] = "attacker"
        with self.assertRaises(ValueError):
            updater.validate_npm_pr("owner/repo", pr, ["package-lock.json"], ROOT)

    def test_only_trusted_nix_inputs_are_used(self):
        def trusted_content(repo, path, ref):
            return (ROOT / path).read_text()
        with patch.object(updater, "content", side_effect=trusted_content):
            result = updater.validate_npm_pr("owner/repo", fixture_pr(), ["package-lock.json"], ROOT)
            self.assertEqual(result, (ROOT / "nix/node-deps.nix").read_text())
        with patch.object(updater, "content", return_value="untrusted flake"):
            with self.assertRaises(ValueError):
                updater.validate_npm_pr("owner/repo", fixture_pr(), ["package-lock.json"], ROOT)

    def test_atomic_commit_never_force_pushes(self):
        responses = iter([{"tree": {"sha": "base"}}, {"sha": "blob"}, {"sha": "tree"}, {"sha": "commit"}, {}])
        with patch.object(updater, "api", side_effect=lambda *a, **k: next(responses)) as api:
            updater.commit_files("owner/repo", "dependabot/test", "parent", {"nix/node-deps.nix": "data"}, "message")
        calls = api.call_args_list
        self.assertEqual(calls[-2].args[3]["parents"], ["parent"])
        self.assertEqual(calls[-1].args[3], {"sha": "commit", "force": False})

    def test_container_receives_no_credentials_or_pr_executables(self):
        with patch.object(updater, "run", return_value=VALID_HASH) as run:
            updater.prefetch("/tmp/lock-data", "a" * 40)
        args = run.call_args.args[0]
        joined = " ".join(args)
        self.assertIn(updater.NIX_IMAGE, args)
        self.assertIn("readonly", joined)
        self.assertIn("github:NixOS/nixpkgs/" + "a" * 40, joined)
        self.assertNotIn("GH_TOKEN", joined)
        self.assertNotIn("docker.sock", joined)
        self.assertNotIn("npm install", joined)

    def test_version_assertions_are_updated_without_changing_node(self):
        with tempfile.TemporaryDirectory() as tmp:
            directory = Path(tmp)
            (directory / "nix").mkdir()
            for filename in ("toolchain.nix", "check-browser.cjs"):
                (directory / "nix" / filename).write_text((ROOT / "nix" / filename).read_text())
            versions = {name: "9.9.9" for name in ("hugo", "oxipng", "oxvg", "resvg", "pagefind", "lychee", "mozjpeg", "playwright")}
            updater.synchronize_versions(directory, versions)
            source = (directory / "nix/toolchain.nix").read_text()
            self.assertIn('assert nodejs.version == "26.8.2";', source)
            self.assertIn("grep -Fx v26.8.2", source)
            self.assertIn('assert pkgs.playwright-driver.version == "9.9.9";', source)
            self.assertIn("grep 'v9.9.9.*extended'", source)
            self.assertIn("grep -i 'mozjpeg.*9.9.9'", source)
            self.assertIn('assert.equal(version, "9.9.9");', (directory / "nix/check-browser.cjs").read_text())
            versions["hugo"] = "$(attack)"
            with self.assertRaises(ValueError):
                updater.synchronize_versions(directory, versions)

    def test_native_prepare_pairs_playwright_and_verifies_before_publish(self):
        with tempfile.TemporaryDirectory() as tmp:
            directory = Path(tmp)
            (directory / "nix").mkdir()
            for path in updater.NATIVE_FILES:
                (directory / path).write_text((ROOT / path).read_text())
            versions = {name: "9.9.9" for name in ("hugo", "oxipng", "oxvg", "resvg", "pagefind", "lychee", "mozjpeg", "playwright")}
            candidate = "a" * 40
            calls = []
            def fake_nix(root, *args, **kwargs):
                calls.append(args)
                if args[:2] == ("flake", "lock"):
                    path = root / "flake.lock"
                    lock = json.loads(path.read_text())
                    lock["nodes"]["nixpkgs"]["locked"]["rev"] = candidate
                    path.write_text(json.dumps(lock))
                if args[0] == "eval":
                    return json.dumps(versions)
                return ""
            before = json.loads((directory / "flake.lock").read_text())["nodes"]["nodepkgs"]
            with patch.object(updater, "nix", side_effect=fake_nix), \
                 patch.object(updater, "prefetch", return_value=VALID_HASH):
                updater.prepare_native(directory, candidate)
            self.assertEqual(json.loads((directory / "flake.lock").read_text())["nodes"]["nodepkgs"], before)
            install = next(args for args in calls if args[0] == "shell")
            self.assertIn("--package-lock-only", install)
            self.assertIn("--ignore-scripts", install)
            self.assertIn("@playwright/test@9.9.9", install)
            self.assertEqual(calls[-1], ("flake", "check", "--no-update-lock-file", "-L"))
            self.assertIn(candidate, (directory / "flake.nix").read_text())
            self.assertIn(VALID_HASH, (directory / "nix/node-deps.nix").read_text())

    def test_pr_race_is_reported_without_a_commit(self):
        pr = fixture_pr()
        moved = fixture_pr()
        moved["head"]["sha"] = "b" * 40
        source = (ROOT / "nix/node-deps.nix").read_text()
        responses = iter([[[pr]], [[{"filename": "package-lock.json"}]]])
        with patch.object(updater, "run", side_effect=lambda *a, **k: json.dumps(next(responses))), \
             patch.object(updater, "validate_npm_pr", return_value=source), \
             patch.object(updater, "content", return_value="{}"), \
             patch.object(updater, "prefetch", return_value=VALID_HASH), \
             patch.object(updater, "api", return_value=moved), \
             patch.object(updater, "commit_files") as commit, \
             patch.object(updater, "dispatch") as dispatch:
            self.assertEqual(updater.npm_updates("owner/repo", dry_run=False), [1])
        commit.assert_not_called()
        dispatch.assert_not_called()

    def test_dry_run_does_not_commit_or_dispatch(self):
        pr = fixture_pr()
        source = (ROOT / "nix/node-deps.nix").read_text()
        responses = iter([[[pr]], [[{"filename": "package-lock.json"}]]])
        with patch.object(updater, "run", side_effect=lambda *a, **k: json.dumps(next(responses))), \
             patch.object(updater, "validate_npm_pr", return_value=source), \
             patch.object(updater, "content", return_value="{}"), \
             patch.object(updater, "prefetch", return_value=VALID_HASH), \
             patch.object(updater, "api", return_value=pr), \
             patch.object(updater, "commit_files") as commit, \
             patch.object(updater, "dispatch") as dispatch:
            self.assertEqual(updater.npm_updates("owner/repo", dry_run=True), [])
        commit.assert_not_called()
        dispatch.assert_not_called()


if __name__ == "__main__":
    unittest.main()
