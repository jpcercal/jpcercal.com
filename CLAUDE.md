# CLAUDE.md

Read `AGENTS.md` first; it holds the repo map, locked decisions and rules.

## Commit and PR attribution

- Never mention Claude or Anthropic in commit messages, PR titles or PR
  descriptions.
- Never add `Co-Authored-By:` trailers or "Generated with ..." / robot-emoji
  footers to commits or PR descriptions.
- `.claude/settings.json` disables the automatic attribution; do not re-enable
  it. CI (`commit-messages` job) and `bin/check-commit-messages.sh` fail on any
  match.
