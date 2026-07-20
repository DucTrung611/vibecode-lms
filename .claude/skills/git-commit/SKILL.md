---
name: git-commit
description: Commit staged/unstaged changes following this repo's Conventional Commits convention, then push to GitHub after confirmation
argument-hint: [optional message override]
---

Commit the current changes to git, following this repo's conventions, then push to the remote.

## 1. Inspect state (run in parallel)
- `git status` (never `-uall`)
- `git diff` (unstaged) and `git diff --staged` (staged)
- `git log --oneline -10` — match this repo's existing message style
- `git branch --show-current`

## 2. Stage deliberately
- Add specific files by path — never `git add -A` or `git add .`.
- After staging, re-run `git status` and eyeball the file list. If anything looks like it could hold a secret (`.env`, `*.pem`, credentials, tokens) even with an innocuous name, open it and check before including it.
- Never stage `.env` (only `.env.example`), `node_modules/`, `dist/`, or other gitignored output.

## 3. Draft the commit message
Follow the Conventional Commits format from `backend-nest-js/docs/BE-PROJECT-RULES.md` §6 / `frontend-reactJs-vite/docs/FE-PROJECT-RULES.md` §7:

```
<type>(<feature>): <description>
```

- `type`: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, etc.
- `feature`: the feature folder or area touched (`quiz`, `enrollment`, `identity`, `init-base`, ...) — omit only if the change is truly cross-cutting.
- `description`: imperative, focused on *why*, not a restatement of the diff.
- If `$ARGUMENTS` is given, use it as the message (or the basis for it) instead of drafting one — but still validate it roughly fits the `<type>(<feature>): <description>` shape.
- One commit per logical change. If the staged diff clearly mixes unrelated concerns, say so and ask whether to split it rather than writing one catch-all message.

## 4. Commit
```
git commit -m "$(cat <<'EOF'
<type>(<feature>): <description>

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```
Do not use `--no-verify`, `--no-gpg-sign`, or `--amend` (amend only if the user explicitly asks).

If a pre-commit hook fails: fix the underlying issue, re-stage, and create a **new** commit — the failed attempt never became a real commit, so amending would target the wrong one.

## 5. Push — ask first, every time
Committing is local and reversible; pushing is visible to others and is not. After a successful commit:
1. Run `git status` to confirm the branch's upstream tracking state.
2. Tell the user what was committed (hash + message) and ask whether to push now.
3. Only on explicit confirmation, push:
   - Existing upstream: `git push`
   - New branch: `git push -u origin <branch>`
4. Never `--force` push without the user explicitly asking for it, and never force-push to `main`/`master` even then without an extra warning.

## Constraints
- Never push directly to `main`/`master` unless the user explicitly says to — this repo's BE/FE PROJECT-RULES.md both require PRs, no direct commits to main.
- If the user asks to also open a PR, use `gh pr create` per the standard PR flow (title < 70 chars, `## Summary` + `## Test plan` body) — this skill only handles commit + push.
