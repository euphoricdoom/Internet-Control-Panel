# GitHub Workflow Guide

This repo is designed so ChatGPT, Copilot/Codex, and the user can all work directly against GitHub without losing project discipline.

## The mental model

- **main** is the current stable line.
- **Issues** are work orders.
- **Pull Requests** are reviewable change packages.
- **Actions** are automatic checks.
- **Commits** are saved checkpoints.
- **Docs** are the project memory.

## Day-to-day workflow

1. Create or choose an issue.
2. Implement the smallest useful change.
3. Keep the change tied to the issue.
4. Let GitHub Actions run `npm run healthcheck`.
5. Review changed files.
6. Merge only when the repo still matches the docs and roadmap.

## When using ChatGPT direct GitHub commits

Use this when the change is small and low risk:

- documentation updates
- healthcheck updates
- tiny bug fixes
- issue creation
- workflow docs
- roadmap maintenance

ChatGPT should report:

- files changed
- commit SHA
- what changed
- risks
- what to test locally

## When using Copilot/Codex

Use Copilot/Codex when the change requires larger coordinated code edits:

- multi-file refactors
- new feature phases
- popup/content/background behavior changes
- command palette work
- local ledger viewer work

Codex should receive an issue-scoped prompt and must read the source-of-truth docs first.

## Source-of-truth docs

Agents must read these before meaningful implementation:

- `README.md`
- `PROJECT_BRIEF.md`
- `ARCHITECTURE.md`
- `ROADMAP.md`
- `CURRENT_STATE.md`
- `DECISIONS.md`
- `AGENT_PROTOCOL.md`
- `SECURITY_PRIVACY.md`
- `TEST_PLAN.md`

## Branch rule

For low-risk repo maintenance, direct commits to `main` are acceptable while the project is young.

For larger changes, use branches:

- `phase-1-stable-shell`
- `phase-2-overlay-kernel`
- `phase-3-command-palette`

Then open a PR back into `main`.

## Issue labels

Suggested labels:

- `phase-1`
- `phase-2`
- `phase-3`
- `stability`
- `docs`
- `healthcheck`
- `bug`
- `enhancement`
- `privacy`
- `blocked`

## Release rhythm

- `0.1.0` — initial baseline
- `0.1.1` — Phase 1 hardening start
- `0.2.0` — stable shell complete
- `0.3.0` — overlay kernel improvements
- `0.4.0` — command palette
- `0.5.0` — local ledger viewer

## Golden rule

Do not let GitHub become a junk drawer. Every change should be attached to a phase, issue, or documented decision.
