"""Regression tests for the PR preview workflow helpers (stdlib only)."""

import importlib.util
import os
import subprocess
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCRIPTS = ROOT / ".github" / "scripts"
WORKFLOW = ROOT / ".github" / "workflows" / "pr-preview.yml"

spec = importlib.util.spec_from_file_location("classify_pr", SCRIPTS / "classify-pr.py")
assert spec is not None and spec.loader is not None
classify_pr = importlib.util.module_from_spec(spec)
spec.loader.exec_module(classify_pr)
classify = classify_pr.classify


class ClassifyTests(unittest.TestCase):
    def test_content_and_rendering_paths_are_fast(self):
        for path in (
            "content/posts/a-waf-is-not-a-patch/index.en.md",
            "layouts/partials/navbar.html",
            "assets/scss/post-card.scss",
            "assets/images/favicon/favicon.ico",
            "i18n/en.yaml",
            "design-system/tokens.md",
            "static/fonts/pt-serif-latin-400.woff2",
            "docs/ci-cd-audit.md",
            "README.md",
        ):
            with self.subTest(path=path):
                self.assertEqual(classify([path])[:2], ("fast", False))

    def test_toolchain_inputs_need_image_rebuild(self):
        for path in (
            "Dockerfile",
            ".dockerignore",
            "flake.nix",
            "flake.lock",
            "package.json",
            "package-lock.json",
            "nix/toolchain.nix",
            "bin/nix-node-modules.sh",
        ):
            with self.subTest(path=path):
                self.assertEqual(classify([path, "content/x.md"])[:2], ("full", True))

    def test_infra_config_and_unknown_paths_are_full_without_image(self):
        for path in (
            ".github/workflows/ci.yml",
            ".github/scripts/classify-pr.py",
            "config.yaml",
            "static/_headers",
            "static/_redirects",
            "static/CNAME",
            "static/robots-new.txt",
            "bin/build-images.sh",
            "e2e/smoke.spec.js",
            "tests/test_pr_preview.py",
            "lighthouserc.json",
            "biome.json",
            "something-new.toml",
        ):
            with self.subTest(path=path):
                self.assertEqual(classify([path])[:2], ("full", False))

    def test_one_non_content_file_makes_the_pr_full(self):
        self.assertEqual(classify(["content/a.md", "config.yaml"])[:2], ("full", False))

    def test_prefix_match_is_not_substring_match(self):
        self.assertEqual(classify(["contents/a.md"])[:2], ("full", False))
        self.assertEqual(classify(["docs-evil/a.md"])[:2], ("full", False))
        self.assertEqual(classify(["README.md.sh"])[:2], ("full", False))

    def test_empty_and_truncated_listings_fail_closed(self):
        self.assertEqual(classify([])[0], "full")
        self.assertEqual(classify(["content/a.md"], reported_total=3000)[0], "full")
        self.assertEqual(classify(["content/a.md"], reported_total=2999)[0], "fast")


def git(cwd, *args):
    env = {**os.environ, "GIT_CONFIG_GLOBAL": os.devnull, "GIT_CONFIG_SYSTEM": os.devnull}
    return subprocess.run(
        ["git", *args], cwd=cwd, check=True, capture_output=True, text=True, env=env
    ).stdout.strip()


class PreviewPagesTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        base = Path(self.tmp.name)
        self.remote = base / "remote.git"
        seed = base / "seed"
        git(base, "init", "--bare", "--initial-branch=gh-pages", str(self.remote))
        seed.mkdir()
        git(seed, "init", "--initial-branch=gh-pages")
        (seed / "CNAME").write_text("staging.jpcercal.com\n")
        (seed / "index.html").write_text("legacy root\n")
        (seed / "pr-7").mkdir()
        (seed / "pr-7" / "index.html").write_text("other preview\n")
        git(seed, "add", "-A")
        git(seed, "-c", "user.name=t", "-c", "user.email=t@t", "commit", "-m", "seed")
        git(seed, "push", str(self.remote), "gh-pages")
        self.base = base

    def clone(self, name):
        path = self.base / name
        url = self.remote.as_uri()
        git(self.base, "-c", "protocol.file.allow=always", "clone", "--quiet", "--depth", "1", "--branch", "gh-pages", url, str(path))
        return path

    def site(self, name, files):
        path = self.base / name
        for rel, text in files.items():
            target = path / rel
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text(text)
        return path

    def run_script(self, cwd, *args, **extra):
        env = {
            **os.environ,
            "GIT_CONFIG_GLOBAL": os.devnull,
            "GIT_CONFIG_SYSTEM": os.devnull,
            "PUSH_ATTEMPTS": "4",
            "PUSH_RETRY_DELAY": "0",
            **extra,
        }
        return subprocess.run(
            ["bash", str(SCRIPTS / "preview-pages.sh"), *args],
            cwd=cwd, capture_output=True, text=True, env=env,
        )

    def remote_files(self):
        return set(git(self.remote, "ls-tree", "-r", "--name-only", "gh-pages").splitlines())

    def test_publish_replaces_only_its_directory_and_drops_stale_files(self):
        clone = self.clone("c1")
        first = self.site("s1", {"index.html": "v1", "old.html": "old", "CNAME": "jpcercal.com"})
        done = self.run_script(clone, "publish", "5", str(first), "abc")
        self.assertEqual(done.returncode, 0, done.stderr)
        self.assertEqual(
            self.remote_files(),
            {"CNAME", "index.html", "pr-7/index.html", "pr-5/index.html", "pr-5/old.html"},
        )
        second = self.site("s2", {"index.html": "v2"})
        clone2 = self.clone("c2")
        done = self.run_script(clone2, "publish", "5", str(second), "def")
        self.assertEqual(done.returncode, 0, done.stderr)
        files = self.remote_files()
        self.assertIn("pr-5/index.html", files)
        self.assertNotIn("pr-5/old.html", files)
        self.assertIn("pr-7/index.html", files)
        self.assertEqual(git(self.remote, "show", "gh-pages:CNAME"), "staging.jpcercal.com")

    def test_unchanged_publish_creates_no_commit(self):
        site = self.site("s", {"index.html": "same"})
        self.assertEqual(self.run_script(self.clone("c1"), "publish", "5", str(site), "a").returncode, 0)
        head = git(self.remote, "rev-parse", "gh-pages")
        self.assertEqual(self.run_script(self.clone("c2"), "publish", "5", str(site), "b").returncode, 0)
        self.assertEqual(git(self.remote, "rev-parse", "gh-pages"), head)

    def test_rejected_push_is_retried_from_fresh_remote(self):
        stale = self.clone("stale")
        racer = self.clone("racer")
        self.assertEqual(
            self.run_script(racer, "publish", "8", str(self.site("s8", {"index.html": "8"})), "r").returncode, 0
        )
        done = self.run_script(stale, "publish", "9", str(self.site("s9", {"index.html": "9"})), "s", PUSH_ATTEMPTS="3")
        self.assertEqual(done.returncode, 0, done.stderr)
        self.assertIn("retrying", done.stderr)
        files = self.remote_files()
        self.assertTrue({"pr-8/index.html", "pr-9/index.html", "pr-7/index.html"} <= files)

    def test_remove_deletes_only_that_directory(self):
        site = self.site("s", {"index.html": "x"})
        self.assertEqual(self.run_script(self.clone("c1"), "publish", "5", str(site), "a").returncode, 0)
        done = self.run_script(self.clone("c2"), "remove", "5")
        self.assertEqual(done.returncode, 0, done.stderr)
        self.assertEqual(self.remote_files(), {"CNAME", "index.html", "pr-7/index.html"})
        # Removing a missing preview is a no-op, not a failure.
        self.assertEqual(self.run_script(self.clone("c3"), "remove", "5").returncode, 0)

    def test_rejects_bad_numbers_symlinks_and_empty_sites(self):
        clone = self.clone("c")
        site = self.site("s", {"index.html": "x"})
        for bad in ("", "0", "../x", "5/../../x", "05", "5;rm"):
            with self.subTest(number=bad):
                self.assertEqual(self.run_script(clone, "publish", bad, str(site), "a").returncode, 2)
                self.assertEqual(self.run_script(clone, "remove", bad).returncode, 2)
        os.symlink("/etc/passwd", site / "link")
        self.assertEqual(self.run_script(clone, "publish", "5", str(site), "a").returncode, 2)
        empty = self.site("empty", {"other.html": "x"})
        self.assertEqual(self.run_script(clone, "publish", "5", str(empty), "a").returncode, 2)
        self.assertEqual(self.remote_files(), {"CNAME", "index.html", "pr-7/index.html"})


class WorkflowStructureTests(unittest.TestCase):
    """Cheap textual guards; the YAML itself is validated by CI/actionlint."""

    @classmethod
    def setUpClass(cls):
        raw = WORKFLOW.read_text()
        # Comments may legitimately mention forbidden words.
        cls.text = "\n".join(line for line in raw.splitlines() if not line.lstrip().startswith("#"))

    def job(self, name):
        start = self.text.index(f"\n  {name}:\n")
        rest = self.text[start + 1 :]
        stops = [rest.find(f"\n  {n}:\n", 1) for n in ("classify", "image", "build-fast", "build-full", "gate", "publish", "comment", "cleanup")]
        stops = [s for s in stops if s > 0]
        return rest[: min(stops)] if stops else rest

    def test_fast_job_has_no_docker_build_or_check_steps(self):
        fast = self.job("build-fast")
        for forbidden in ("docker/", "build-push-action", "buildx", "npm run lint", "validate:", "lychee", "lhci", "e2e", "unittest", "playwright"):
            self.assertNotIn(forbidden, fast)
        self.assertIn("SKIP_IMAGE_OPTIMIZATION", fast)

    def test_no_repository_secrets_and_no_target_trigger(self):
        self.assertNotIn("pull_request_target", self.text)
        self.assertNotIn("CLOUDFLARE", self.text)
        import re

        self.assertEqual(re.findall(r"secrets\.[A-Za-z_]+", self.text), [])  # only github.token is used

    def test_every_job_guards_forks_and_declares_permissions(self):
        for name in ("classify", "image", "build-fast", "build-full", "publish", "comment", "cleanup"):
            block = self.job(name)
            self.assertIn("permissions:", block, name)
            self.assertIn("head.repo.full_name == github.repository", block, name)

    def test_required_build_check_is_reported_and_fails_closed(self):
        # Branch protection requires a check named `Build`; ci.yml no longer runs on PRs.
        gate = self.job("gate")
        self.assertIn("name: Build\n", gate)
        self.assertIn("exit 1", gate)
        self.assertIn("!cancelled()", gate)
        for need in ("classify", "image", "build-fast", "build-full"):
            self.assertIn(need, gate.split("steps:")[0], need)

    def test_ci_workflow_runs_only_on_main_and_bot_dispatch(self):
        import re

        ci = (WORKFLOW.parent / "ci.yml").read_text()
        triggers = ci.split("\njobs:")[0]
        self.assertNotIn("pull_request:", re.sub(r"(?m)^\s*#.*$", "", triggers))
        self.assertIn("push:", triggers)
        self.assertIn("workflow_dispatch:", triggers)
        # Only main may move the mutable :latest tag the fast path consumes.
        self.assertIn("github.ref == 'refs/heads/main'", ci.split("tags: |")[1].split("cache-from")[0])


if __name__ == "__main__":
    unittest.main()
